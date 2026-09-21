"""Matchups, weekly schedules, status, and pipeline refresh endpoints."""

import math
import threading
from datetime import datetime
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.core.config import CACHE
from app.pipeline import predictor
from app.pipeline.metadata import TEAM_METADATA

router = APIRouter()


def load_model_pipeline(start_season=2021, predict_season=2026):
    """Load schedules, PBP, player stats, injuries, and depth charts, compute features and fit models."""
    try:
        CACHE.is_loading = True
        CACHE.error = None
        print(f"Loading NFL data from {start_season} to {predict_season}...")
        schedule, pbp, player_stats, injuries, depth_charts = predictor.load_inputs(start_season, predict_season)
        
        print("Computing play-by-play game metrics...")
        game_metrics = predictor.make_game_metrics(pbp)
        
        print("Building pregame features, starting QB metrics & position-weighted injuries...")
        model_data = predictor.build_pregame_features(schedule, game_metrics, player_stats, injuries, depth_charts)
        
        model_data["home_win"] = (
            (model_data["home_score"] > model_data["away_score"]).astype(float)
            .where(model_data["home_score"].notna() & model_data["away_score"].notna() & (model_data["home_score"] != model_data["away_score"]))
        )
        completed = model_data.dropna(subset=["home_win"]).copy()
        completed["home_win"] = completed["home_win"].astype(int)

        print("Evaluating walk-forward model scores...")
        scores = predictor.walk_forward_scores(completed, validation_seasons=4)
        print("Fitting final forecaster ensemble...")
        models, weights = predictor.fit_forecaster(completed, scores)

        if not model_data.empty and "season" in model_data.columns:
            CACHE.latest_season = int(model_data["season"].max())

        CACHE.model_data = model_data
        CACHE.completed = completed
        CACHE.models = models
        CACHE.weights = weights
        CACHE.scores = scores
        CACHE.last_updated = datetime.now().strftime("%b %d, %I:%M:%S %p")
        CACHE.is_loaded = True
        CACHE.is_loading = False
        CACHE.is_fallback = False
        print(f"NFL Prediction pipeline successfully loaded via live nflreadpy! Latest season: {CACHE.latest_season}")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"nflreadpy network load error: {e}. Switching to offline fallback dataset.")
        model_data, completed, models, weights, scores = predictor.generate_fallback_model_data()
        if not model_data.empty and "season" in model_data.columns:
            CACHE.latest_season = int(model_data["season"].max())
        CACHE.model_data = model_data
        CACHE.completed = completed
        CACHE.models = models
        CACHE.weights = weights
        CACHE.scores = scores
        CACHE.last_updated = datetime.now().strftime("%b %d, %I:%M:%S %p")
        CACHE.is_loaded = True
        CACHE.is_loading = False
        CACHE.is_fallback = True


@router.get("/status")
def get_status():
    """Return backend initialization status."""
    return {
        "is_loaded": CACHE.is_loaded,
        "is_loading": CACHE.is_loading,
        "is_fallback": CACHE.is_fallback,
        "error": CACHE.error,
        "last_updated": CACHE.last_updated,
        "latest_season": CACHE.latest_season,
        "features": predictor.FEATURES,
        "weights": CACHE.weights if CACHE.weights else {}
    }


@router.post("/refresh")
@router.get("/refresh")
def refresh_pipeline():
    """Trigger an on-demand re-fetch from nflreadpy for live completed game scores and injury updates."""
    if CACHE.is_loading:
        return {"status": "in_progress", "message": "Pipeline is currently updating."}
    CACHE.is_loading = True
    thread = threading.Thread(target=load_model_pipeline, args=(2021, 2026))
    thread.start()
    return {"status": "started", "message": "Re-fetching latest live NFL game data and updating models."}


