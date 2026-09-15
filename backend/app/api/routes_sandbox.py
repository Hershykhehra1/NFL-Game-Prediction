"""Custom scenario prediction endpoint for sandbox simulations."""

import math
import pandas as pd
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.core.config import CACHE
from app.pipeline import predictor
from app.pipeline.metadata import TEAM_METADATA

router = APIRouter()


class CustomPredictionRequest(BaseModel):
    home_team: str
    away_team: str
    elo_diff: float = 0.0
    win_pct_diff: float = 0.0
    point_diff_diff: float = 0.0
    recent_margin_diff: float = 0.0
    net_epa_diff: float = 0.0
    net_success_diff: float = 0.0
    turnover_rate_diff: float = 0.0
    rest_diff: int = 0
    neutral_site: bool = False


@router.post("/predict-custom")
def predict_custom(req: CustomPredictionRequest):
    """Evaluate custom user differential inputs live."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Model pipeline is still training. Please retry shortly.")

    features = predictor.FEATURES
    row_dict = {
        "elo_diff": req.elo_diff,
        "win_pct_diff": req.win_pct_diff,
        "point_diff_diff": req.point_diff_diff,
        "recent_margin_diff": req.recent_margin_diff,
        "net_epa_diff": req.net_epa_diff,
        "net_success_diff": req.net_success_diff,
        "turnover_rate_diff": req.turnover_rate_diff,
        "rest_diff": req.rest_diff,
        "neutral_site": int(req.neutral_site)
    }
    input_df = pd.DataFrame([row_dict])[features]

    models = CACHE.models
    weights = CACHE.weights

    if CACHE.is_fallback:
        h_prob = 1.0 / (1.0 + math.exp(-(req.elo_diff / 180.0 + req.net_epa_diff * 3.5)))
        h_prob = min(max(h_prob, 0.05), 0.95)
        log_prob = h_prob
        boost_prob = h_prob
    else:
        h_prob = float(sum(weights[name] * model.predict_proba(input_df)[:, 1] for name, model in models.items())[0])
        log_prob = float(models["logistic"].predict_proba(input_df)[:, 1][0])
        boost_prob = float(models["boosted"].predict_proba(input_df)[:, 1][0])

    a_prob = 1.0 - h_prob
    pred_winner = req.home_team if h_prob >= 0.5 else req.away_team
    conf = round(float(max(h_prob, a_prob) * 100), 1)

    return {
        "home_team": req.home_team,
        "away_team": req.away_team,
        "home_win_probability": round(h_prob * 100, 1),
        "away_win_probability": round(a_prob * 100, 1),
        "predicted_winner": pred_winner,
        "confidence": conf,
        "model_breakdown": {
            "logistic_prob": round(log_prob * 100, 1),
            "boosted_prob": round(boost_prob * 100, 1)
        }
    }
