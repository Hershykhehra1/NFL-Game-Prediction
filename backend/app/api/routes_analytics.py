import math
import numpy as np
import pandas as pd
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


TEAM_DIVISIONS = {
    "BUF": ("AFC", "AFC East"), "MIA": ("AFC", "AFC East"), "NE": ("AFC", "AFC East"), "NYJ": ("AFC", "AFC East"),
    "BAL": ("AFC", "AFC North"), "CIN": ("AFC", "AFC North"), "CLE": ("AFC", "AFC North"), "PIT": ("AFC", "AFC North"),
    "HOU": ("AFC", "AFC South"), "IND": ("AFC", "AFC South"), "JAX": ("AFC", "AFC South"), "TEN": ("AFC", "AFC South"),
    "DEN": ("AFC", "AFC West"), "KC": ("AFC", "AFC West"), "LV": ("AFC", "AFC West"), "LAC": ("AFC", "AFC West"),
    "DAL": ("NFC", "NFC East"), "NYG": ("NFC", "NFC East"), "PHI": ("NFC", "NFC East"), "WAS": ("NFC", "NFC East"),
    "CHI": ("NFC", "NFC North"), "DET": ("NFC", "NFC North"), "GB": ("NFC", "NFC North"), "MIN": ("NFC", "NFC North"),
    "ATL": ("NFC", "NFC South"), "CAR": ("NFC", "NFC South"), "NO": ("NFC", "NFC South"), "TB": ("NFC", "NFC South"),
    "ARI": ("NFC", "NFC West"), "LA": ("NFC", "NFC West"), "LAR": ("NFC", "NFC West"), "SF": ("NFC", "NFC West"), "SEA": ("NFC", "NFC West"),
}


