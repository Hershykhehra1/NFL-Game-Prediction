"""Leakage-free NFL weekly winner forecasting utilities.

The workflow uses schedule data plus completed play-by-play data.  It never uses
an outcome or a play from the game that is being predicted as a feature.
"""

from collections import defaultdict

import numpy as np
import pandas as pd
import nflreadpy as nfl
from sklearn.calibration import CalibratedClassifierCV
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import accuracy_score, brier_score_loss, log_loss
from sklearn.model_selection import TimeSeriesSplit
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler


FEATURES = [
    "elo_diff",
    "win_pct_diff",
    "point_diff_diff",
    "recent_margin_diff",
    "net_epa_diff",
    "net_success_diff",
    "turnover_rate_diff",
    "rest_diff",
    "neutral_site",
]


def load_inputs(start_season: int, predict_season: int):
    """Load only regular-season schedule and the PBP fields used by this model."""
    seasons = list(range(start_season, predict_season + 1))
    schedule = nfl.load_schedules(seasons).to_pandas()
    schedule = schedule.loc[schedule["game_type"].eq("REG")].copy()
    schedule["gameday"] = pd.to_datetime(schedule["gameday"])
    schedule = schedule.sort_values(
        ["season", "gameday", "gametime", "game_id"], na_position="last"
    )

    # Selecting before converting to pandas prevents a much larger memory spike.
    pbp_polars = nfl.load_pbp(seasons)
    wanted = [
        "game_id", "posteam", "defteam", "play_type", "epa", "success",
        "interception", "fumble_lost", "qb_kneel", "two_point_attempt",
    ]
    pbp = pbp_polars.select([column for column in wanted if column in pbp_polars.columns]).to_pandas()
    return schedule, pbp


def make_game_metrics(pbp: pd.DataFrame) -> dict[tuple[str, str], dict[str, float]]:
    """Return offense and defense quality for each completed team game.

    EPA and success rate measure down-to-down quality more directly than points,
    while turnover rate captures a separate, predictive part of team performance.
    """
    plays = pbp.loc[
        pbp["play_type"].isin(["pass", "run"])
        & pbp["posteam"].notna()
        & pbp["defteam"].notna()
        & pbp["epa"].notna()
    ].copy()
    if "qb_kneel" in plays:
        plays = plays.loc[plays["qb_kneel"].fillna(0).eq(0)]
    if "two_point_attempt" in plays:
        plays = plays.loc[plays["two_point_attempt"].fillna(0).eq(0)]
    plays["turnover"] = plays["interception"].fillna(0) + plays["fumble_lost"].fillna(0)

    aggregations = {"epa": "mean", "success": "mean", "turnover": "mean"}
    offense = plays.groupby(["game_id", "posteam"], as_index=False).agg(aggregations)
    offense = offense.rename(columns={
        "posteam": "team", "epa": "off_epa", "success": "off_success", "turnover": "off_turnover"
    })
    defense = plays.groupby(["game_id", "defteam"], as_index=False).agg(aggregations)
    defense = defense.rename(columns={
        "defteam": "team", "epa": "def_epa", "success": "def_success", "turnover": "def_takeaway"
    })
    metrics = offense.merge(defense, on=["game_id", "team"], how="outer").fillna(0)
    return {
        (row.game_id, row.team): row._asdict()
        for row in metrics.itertuples(index=False)
    }


