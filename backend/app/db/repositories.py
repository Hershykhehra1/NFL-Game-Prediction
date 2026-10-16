"""Repository functions for querying Supabase tables.

Provides fast, lightweight data access methods that replace
in-memory Parquet loading from nflreadpy.
"""

import json
import math
import pandas as pd
from typing import Optional

from app.db.supabase_client import get_client


# ---------------------------------------------------------------------------
# Games
# ---------------------------------------------------------------------------

def get_all_games(season: Optional[int] = None) -> pd.DataFrame:
    """Fetch all games from Supabase, optionally filtered by season.

    Returns a DataFrame with the same column structure as predictor.build_pregame_features().
    """
    client = get_client()
    query = client.table("games").select("*")
    if season is not None:
        query = query.eq("season", season)
    query = query.order("season").order("week").order("game_id")

    # Supabase returns max 1000 rows per request; paginate if needed
    all_rows = []
    offset = 0
    page_size = 1000
    while True:
        response = query.range(offset, offset + page_size - 1).execute()
        rows = response.data
        if not rows:
            break
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        offset += page_size

    if not all_rows:
        return pd.DataFrame()

    df = pd.DataFrame(all_rows)

    # Parse JSONB columns back to Python lists
    for col in ["home_injuries", "away_injuries"]:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda v: json.loads(v) if isinstance(v, str) else (v if isinstance(v, list) else [])
            )

    # Parse gameday to datetime
    if "gameday" in df.columns:
        df["gameday"] = pd.to_datetime(df["gameday"])

    return df


def get_games_for_week(season: int, week: int) -> pd.DataFrame:
    """Fetch games for a specific season and week."""
    client = get_client()
    response = (
        client.table("games")
        .select("*")
        .eq("season", season)
        .eq("week", week)
        .order("game_id")
        .execute()
    )
    if not response.data:
        return pd.DataFrame()

    df = pd.DataFrame(response.data)
    for col in ["home_injuries", "away_injuries"]:
        if col in df.columns:
            df[col] = df[col].apply(
                lambda v: json.loads(v) if isinstance(v, str) else (v if isinstance(v, list) else [])
            )
    if "gameday" in df.columns:
        df["gameday"] = pd.to_datetime(df["gameday"])
    return df


# ---------------------------------------------------------------------------
# Player Game Stats (Box Scores)
# ---------------------------------------------------------------------------

def get_boxscore_players(game_id: str) -> pd.DataFrame:
    """Fetch all player stats for a specific game from Supabase."""
    client = get_client()

    # Paginate in case a game has many player rows
    all_rows = []
    offset = 0
    page_size = 1000
    while True:
        response = (
            client.table("player_game_stats")
            .select("*")
            .eq("game_id", game_id)
            .range(offset, offset + page_size - 1)
            .execute()
        )
        rows = response.data
        if not rows:
            break
        all_rows.extend(rows)
        if len(rows) < page_size:
            break
        offset += page_size

    if not all_rows:
        return pd.DataFrame()

    return pd.DataFrame(all_rows)


# ---------------------------------------------------------------------------
# Model Evaluations
# ---------------------------------------------------------------------------

def get_model_scores() -> pd.DataFrame:
    """Fetch stored walk-forward model evaluation scores."""
    client = get_client()
    response = (
        client.table("model_evaluations")
        .select("model, season, games, accuracy, brier, log_loss, weight")
        .order("season")
        .execute()
    )
    if not response.data:
        return pd.DataFrame()
    return pd.DataFrame(response.data)


def get_model_weights() -> dict:
    """Derive ensemble weights from stored model evaluations."""
    scores = get_model_scores()
    if scores.empty:
        return {"logistic": 0.482, "boosted": 0.518}

    # Use the stored weight column (already computed during ingestion)
    latest = scores.drop_duplicates(subset="model", keep="last")
    weights = {}
    for _, row in latest.iterrows():
        weights[row["model"]] = float(row["weight"])
    return weights


# ---------------------------------------------------------------------------
# Sync Status
# ---------------------------------------------------------------------------

def get_sync_status() -> dict:
    """Return the current sync/ingestion status."""
    client = get_client()
    response = client.table("sync_status").select("*").eq("id", 1).execute()
    if response.data:
        return response.data[0]
    return {"status": "unknown", "latest_season": 2026, "latest_week": 1}


from datetime import datetime, timezone

def update_sync_status(latest_season: int, latest_week: int, status: str = "ready", error: str = None):
    """Update the sync status after ingestion or refresh."""
    client = get_client()
    client.table("sync_status").upsert({
        "id": 1,
        "latest_season": latest_season,
        "latest_week": latest_week,
        "status": status,
        "error": error,
        "last_synced_at": datetime.now(timezone.utc).isoformat(),
    }).execute()