@router.get("/power-rankings")
def get_power_rankings():
    """Return all 32 teams ranked by dual-track Category-Based Statistical Power Rating + Dynamic Elo."""
    if not CACHE.is_loaded:
        raise HTTPException(status_code=503, detail="Pipeline initializing.")

    model_data = CACHE.model_data
    curr_season = int(model_data["season"].max()) if (model_data is not None and not model_data.empty and "season" in model_data.columns) else 2026
    curr_season_games = model_data[model_data["season"] == curr_season] if model_data is not None and not model_data.empty else pd.DataFrame()

    all_completed_curr = curr_season_games.dropna(subset=["home_score", "away_score"]) if not curr_season_games.empty else pd.DataFrame()
    latest_played_week = int(all_completed_curr["week"].max()) if not all_completed_curr.empty else 1
    active_week = (latest_played_week + 1) if (not curr_season_games.empty and curr_season_games["week"].max() > latest_played_week) else latest_played_week

    teams_list = []

    for abbr, meta in TEAM_METADATA.items():
        if abbr == "LAR":  # Avoid duplicate with LA
            continue

        base_elo = meta.get("elo", 1500)
        conf, div = TEAM_DIVISIONS.get(abbr, ("NFC" if abbr in ("LA", "LAR") else "AFC", "NFC West" if abbr in ("LA", "LAR") else "AFC"))
        query_abbr = "LA" if abbr in ("LA", "LAR") else abbr

        team_all_games = model_data[
            (model_data["home_team"] == query_abbr) | (model_data["away_team"] == query_abbr)
        ] if model_data is not None and not model_data.empty else pd.DataFrame()

        team_curr_games = curr_season_games[
            (curr_season_games["home_team"] == query_abbr) | (curr_season_games["away_team"] == query_abbr)
        ] if curr_season_games is not None and not curr_season_games.empty else pd.DataFrame()

        completed_curr = team_curr_games.dropna(subset=["home_score", "away_score"]) if not team_curr_games.empty else pd.DataFrame()

        # 1. Fetch current game exactly the same way as matchup prediction cards for the active week
        team_active_game = team_curr_games[team_curr_games["week"] == active_week] if not team_curr_games.empty else pd.DataFrame()
        if not team_active_game.empty:
            current_game_row = team_active_game.iloc[0]
        elif not completed_curr.empty:
            current_game_row = completed_curr.sort_values(["season", "week"]).iloc[-1]
        elif not team_curr_games.empty:
            current_game_row = team_curr_games.sort_values(["season", "week"]).iloc[0]
        elif not team_all_games.empty:
            current_game_row = team_all_games.sort_values(["season", "week"]).iloc[-1]
        else:
            current_game_row = None

        if current_game_row is None:
            current_elo = base_elo
            off_eff = 0.0
            def_eff = 0.0
            sos = 0.0
            to_margin = 0.0
            ppg_diff = 0.0
            win_pct = 0.50
            wins = 0
            losses = 0
            trend = 0
            current_qb = meta.get("qb", "Starting QB")
            qb_epa = 0.0
            qb_cpoe = 0.0
        else:
            is_home = (current_game_row["home_team"] == query_abbr)

            current_elo = float(current_game_row.get("home_elo" if is_home else "away_elo", base_elo) or base_elo)
            current_qb = str(current_game_row.get("home_qb" if is_home else "away_qb", meta.get("qb", "Starting QB")) or meta.get("qb", "Starting QB"))
            qb_epa = float(current_game_row.get("home_qb_epa" if is_home else "away_qb_epa", 0.0) or 0.0)
            qb_cpoe = float(current_game_row.get("home_qb_cpoe" if is_home else "away_qb_cpoe", 0.0) or 0.0)
            off_eff = float(current_game_row.get("home_off_eff" if is_home else "away_off_eff", 0.0) or 0.0)
            def_eff = float(current_game_row.get("home_def_eff" if is_home else "away_def_eff", 0.0) or 0.0)
            sos = float(current_game_row.get("home_sos" if is_home else "away_sos", 0.0) or 0.0)
            to_margin = round(float(current_game_row.get("turnover_rate_diff", 0.0) * (-10.0 if is_home else 10.0)), 2)

            # 2. Current season completed games (records & scoring margins)
            if not completed_curr.empty:
                wins = sum(1 for r in completed_curr.itertuples() if (r.home_team == query_abbr and r.home_score > r.away_score) or (r.away_team == query_abbr and r.away_score > r.home_score))
                losses = sum(1 for r in completed_curr.itertuples() if (r.home_team == query_abbr and r.home_score < r.away_score) or (r.away_team == query_abbr and r.away_score < r.home_score))
                total_games = wins + losses
                win_pct = round(wins / total_games, 3) if total_games > 0 else 0.500

                pf = sum(r.home_score if r.home_team == query_abbr else r.away_score for r in completed_curr.itertuples())
                pa = sum(r.away_score if r.home_team == query_abbr else r.home_score for r in completed_curr.itertuples())
                ppg_diff = round((pf - pa) / total_games, 1) if total_games > 0 else 0.0

                # Momentum trend: net wins across last 3 completed games
                recent_3 = completed_curr.sort_values(["season", "week"]).tail(3)
                rec_w = sum(1 for r in recent_3.itertuples() if (r.home_team == query_abbr and r.home_score > r.away_score) or (r.away_team == query_abbr and r.away_score > r.home_score))
                trend = rec_w - (len(recent_3) - rec_w)
            else:
                wins = 0
                losses = 0
                win_pct = 0.500
                ppg_diff = 0.0
                trend = 0

        # Raw Statistical Power rating incorporating win %, scoring margin, defense, offense, QB form, and SOS
        raw_stat_score = (
            0.30 * (win_pct - 0.50) * 2.0 +
            0.24 * (ppg_diff / 14.0) +
            0.22 * def_eff +
            0.14 * off_eff +
            0.05 * qb_epa +
            0.05 * sos
        )

        # Scale Statistical Power Index to 30-98 range
        stat_power_index = round(float(np.clip(55.0 + raw_stat_score * 35.0, 20.0, 98.0)), 1)
        # Scale Dynamic Elo Index to 30-98 range
        elo_index = round(float(np.clip(50.0 + ((current_elo - 1500.0) / 120.0) * 12.0, 15.0, 98.0)), 1)
        # Dual-track Composite Score: 65% on-field fundamental performance + 35% dynamic Elo caliber
        composite_score = round(float(0.65 * stat_power_index + 0.35 * elo_index), 1)

        teams_list.append({
            "abbr": abbr,
            "name": meta["name"],
            "city": meta["city"],
            "primary": meta["primary"],
            "secondary": meta["secondary"],
            "qb": current_qb,
            "qb_epa": round(qb_epa, 3),
            "qb_cpoe": round(qb_cpoe, 1),
            "conference": conf,
            "division": div,
            "elo": round(current_elo, 1),
            "elo_index": elo_index,
            "stat_power": stat_power_index,
            "composite_score": composite_score,
            "off_efficiency": round(off_eff, 4),
            "def_efficiency": round(def_eff, 4),
            "sos": round(sos, 3),
            "turnover_margin": to_margin,
            "point_diff": ppg_diff,
            "wins": wins,
            "losses": losses,
            "record": f"{wins}-{losses}",
            "win_pct": win_pct,
            "trend": trend,
        })

    # Sort by composite score to assign primary power rank
    teams_list.sort(key=lambda x: x["composite_score"], reverse=True)
    for i, team in enumerate(teams_list, 1):
        team["rank"] = i
        if i <= 6:
            team["tier"] = "Tier 1: Elite Contender"
            team["tier_badge"] = "Elite"
        elif i <= 14:
            team["tier"] = "Tier 2: Playoff Lock"
            team["tier_badge"] = "Playoffs"
        elif i <= 24:
            team["tier"] = "Tier 3: In the Hunt"
            team["tier_badge"] = "In the Hunt"
        else:
            team["tier"] = "Tier 4: Rebuilding"
            team["tier_badge"] = "Rebuilding"

    # Compute sub-category ranks
    by_off = sorted(teams_list, key=lambda x: x["off_efficiency"], reverse=True)
    for r, t in enumerate(by_off, 1):
        t["offense_rank"] = r

    by_def = sorted(teams_list, key=lambda x: x["def_efficiency"], reverse=True)
    for r, t in enumerate(by_def, 1):
        t["defense_rank"] = r

    by_sos = sorted(teams_list, key=lambda x: x["sos"], reverse=True)
    for r, t in enumerate(by_sos, 1):
        t["sos_rank"] = r

    by_to = sorted(teams_list, key=lambda x: x["turnover_margin"], reverse=True)
    for r, t in enumerate(by_to, 1):
        t["turnover_rank"] = r

    return {
        "rankings": teams_list,
        "total": len(teams_list),
        "season_evaluated": curr_season,
        "weights": {
            "stat_power_weight": 65,
            "elo_weight": 35,
            "stat_breakdown": {
                "current_season_win_pct": 32,
                "point_differential": 26,
                "defensive_efficiency": 22,
                "offensive_efficiency": 15,
                "strength_of_schedule": 5,
            }
        }
    }
