"""NFL Standings & Team Leaderboard API endpoints."""

from typing import Optional, Dict, List, Any
import numpy as np
import pandas as pd
from fastapi import APIRouter, HTTPException, Query

from app.core.config import CACHE
from app.db import repositories
from app.pipeline.metadata import TEAM_METADATA

router = APIRouter()

# ── NFL Alignment ───────────────────────────────────────────────────────────
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

DIVISION_ORDER = [
    "AFC East", "AFC North", "AFC South", "AFC West",
    "NFC East", "NFC North", "NFC South", "NFC West"
]


def _normalize_team(abbr: str) -> str:
    """Normalize team abbreviations (e.g. LAR -> LA)."""
    return "LA" if abbr in ("LA", "LAR") else abbr


def _format_pct(pct: float) -> str:
    """Format win percentage as standard sports format e.g. .750 or 1.000."""
    if pct >= 1.0:
        return "1.000"
    if pct <= 0.0:
        return ".000"
    s = f"{pct:.3f}"
    return s[1:] if s.startswith("0") else s


def _calculate_streak(team_games: pd.DataFrame, team: str) -> str:
    """Calculate the active win/loss/tie streak for a team."""
    if team_games.empty:
        return "-"

    # Sort games chronologically
    sort_cols = [c for c in ["season", "week", "gameday"] if c in team_games.columns]
    sorted_games = team_games.sort_values(sort_cols, ascending=True) if sort_cols else team_games

    results = []
    for _, row in sorted_games.iterrows():
        is_home = (row["home_team"] == team)
        h_score = row["home_score"]
        a_score = row["away_score"]
        if pd.isna(h_score) or pd.isna(a_score):
            continue

        if (is_home and h_score > a_score) or (not is_home and a_score > h_score):
            results.append("W")
        elif (is_home and h_score < a_score) or (not is_home and a_score < h_score):
            results.append("L")
        else:
            results.append("T")

    if not results:
        return "-"

    last_res = results[-1]
    count = 0
    for r in reversed(results):
        if r == last_res:
            count += 1
        else:
            break

    return f"{last_res}{count}"