def build_pregame_features(schedule: pd.DataFrame, game_metrics: dict) -> pd.DataFrame:
    """Create one feature row per game, then update state only after completed games."""
    ratings = defaultdict(lambda: 1500.0)
    state = defaultdict(lambda: {
        "games": 0, "wins": 0, "pf": 0.0, "pa": 0.0,
        "recent_margins": [], "net_epa": 0.0, "net_success": 0.0, "turnover": 0.0,
        "last_game": pd.NaT,
    })
    rows, active_season = [], None

    def average(team, key):
        item = state[team]
        return item[key] if item["games"] else 0.0

    for game in schedule.itertuples(index=False):
        if active_season != game.season:
            if active_season is not None:
                # Retain some enduring quality but avoid treating last year's team as unchanged.
                for team in list(ratings):
                    ratings[team] = 1500 + 0.75 * (ratings[team] - 1500)
                for team in list(state):
                    for key in ("net_epa", "net_success", "turnover"):
                        state[team][key] *= 0.45
                    state[team].update({"games": 0, "wins": 0, "pf": 0.0, "pa": 0.0, "recent_margins": [], "last_game": pd.NaT})
            active_season = game.season

        home, away = game.home_team, game.away_team
        is_neutral = int(getattr(game, "location", "Home") == "Neutral")
        home_advantage = 0 if is_neutral else 55
        elo_diff = ratings[home] - ratings[away] + home_advantage
        home_rest = 0 if pd.isna(state[home]["last_game"]) else min((game.gameday - state[home]["last_game"]).days, 21) - 7
        away_rest = 0 if pd.isna(state[away]["last_game"]) else min((game.gameday - state[away]["last_game"]).days, 21) - 7
        h_games, a_games = state[home]["games"], state[away]["games"]
        h_wins, a_wins = state[home]["wins"], state[away]["wins"]
        h_margin = np.mean(state[home]["recent_margins"]) if state[home]["recent_margins"] else 0.0
        a_margin = np.mean(state[away]["recent_margins"]) if state[away]["recent_margins"] else 0.0

        rows.append({
            "game_id": game.game_id, "season": game.season, "week": game.week, "gameday": game.gameday,
            "matchup": f"{away} @ {home}", "home_team": home, "away_team": away,
            "home_score": game.home_score, "away_score": game.away_score,
            "home_wins": int(h_wins), "home_losses": int(h_games - h_wins),
            "away_wins": int(a_wins), "away_losses": int(a_games - a_wins),
            "elo_diff": elo_diff,
            "win_pct_diff": (state[home]["wins"] / h_games if h_games else 0) - (state[away]["wins"] / a_games if a_games else 0),
            "point_diff_diff": ((state[home]["pf"] - state[home]["pa"]) / h_games if h_games else 0) - ((state[away]["pf"] - state[away]["pa"]) / a_games if a_games else 0),
            "recent_margin_diff": h_margin - a_margin,
            "net_epa_diff": average(home, "net_epa") - average(away, "net_epa"),
            "net_success_diff": average(home, "net_success") - average(away, "net_success"),
            "turnover_rate_diff": average(home, "turnover") - average(away, "turnover"),
            "rest_diff": home_rest - away_rest, "neutral_site": is_neutral,
        })

        if pd.isna(game.home_score) or pd.isna(game.away_score) or game.home_score == game.away_score:
            continue
        home_win = float(game.home_score > game.away_score)
        expected = 1 / (1 + 10 ** (-elo_diff / 400))
        ratings[home] += 20 * (home_win - expected)
        ratings[away] -= 20 * (home_win - expected)
        for team, scored, allowed, won in ((home, game.home_score, game.away_score, home_win), (away, game.away_score, game.home_score, 1 - home_win)):
            team_state = state[team]
            team_state["games"] += 1
            team_state["wins"] += won
            team_state["pf"] += scored
            team_state["pa"] += allowed
            team_state["recent_margins"] = (team_state["recent_margins"] + [scored - allowed])[-5:]
            team_state["last_game"] = game.gameday
            values = game_metrics.get((game.game_id, team))
            if values:
                # Exponentially weighted updates emphasize current form without discarding earlier games.
                team_state["net_epa"] = 0.72 * team_state["net_epa"] + 0.28 * (values["off_epa"] - values["def_epa"])
                team_state["net_success"] = 0.72 * team_state["net_success"] + 0.28 * (values["off_success"] - values["def_success"])
                team_state["turnover"] = 0.72 * team_state["turnover"] + 0.28 * (values["off_turnover"] - values["def_takeaway"])
    return pd.DataFrame(rows)


def make_models():
    logistic = make_pipeline(StandardScaler(), LogisticRegression(C=0.25, max_iter=5_000, random_state=42))
    boosted = HistGradientBoostingClassifier(
        learning_rate=0.035, max_iter=250, max_leaf_nodes=12, min_samples_leaf=35,
        l2_regularization=4.0, early_stopping=False, random_state=42,
    )
    # Calibration makes probabilities useful as confidence scores, not just rankings.
    calibrated_boosted = CalibratedClassifierCV(boosted, method="sigmoid", cv=TimeSeriesSplit(n_splits=4))
    return {"logistic": logistic, "boosted": calibrated_boosted}


def walk_forward_scores(completed: pd.DataFrame, validation_seasons: int = 4) -> pd.DataFrame:
    """Evaluate candidates on future seasons; no random split and no future leakage."""
    seasons = sorted(completed["season"].unique())
    rows = []
    for season in seasons[-validation_seasons:]:
        train = completed.loc[completed.season < season]
        test = completed.loc[completed.season.eq(season)]
        if len(train) < 500 or test.empty:
            continue
        for name, model in make_models().items():
            model.fit(train[FEATURES], train.home_win)
            probability = model.predict_proba(test[FEATURES])[:, 1]
            rows.append({"model": name, "season": season, "games": len(test),
                         "accuracy": accuracy_score(test.home_win, probability >= .5),
                         "brier": brier_score_loss(test.home_win, probability),
                         "log_loss": log_loss(test.home_win, probability)})
    return pd.DataFrame(rows)


def fit_forecaster(completed: pd.DataFrame, scores: pd.DataFrame):
    """Fit both models and weight them by their out-of-sample Brier scores."""
    mean_brier = scores.groupby("model")["brier"].mean()
    inverse_error = 1 / mean_brier
    weights = (inverse_error / inverse_error.sum()).to_dict()
    models = make_models()
    for model in models.values():
        model.fit(completed[FEATURES], completed.home_win)
    return models, weights


def predict_week(model_data: pd.DataFrame, season: int, week: int, models: dict, weights: dict) -> pd.DataFrame:
    games = model_data.loc[(model_data.season == season) & (model_data.week == week) & model_data.home_score.isna()].copy()
    if games.empty:
        return games
    games["home_win_probability"] = sum(weights[name] * model.predict_proba(games[FEATURES])[:, 1] for name, model in models.items())
    games["predicted_winner"] = np.where(games.home_win_probability >= .5, games.home_team, games.away_team)
    games["confidence"] = (100 * np.maximum(games.home_win_probability, 1 - games.home_win_probability)).round(1)
    return games[["gameday", "matchup", "predicted_winner", "confidence", "home_win_probability"]].sort_values(["gameday", "matchup"])
