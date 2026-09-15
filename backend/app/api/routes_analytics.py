"""Model performance metrics and power rankings endpoints."""

import math
from fastapi import APIRouter, HTTPException

from app.core.config import CACHE
from app.pipeline import predictor
from app.pipeline.metadata import TEAM_METADATA

router = APIRouter()


@router.get("/model-performance")
def get_model_performance():
    """Return model evaluation metrics across walk-forward validation seasons."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Pipeline initializing.")

    scores = CACHE.scores
    weights = CACHE.weights

    summary = scores.groupby("model").agg(
        {"accuracy": "mean", "brier": "mean", "log_loss": "mean"}
    ).reset_index()

    summary_list = []
    for row in summary.itertuples():
        w_val = weights.get(row.model, 0.5)
        summary_list.append({
            "model": row.model,
            "accuracy": round(float(row.accuracy * 100), 2),
            "brier_score": round(float(row.brier), 4),
            "log_loss": round(float(row.log_loss), 4),
            "weight": round(float(w_val * 100 if w_val <= 1.0 else w_val), 1),
        })

    seasons_detail = scores.to_dict(orient="records")
    for item in seasons_detail:
        item["accuracy"] = round(float(item["accuracy"] * 100), 2)
        item["brier"] = round(float(item["brier"]), 4)
        item["log_loss"] = round(float(item["log_loss"]), 4)

    return {
        "weights": {k: round(v * 100 if v <= 1.0 else v, 1) for k, v in weights.items()},
        "summary": summary_list,
        "features": predictor.FEATURES,
        "by_season": seasons_detail,
    }


@router.get("/power-rankings")
def get_power_rankings():
    """Return all 32 teams ranked by composite Elo + EPA strength score."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Pipeline initializing.")

    model_data = CACHE.model_data
    teams_list = []

    for abbr, meta in TEAM_METADATA.items():
        # Skip duplicate Rams key
        if abbr == "LA":
            continue

        base_elo = meta.get("elo", 1500)

        # Derive a composite strength score from the latest season's pregame features
        team_games = model_data[
            (model_data["home_team"] == abbr) | (model_data["away_team"] == abbr)
        ]

        if team_games.empty:
            composite = base_elo
            net_epa = 0.0
            win_pct = 0.50
            recent_margin = 0.0
        else:
            latest = team_games.sort_values(["season", "week"]).tail(8)
            home_rows = latest[latest["home_team"] == abbr]
            away_rows = latest[latest["away_team"] == abbr]

            epa_vals = []
            for r in home_rows.itertuples():
                if hasattr(r, "net_epa_diff"):
                    epa_vals.append(r.net_epa_diff)
            for r in away_rows.itertuples():
                if hasattr(r, "net_epa_diff"):
                    epa_vals.append(-r.net_epa_diff)

            net_epa = round(float(sum(epa_vals) / len(epa_vals)) if epa_vals else 0.0, 3)

            margin_vals = []
            for r in home_rows.itertuples():
                if hasattr(r, "recent_margin_diff"):
                    margin_vals.append(r.recent_margin_diff)
            for r in away_rows.itertuples():
                if hasattr(r, "recent_margin_diff"):
                    margin_vals.append(-r.recent_margin_diff)

            recent_margin = round(float(sum(margin_vals) / len(margin_vals)) if margin_vals else 0.0, 1)

            # Win percentage from completed games
            completed_home = home_rows.dropna(subset=["home_score", "away_score"])
            completed_away = away_rows.dropna(subset=["home_score", "away_score"])
            wins = sum(1 for r in completed_home.itertuples() if r.home_score > r.away_score) + \
                   sum(1 for r in completed_away.itertuples() if r.away_score > r.home_score)
            total = len(completed_home) + len(completed_away)
            win_pct = round(wins / total, 3) if total > 0 else 0.500

            composite = base_elo + net_epa * 200 + recent_margin * 3

        teams_list.append({
            "abbr": abbr,
            "name": meta["name"],
            "city": meta["city"],
            "primary": meta["primary"],
            "secondary": meta["secondary"],
            "elo": base_elo,
            "composite_score": round(float(composite), 1),
            "net_epa": net_epa,
            "win_pct": win_pct,
            "recent_margin": recent_margin,
        })

    teams_list.sort(key=lambda x: x["composite_score"], reverse=True)
    for i, team in enumerate(teams_list, 1):
        team["rank"] = i

    return {"rankings": teams_list, "total": len(teams_list)}
