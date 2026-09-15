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
    """Load schedules, PBP data, compute features and fit models."""
    try:
        CACHE.is_loading = True
        CACHE.error = None
        print(f"Loading NFL data from {start_season} to {predict_season}...")
        schedule, pbp = predictor.load_inputs(start_season, predict_season)
        print("Computing play-by-play game metrics...")
        game_metrics = predictor.make_game_metrics(pbp)
        print("Building pregame features & Elo tracking...")
        model_data = predictor.build_pregame_features(schedule, game_metrics)
        
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

        CACHE.model_data = model_data
        CACHE.completed = completed
        CACHE.models = models
        CACHE.weights = weights
        CACHE.scores = scores
        CACHE.schedule = schedule
        CACHE.is_loaded = True
        CACHE.is_loading = False
        CACHE.is_fallback = False
        print("NFL Prediction pipeline successfully loaded via live nflreadpy!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"nflreadpy network load error: {e}. Switching to offline fallback dataset.")
        model_data, completed, models, weights, scores = predictor.generate_fallback_model_data()
        CACHE.model_data = model_data
        CACHE.completed = completed
        CACHE.models = models
        CACHE.weights = weights
        CACHE.scores = scores
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
        "features": predictor.FEATURES,
        "weights": CACHE.weights if CACHE.weights else {}
    }


@router.post("/refresh")
@router.get("/refresh")
def refresh_pipeline():
    """Trigger an on-demand re-fetch from nflreadpy for live completed game scores."""
    if CACHE.is_loading:
        return {"status": "in_progress", "message": "Pipeline is currently updating."}
    thread = threading.Thread(target=load_model_pipeline, args=(2021, 2026))
    thread.start()
    return {"status": "started", "message": "Re-fetching latest live NFL game data and updating models."}


@router.get("/weeks")
def get_weeks(season: int = 2026):
    """Return available seasons and weeks."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Pipeline is still initializing. Please try again shortly.")
    
    df = CACHE.model_data
    season_df = df[df["season"] == season]
    weeks = sorted(season_df["week"].unique().tolist()) if not season_df.empty else list(range(1, 19))
    available_seasons = sorted(df["season"].unique().tolist()) if not CACHE.is_fallback else [2026, 2025, 2024]
    
    return {
        "season": season,
        "weeks": weeks,
        "available_seasons": available_seasons
    }


@router.get("/predictions")
def get_predictions(season: int = 2026, week: int = 1):
    """Return matchup predictions and feature differentials for a specific season and week."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Model pipeline loading in background. Please retry in a moment.")
    
    df = CACHE.model_data
    week_games = df[(df["season"] == season) & (df["week"] == week)].copy()
    
    if week_games.empty:
        return {"season": season, "week": week, "games": []}

    features = predictor.FEATURES
    models = CACHE.models
    weights = CACHE.weights
    
    output_games = []
    for row in week_games.itertuples(index=False):
        if CACHE.is_fallback:
            h_prob = 1.0 / (1.0 + math.exp(-(row.elo_diff / 180.0 + row.net_epa_diff * 3.5)))
            h_prob = min(max(h_prob, 0.12), 0.92)
            a_prob = 1.0 - h_prob
            prob_logistic = h_prob
            prob_boosted = h_prob
        else:
            h_prob = float(sum(weights[name] * model.predict_proba(pd.DataFrame([row._asdict()])[features])[:, 1] for name, model in models.items())[0])
            a_prob = 1.0 - h_prob
            prob_logistic = float(models["logistic"].predict_proba(pd.DataFrame([row._asdict()])[features])[:, 1][0])
            prob_boosted = float(models["boosted"].predict_proba(pd.DataFrame([row._asdict()])[features])[:, 1][0])

        pred_winner = row.home_team if h_prob >= 0.5 else row.away_team
        conf = round(float(max(h_prob, a_prob) * 100), 1)
        
        if conf >= 75.0:
            conf_tier = "High"
        elif conf >= 60.0:
            conf_tier = "Moderate"
        else:
            conf_tier = "Toss-Up"

        home_meta = TEAM_METADATA.get(row.home_team, {"name": row.home_team, "city": row.home_team, "primary": "#1f2937", "secondary": "#4b5563"})
        away_meta = TEAM_METADATA.get(row.away_team, {"name": row.away_team, "city": row.away_team, "primary": "#1f2937", "secondary": "#4b5563"})
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
                "elo_diff": round(float(row.elo_diff), 1),
                "win_pct_diff": round(float(row.win_pct_diff * 100), 1),
                "point_diff_diff": round(float(row.point_diff_diff), 1),
                "recent_margin_diff": round(float(row.recent_margin_diff), 1),
                "net_epa_diff": round(float(row.net_epa_diff), 3),
                "net_success_diff": round(float(row.net_success_diff * 100), 1),
                "turnover_rate_diff": round(float(row.turnover_rate_diff * 100), 2),
                "rest_diff": int(row.rest_diff),
                "neutral_site": bool(row.neutral_site)
            },
            "model_breakdown": {
                "logistic_home_win_prob": round(prob_logistic * 100, 1),
                "boosted_home_win_prob": round(prob_boosted * 100, 1)
            }
        }
        output_games.append(game_dict)

    return {
        "season": season,
        "week": week,
        "total_games": len(output_games),
        "games": output_games
    }


@router.get("/teams")
def get_teams():
    """Return list of all 32 NFL teams."""
    teams_list = []
    for abbr, data in TEAM_METADATA.items():
        teams_list.append({
            "abbr": abbr,
            "name": data["name"],
            "city": data["city"],
            "primary": data["primary"],
            "secondary": data["secondary"]
        })
    return {"teams": sorted(teams_list, key=lambda x: x["name"])}