@router.get("/standings")
def get_standings(season: Optional[int] = Query(None, description="NFL regular season year")):
    """Return comprehensive team standings, records, and tiebreaker seeding for the NFL season."""
    # Ensure cache is ready
    if not CACHE.is_loaded:
        # If cache is not ready, try loading from Supabase directly
        model_data = repositories.get_all_games()
        if model_data.empty:
            raise HTTPException(status_code=503, detail="Game database is currently initializing.")
    else:
        model_data = CACHE.model_data

    if model_data is None or model_data.empty:
        raise HTTPException(status_code=404, detail="No game data available.")

    # Determine evaluated season and available seasons
    available_seasons = sorted([int(s) for s in model_data["season"].dropna().unique()], reverse=True) if "season" in model_data.columns else [2026]
    target_season = season if season is not None else (CACHE.latest_season or (available_seasons[0] if available_seasons else 2026))

    # Filter by season
    season_games = model_data[model_data["season"] == target_season].copy() if "season" in model_data.columns else model_data.copy()
    if season_games.empty and available_seasons:
        target_season = available_seasons[0]
        season_games = model_data[model_data["season"] == target_season].copy()

    # Normalize teams in games dataframe
    if not season_games.empty:
        season_games["home_team"] = season_games["home_team"].apply(_normalize_team)
        season_games["away_team"] = season_games["away_team"].apply(_normalize_team)

    # Filter to completed games
    completed = season_games.dropna(subset=["home_score", "away_score"]).copy() if not season_games.empty else pd.DataFrame()

    total_games_played = len(completed)

    teams_data: List[Dict[str, Any]] = []

    # Iterate over unique teams in metadata
    for raw_abbr, meta in TEAM_METADATA.items():
        if raw_abbr == "LAR":
            continue

        abbr = _normalize_team(raw_abbr)
        conf, div = TEAM_DIVISIONS.get(abbr, ("AFC", "AFC East"))

        # Team completed games
        if not completed.empty:
            team_completed = completed[
                (completed["home_team"] == abbr) | (completed["away_team"] == abbr)
            ].copy()
        else:
            team_completed = pd.DataFrame()

        # Overall W-L-T and points
        wins, losses, ties = 0, 0, 0
        home_w, home_l, home_t = 0, 0, 0
        away_w, away_l, away_t = 0, 0, 0
        div_w, div_l, div_t = 0, 0, 0
        conf_w, conf_l, conf_t = 0, 0, 0
        pf, pa = 0, 0

        for _, row in team_completed.iterrows():
            is_home = (row["home_team"] == abbr)
            opp = row["away_team"] if is_home else row["home_team"]
            opp_conf, opp_div = TEAM_DIVISIONS.get(opp, ("Unknown", "Unknown"))

            t_score = int(row["home_score"] if is_home else row["away_score"])
            o_score = int(row["away_score"] if is_home else row["home_score"])

            pf += t_score
            pa += o_score

            if t_score > o_score:
                wins += 1
                if is_home:
                    home_w += 1
                else:
                    away_w += 1

                if opp_div == div:
                    div_w += 1
                if opp_conf == conf:
                    conf_w += 1
            elif t_score < o_score:
                losses += 1
                if is_home:
                    home_l += 1
                else:
                    away_l += 1

                if opp_div == div:
                    div_l += 1
                if opp_conf == conf:
                    conf_l += 1
            else:
                ties += 1
                if is_home:
                    home_t += 1
                else:
                    away_t += 1

                if opp_div == div:
                    div_t += 1
                if opp_conf == conf:
                    conf_t += 1

        total_games = wins + losses + ties
        win_pct = round((wins + 0.5 * ties) / total_games, 4) if total_games > 0 else 0.000
        div_games = div_w + div_l + div_t
        div_win_pct = round((div_w + 0.5 * div_t) / div_games, 4) if div_games > 0 else 0.000
        conf_games = conf_w + conf_l + conf_t
        conf_win_pct = round((conf_w + 0.5 * conf_t) / conf_games, 4) if conf_games > 0 else 0.000

        point_diff = pf - pa
        diff_str = f"+{point_diff}" if point_diff > 0 else str(point_diff)

        # Record strings
        record_str = f"{wins}-{losses}" + (f"-{ties}" if ties > 0 else "")
        home_record = f"{home_w}-{home_l}" + (f"-{home_t}" if home_t > 0 else "")
        away_record = f"{away_w}-{away_l}" + (f"-{away_t}" if away_t > 0 else "")
        div_record = f"{div_w}-{div_l}" + (f"-{div_t}" if div_t > 0 else "")
        conf_record = f"{conf_w}-{conf_l}" + (f"-{conf_t}" if conf_t > 0 else "")

        streak = _calculate_streak(team_completed, abbr)

        teams_data.append({
            "abbr": abbr,
            "name": meta.get("name", abbr),
            "city": meta.get("city", abbr),
            "primary": meta.get("primary", "#10b981"),
            "secondary": meta.get("secondary", "#14b8a6"),
            "conference": conf,
            "division": div,
            "wins": wins,
            "losses": losses,
            "ties": ties,
            "games_played": total_games,
            "record": record_str,
            "win_pct": win_pct,
            "win_pct_str": _format_pct(win_pct),
            "div_wins": div_w,
            "div_losses": div_l,
            "div_ties": div_t,
            "div_record": div_record,
            "div_win_pct": div_win_pct,
            "conf_wins": conf_w,
            "conf_losses": conf_l,
            "conf_ties": conf_t,
            "conf_record": conf_record,
            "conf_win_pct": conf_win_pct,
            "home_wins": home_w,
            "home_losses": home_l,
            "home_ties": home_t,
            "home_record": home_record,
            "away_wins": away_w,
            "away_losses": away_l,
            "away_ties": away_t,
            "away_record": away_record,
            "pf": pf,
            "pa": pa,
            "point_diff": point_diff,
            "point_diff_str": diff_str,
            "streak": streak,
        })

    # ── Calculate Division Rankings (1-4 in each of the 8 divisions) ─────────
    # Tiebreaker sort: win_pct DESC, div_win_pct DESC, conf_win_pct DESC, point_diff DESC, pf DESC
    divisions_dict: Dict[str, List[Dict[str, Any]]] = {div: [] for div in DIVISION_ORDER}
    for t in teams_data:
        divisions_dict[t["division"]].append(t)

    for div_name, div_teams in divisions_dict.items():
        div_teams.sort(
            key=lambda x: (
                x["win_pct"],
                x["div_win_pct"],
                x["conf_win_pct"],
                x["point_diff"],
                x["pf"]
            ),
            reverse=True
        )
        for rank, team in enumerate(div_teams, 1):
            team["division_rank"] = rank

    # ── Calculate Conference Seeding (1-16 for AFC and NFC) ──────────────────
    # NFL rules: Seeds 1-4 are the 4 division champions. Seeds 5-7 are wild cards. Seeds 8-16 remaining.
    conferences_dict: Dict[str, List[Dict[str, Any]]] = {"AFC": [], "NFC": []}
    for t in teams_data:
        conferences_dict[t["conference"]].append(t)

    for conf_name, conf_teams in conferences_dict.items():
        div_champs = [t for t in conf_teams if t["division_rank"] == 1]
        non_champs = [t for t in conf_teams if t["division_rank"] > 1]

        # Sort division champions (seeds 1 to 4)
        div_champs.sort(
            key=lambda x: (
                x["win_pct"],
                x["conf_win_pct"],
                x["point_diff"],
                x["pf"]
            ),
            reverse=True
        )

        # Sort wild cards and remaining teams (seeds 5 to 16)
        non_champs.sort(
            key=lambda x: (
                x["win_pct"],
                x["conf_win_pct"],
                x["point_diff"],
                x["pf"]
            ),
            reverse=True
        )

        for seed, team in enumerate(div_champs, 1):
            team["conference_rank"] = seed
            team["playoff_seed"] = seed
            team["seed_badge"] = f"#{seed} Div Champ"
            team["is_playoff"] = True

        for idx, team in enumerate(non_champs, len(div_champs) + 1):
            team["conference_rank"] = idx
            team["playoff_seed"] = idx
            if idx <= 7:
                team["seed_badge"] = f"#{idx} Wild Card"
                team["is_playoff"] = True
            else:
                team["seed_badge"] = f"#{idx}"
                team["is_playoff"] = False

        # Re-assemble conference list ordered by seed
        conferences_dict[conf_name] = div_champs + non_champs

    # ── Calculate Overall NFL League Rank (1-32) ─────────────────────────────
    teams_data.sort(
        key=lambda x: (
            x["win_pct"],
            x["point_diff"],
            x["pf"],
            x["conf_win_pct"]
        ),
        reverse=True
    )
    for rank, team in enumerate(teams_data, 1):
        team["league_rank"] = rank

    return {
        "season": target_season,
        "available_seasons": available_seasons,
        "total_games_played": total_games_played,
        "last_updated": CACHE.last_updated or "Live",
        "standings": teams_data,
        "conferences": conferences_dict,
        "divisions": divisions_dict,
    }