@router.get("/weeks")
def get_weeks(season: int = None):
    """Return available seasons and weeks."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Pipeline is still initializing. Please try again shortly.")
    
    df = CACHE.model_data
    all_seasons = sorted(df["season"].unique().tolist(), reverse=True) if (df is not None and not df.empty and "season" in df.columns) else [2026]
    latest_season = all_seasons[0] if all_seasons else 2026
    
    selected_season = season if season is not None else latest_season
    season_df = df[df["season"] == selected_season] if df is not None else pd.DataFrame()
    weeks = sorted(season_df["week"].unique().tolist()) if not season_df.empty else list(range(1, 19))
    
    return {
        "season": selected_season,
        "latest_season": latest_season,
        "weeks": weeks,
        "available_seasons": [2026]
    }


@router.get("/predictions")
def get_predictions(season: int = None, week: int = 1):
    """Return matchup predictions, starting QB comparisons, and injury differentials."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Model pipeline loading in background. Please retry in a moment.")
    
    df = CACHE.model_data
    all_seasons = sorted(df["season"].unique().tolist(), reverse=True) if (df is not None and not df.empty and "season" in df.columns) else [2026]
    latest_season = all_seasons[0] if all_seasons else 2026
    selected_season = season if season is not None else latest_season

    week_games = df[(df["season"] == selected_season) & (df["week"] == week)].copy()
    
    if week_games.empty:
        return {"season": selected_season, "week": week, "games": []}

    features = predictor.FEATURES
    models = CACHE.models
    weights = CACHE.weights
    
    output_games = []
    for row in week_games.itertuples(index=False):
        row_dict = row._asdict()
        input_df = pd.DataFrame([row_dict])[features].fillna(0.0)

        if CACHE.is_fallback:
            elo_d = getattr(row, "elo_diff", 0.0)
            epa_d = getattr(row, "net_epa_diff", 0.0)
            qb_epa_d = getattr(row, "qb_epa_diff", 0.0)
            h_prob = 1.0 / (1.0 + math.exp(-(elo_d / 180.0 + epa_d * 3.5 + qb_epa_d * 2.0)))
            h_prob = min(max(h_prob, 0.10), 0.92)
            a_prob = 1.0 - h_prob
            prob_logistic = h_prob
            prob_boosted = h_prob
        else:
            h_prob = float(sum(weights[name] * model.predict_proba(input_df)[:, 1] for name, model in models.items())[0])
            a_prob = 1.0 - h_prob
            prob_logistic = float(models["logistic"].predict_proba(input_df)[:, 1][0])
            prob_boosted = float(models["boosted"].predict_proba(input_df)[:, 1][0])

        pred_winner = row.home_team if h_prob >= 0.5 else row.away_team
        conf = round(float(max(h_prob, a_prob) * 100), 1)
        
        if conf >= 75.0:
            conf_tier = "High"
        elif conf >= 60.0:
            conf_tier = "Moderate"
        else:
            conf_tier = "Toss-Up"

        home_meta = TEAM_METADATA.get(row.home_team, {"name": row.home_team, "city": row.home_team, "primary": "#1f2937", "secondary": "#4b5563", "qb": "Starting QB"})
        away_meta = TEAM_METADATA.get(row.away_team, {"name": row.away_team, "city": row.away_team, "primary": "#1f2937", "secondary": "#4b5563", "qb": "Starting QB"})
        is_completed = not (pd.isna(row.home_score) or pd.isna(row.away_score))
        actual_winner = None
        if is_completed:
            actual_winner = row.home_team if row.home_score > row.away_score else (row.away_team if row.away_score > row.home_score else "TIE")

        h_wins = getattr(row, "home_wins", 0)
        h_losses = getattr(row, "home_losses", 0)
        a_wins = getattr(row, "away_wins", 0)
        a_losses = getattr(row, "away_losses", 0)

        h_w = int(h_wins) if not pd.isna(h_wins) else 0
        h_l = int(h_losses) if not pd.isna(h_losses) else 0
        a_w = int(a_wins) if not pd.isna(a_wins) else 0
        a_l = int(a_losses) if not pd.isna(a_losses) else 0

        game_dict = {
            "game_id": str(row.game_id),
            "season": int(row.season),
            "week": int(row.week),
            "gameday": row.gameday.strftime("%Y-%m-%d") if isinstance(row.gameday, (pd.Timestamp, datetime)) else str(row.gameday),
            "matchup": str(row.matchup),
            "home_team": {
                "abbr": row.home_team,
                "name": home_meta["name"],
                "city": home_meta["city"],
                "primary": home_meta["primary"],
                "secondary": home_meta["secondary"],
                "wins": h_w,
                "losses": h_l,
                "record": f"{h_w}-{h_l}",
                "win_prob": round(h_prob * 100, 1),
                "score": int(row.home_score) if is_completed else None
            },
            "away_team": {
                "abbr": row.away_team,
                "name": away_meta["name"],
                "city": away_meta["city"],
                "primary": away_meta["primary"],
                "secondary": away_meta["secondary"],
                "wins": a_w,
                "losses": a_l,
                "record": f"{a_w}-{a_l}",
                "win_prob": round(a_prob * 100, 1),
                "score": int(row.away_score) if is_completed else None
            },
            "predicted_winner": pred_winner,
            "confidence": conf,
            "confidence_tier": conf_tier,
            "is_completed": is_completed,
            "actual_winner": actual_winner,
            "is_correct": (pred_winner == actual_winner) if is_completed and actual_winner != "TIE" else None,
            "differentials": {
                "elo_diff": round(float(getattr(row, "elo_diff", 0.0)), 1),
                "win_pct_diff": round(float(getattr(row, "win_pct_diff", 0.0) * 100), 1),
                "point_diff_diff": round(float(getattr(row, "point_diff_diff", 0.0)), 1),
                "recent_margin_diff": round(float(getattr(row, "recent_margin_diff", 0.0)), 1),
                "net_epa_diff": round(float(getattr(row, "net_epa_diff", 0.0)), 3),
                "net_success_diff": round(float(getattr(row, "net_success_diff", 0.0) * 100), 1),
                "turnover_rate_diff": round(float(getattr(row, "turnover_rate_diff", 0.0) * 100), 2),
                "rest_diff": int(getattr(row, "rest_diff", 0)),
                "neutral_site": bool(getattr(row, "neutral_site", False)),
                "qb_epa_diff": round(float(getattr(row, "qb_epa_diff", 0.0)), 3),
                "qb_cpoe_diff": round(float(getattr(row, "qb_cpoe_diff", 0.0)), 1),
                "injury_diff": round(float(getattr(row, "injury_diff", 0.0)), 1),
                "off_injury_diff": round(float(getattr(row, "off_injury_diff", 0.0)), 1),
                "def_injury_diff": round(float(getattr(row, "def_injury_diff", 0.0)), 1),
            },
            "starting_qbs": {
                "home_qb": getattr(row, "home_qb", home_meta.get("qb", "Starting QB")),
                "away_qb": getattr(row, "away_qb", away_meta.get("qb", "Starting QB")),
                "home_epa": round(float(getattr(row, "home_qb_epa", 0.0)), 3),
                "away_epa": round(float(getattr(row, "away_qb_epa", 0.0)), 3),
                "home_cpoe": round(float(getattr(row, "home_qb_cpoe", 0.0)), 1),
                "away_cpoe": round(float(getattr(row, "away_qb_cpoe", 0.0)), 1),
            },
            "injury_breakdown": {
                "home_index": round(float(getattr(row, "home_injury_index", 0.0)), 1),
                "away_index": round(float(getattr(row, "away_injury_index", 0.0)), 1),
                "home_injuries": getattr(row, "home_injuries", []),
                "away_injuries": getattr(row, "away_injuries", []),
            },
            "model_breakdown": {
                "logistic_home_win_prob": round(prob_logistic * 100, 1),
                "boosted_home_win_prob": round(prob_boosted * 100, 1),
                "logistic_weight": round(weights.get("logistic", 0.48) * 100 if weights.get("logistic", 0.48) <= 1.0 else weights.get("logistic", 48.0), 1),
                "boosted_weight": round(weights.get("boosted", 0.52) * 100 if weights.get("boosted", 0.52) <= 1.0 else weights.get("boosted", 52.0), 1),
            }
        }
        output_games.append(game_dict)

    return {
        "season": season,
        "week": week,
        "total_games": len(output_games),
        "last_updated": CACHE.last_updated,
        "games": output_games
    }


@router.get("/teams")
def get_teams():
    """Return list of all 32 NFL teams."""
    teams_list = []
    for abbr, data in TEAM_METADATA.items():
        if abbr == "LA":  # avoid dup with LAR or vice versa
            continue
        teams_list.append({
            "abbr": abbr,
            "name": data["name"],
            "city": data["city"],
            "primary": data["primary"],
            "secondary": data["secondary"],
            "qb": data.get("qb", "Starting QB"),
        })
    return {"teams": sorted(teams_list, key=lambda x: x["name"])}
