#!/usr/bin/env python3
"""Offline ingestion script: fetch NFL data via nflreadpy, compute features, and seed Supabase.

Usage:
    # Set environment variables first
    export SUPABASE_URL="https://aiesymlaxxpqatflouje.supabase.co"
    export SUPABASE_KEY="<your-service-role-key>"

    # Run from the backend directory
    cd backend
    python -m scripts.ingest_to_supabase

    # Or run directly
    python scripts/ingest_to_supabase.py
"""

import json
import math
import os
import sys
import traceback
from datetime import datetime

import numpy as np
import pandas as pd

# Ensure the backend app package is importable
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.pipeline import predictor
from app.pipeline.metadata import TEAM_METADATA

# Supabase client
from supabase import create_client


# ---------------------------------------------------------------------------
DEFAULT_SUPABASE_URL = "https://aiesymlaxxpqatflouje.supabase.co"
DEFAULT_SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZXN5bWxheHhwcWF0ZmxvdWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NDU5NTcsImV4cCI6MjEwNzMyMTk1N30."
    "vVdpofYbMv4_ExgBxdXtwqTUQQEcj8SRihOBiOGjXGI"
)

SUPABASE_URL = os.environ.get("SUPABASE_URL", DEFAULT_SUPABASE_URL)
SUPABASE_KEY = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY", DEFAULT_SUPABASE_KEY)
START_SEASON = int(os.environ.get("INGEST_START_SEASON", 2025))
PREDICT_SEASON = int(os.environ.get("INGEST_PREDICT_SEASON", 2026))
BATCH_SIZE = 400  # Rows per Supabase upsert batch


def get_client():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_KEY env vars.\n"
            "Export them before running: export SUPABASE_URL=... SUPABASE_KEY=..."
        )
    return create_client(SUPABASE_URL, SUPABASE_KEY)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def safe_int(v, default=None):
    if v is None:
        return default
    try:
        if isinstance(v, float) and (math.isnan(v) or math.isinf(v)):
            return default
        return int(float(v))
    except (ValueError, TypeError):
        return default


def safe_float(v, default=0.0):
    if v is None:
        return default
    try:
        f = float(v)
        if math.isnan(f) or math.isinf(f):
            return default
        return round(f, 4)
    except (ValueError, TypeError):
        return default


def safe_str(v, default=None):
    if v is None or (isinstance(v, float) and math.isnan(v)):
        return default
    s = str(v).strip()
    return s if s else default


def df_row_to_game_dict(row) -> dict:
    """Convert a model_data DataFrame row to a games table dict."""
    injuries_home = row.get("home_injuries", [])
    injuries_away = row.get("away_injuries", [])
    if isinstance(injuries_home, float) and math.isnan(injuries_home):
        injuries_home = []
    if isinstance(injuries_away, float) and math.isnan(injuries_away):
        injuries_away = []

    return {
        "game_id": str(row["game_id"]),
        "season": safe_int(row["season"]),
        "week": safe_int(row["week"]),
        "season_type": "REG",
        "gameday": pd.Timestamp(row["gameday"]).strftime("%Y-%m-%d") if pd.notna(row.get("gameday")) else "2026-09-01",
        "gametime": safe_str(row.get("gametime")),
        "home_team": str(row["home_team"]),
        "away_team": str(row["away_team"]),
        "home_score": safe_int(row.get("home_score"), default=None),
        "away_score": safe_int(row.get("away_score"), default=None),
        "home_wins": safe_int(row.get("home_wins"), default=0),
        "home_losses": safe_int(row.get("home_losses"), default=0),
        "away_wins": safe_int(row.get("away_wins"), default=0),
        "away_losses": safe_int(row.get("away_losses"), default=0),
        # Starting QBs
        "home_qb": safe_str(row.get("home_qb")),
        "away_qb": safe_str(row.get("away_qb")),
        "home_qb_epa": safe_float(row.get("home_qb_epa"), default=0.0),
        "away_qb_epa": safe_float(row.get("away_qb_epa"), default=0.0),
        "home_qb_cpoe": safe_float(row.get("home_qb_cpoe"), default=0.0),
        "away_qb_cpoe": safe_float(row.get("away_qb_cpoe"), default=0.0),
        # Power ratings
        "home_power_rating": safe_float(row.get("home_power_rating"), default=0.0),
        "away_power_rating": safe_float(row.get("away_power_rating"), default=0.0),
        "home_off_eff": safe_float(row.get("home_off_eff"), default=0.0),
        "away_off_eff": safe_float(row.get("away_off_eff"), default=0.0),
        "home_def_eff": safe_float(row.get("home_def_eff"), default=0.0),
        "away_def_eff": safe_float(row.get("away_def_eff"), default=0.0),
        "home_sos": safe_float(row.get("home_sos"), default=0.0),
        "away_sos": safe_float(row.get("away_sos"), default=0.0),
        # Injury breakdown
        "home_injury_index": safe_float(row.get("home_injury_index"), default=0.0),
        "away_injury_index": safe_float(row.get("away_injury_index"), default=0.0),
        "home_injuries": json.dumps(injuries_home) if isinstance(injuries_home, list) else "[]",
        "away_injuries": json.dumps(injuries_away) if isinstance(injuries_away, list) else "[]",
        # ML feature vector (17 features)
        "elo_diff": safe_float(row.get("elo_diff"), default=0.0),
        "power_rating_diff": safe_float(row.get("power_rating_diff"), default=0.0),
        "off_power_diff": safe_float(row.get("off_power_diff"), default=0.0),
        "def_power_diff": safe_float(row.get("def_power_diff"), default=0.0),
        "win_pct_diff": safe_float(row.get("win_pct_diff"), default=0.0),
        "point_diff_diff": safe_float(row.get("point_diff_diff"), default=0.0),
        "recent_margin_diff": safe_float(row.get("recent_margin_diff"), default=0.0),
        "net_epa_diff": safe_float(row.get("net_epa_diff"), default=0.0),
        "net_success_diff": safe_float(row.get("net_success_diff"), default=0.0),
        "turnover_rate_diff": safe_float(row.get("turnover_rate_diff"), default=0.0),
        "rest_diff": safe_int(row.get("rest_diff"), default=0),
        "neutral_site": safe_int(row.get("neutral_site"), default=0),
        "qb_epa_diff": safe_float(row.get("qb_epa_diff"), default=0.0),
        "qb_cpoe_diff": safe_float(row.get("qb_cpoe_diff"), default=0.0),
        "injury_diff": safe_float(row.get("injury_diff"), default=0.0),
        "off_injury_diff": safe_float(row.get("off_injury_diff"), default=0.0),
        "def_injury_diff": safe_float(row.get("def_injury_diff"), default=0.0),
    }


def ps_row_to_dict(row) -> dict:
    """Convert a player_stats DataFrame row to a player_game_stats table dict."""
    return {
        "game_id": str(row.get("game_id", "")),
        "player_id": safe_str(row.get("player_id")),
        "player_name": safe_str(row.get("player_name")),
        "player_display_name": str(row.get("player_display_name") or row.get("player_name") or "Unknown"),
        "team": str(row.get("team", "")),
        "position": safe_str(row.get("position")),
        "position_group": safe_str(row.get("position_group")),
        "season": safe_int(row.get("season"), default=2026),
        "week": safe_int(row.get("week"), default=1),
        # Passing
        "attempts": safe_int(row.get("attempts"), default=0),
        "completions": safe_int(row.get("completions"), default=0),
        "passing_yards": safe_int(row.get("passing_yards"), default=0),
        "passing_tds": safe_int(row.get("passing_tds"), default=0),
        "passing_interceptions": safe_int(row.get("passing_interceptions"), default=0),
        "sacks_suffered": safe_int(row.get("sacks_suffered"), default=0),
        "passing_epa": safe_float(row.get("passing_epa"), default=0.0),
        "passing_cpoe": safe_float(row.get("passing_cpoe"), default=0.0),
        # Rushing
        "carries": safe_int(row.get("carries"), default=0),
        "rushing_yards": safe_int(row.get("rushing_yards"), default=0),
        "rushing_tds": safe_int(row.get("rushing_tds"), default=0),
        "rushing_fumbles_lost": safe_int(row.get("rushing_fumbles_lost"), default=0),
        "rushing_epa": safe_float(row.get("rushing_epa"), default=0.0),
        # Receiving
        "targets": safe_int(row.get("targets"), default=0),
        "receptions": safe_int(row.get("receptions"), default=0),
        "receiving_yards": safe_int(row.get("receiving_yards"), default=0),
        "receiving_tds": safe_int(row.get("receiving_tds"), default=0),
        "receiving_fumbles_lost": safe_int(row.get("receiving_fumbles_lost"), default=0),
        "receiving_epa": safe_float(row.get("receiving_epa"), default=0.0),
        "target_share": safe_float(row.get("target_share"), default=0.0),
        # Defense
        "def_tackles_solo": safe_int(row.get("def_tackles_solo"), default=0),
        "def_tackles_with_assist": safe_int(row.get("def_tackles_with_assist"), default=0),
        "def_tackle_assists": safe_int(row.get("def_tackle_assists"), default=0),
        "def_tackles_for_loss": safe_float(row.get("def_tackles_for_loss"), default=0.0),
        "def_sacks": safe_float(row.get("def_sacks"), default=0.0),
        "def_interceptions": safe_int(row.get("def_interceptions"), default=0),
        "def_fumbles_forced": safe_int(row.get("def_fumbles_forced"), default=0),
        "def_fumbles": safe_int(row.get("def_fumbles"), default=0),
        "def_pass_defended": safe_int(row.get("def_pass_defended"), default=0),
        "def_tds": safe_int(row.get("def_tds"), default=0),
        # Kicking & Punting
        "fg_made": safe_int(row.get("fg_made"), default=0),
        "fg_att": safe_int(row.get("fg_att"), default=0),
        "fg_long": safe_int(row.get("fg_long"), default=0),
        "pat_made": safe_int(row.get("pat_made"), default=0),
        "pat_att": safe_int(row.get("pat_att"), default=0),
        "pt_att": safe_int(row.get("pt_att"), default=0),
        "pt_yards": safe_int(row.get("pt_yards"), default=0),
        "pt_long": safe_int(row.get("pt_long"), default=0),
        "pt_inside_20": safe_int(row.get("pt_inside_20"), default=0),
        "pt_net_yards": safe_int(row.get("pt_net_yards"), default=0),
        "pt_touchback": safe_int(row.get("pt_touchback"), default=0),
        # Returns
        "punt_returns": safe_int(row.get("punt_returns"), default=0),
        "punt_return_yards": safe_int(row.get("punt_return_yards"), default=0),
        "kickoff_returns": safe_int(row.get("kickoff_returns"), default=0),
        "kickoff_return_yards": safe_int(row.get("kickoff_return_yards"), default=0),
        "special_teams_tds": safe_int(row.get("special_teams_tds"), default=0),
    }


def batch_upsert(client, table: str, rows: list, batch_size: int = BATCH_SIZE, on_conflict: str = None):
    """Batch-upsert rows into a Supabase table."""
    total = len(rows)
    for i in range(0, total, batch_size):
        batch = rows[i : i + batch_size]
        query = client.table(table).upsert(batch)
        if on_conflict:
            query = client.table(table).upsert(batch, on_conflict=on_conflict)
        query.execute()
        print(f"  ↳ {table}: upserted {min(i + batch_size, total)}/{total} rows")


def batch_insert(client, table: str, rows: list, batch_size: int = BATCH_SIZE):
    """Batch-insert rows into a Supabase table (no conflict handling)."""
    total = len(rows)
    for i in range(0, total, batch_size):
        batch = rows[i : i + batch_size]
        client.table(table).insert(batch).execute()
        print(f"  ↳ {table}: inserted {min(i + batch_size, total)}/{total} rows")


# ---------------------------------------------------------------------------
# Main Ingestion Pipeline
# ---------------------------------------------------------------------------

def main():
    print("=" * 70)
    print("NFL Gamelytics → Supabase Ingestion Pipeline")
    print(f"Seasons: {START_SEASON} → {PREDICT_SEASON}")
    print(f"Supabase URL: {SUPABASE_URL}")
    print("=" * 70)

    client = get_client()

    # ── Step 1: Load raw data via nflreadpy ──────────────────────────────
    print("\n[1/6] Loading raw NFL data via nflreadpy...")
    schedule, pbp, player_stats, injuries, depth_charts = predictor.load_inputs(START_SEASON, PREDICT_SEASON)
    print(f"  Schedule: {len(schedule)} games")
    print(f"  PBP plays: {len(pbp)}")
    print(f"  Player stats: {len(player_stats)} rows")
    print(f"  Injuries: {len(injuries)} rows")
    print(f"  Depth charts: {len(depth_charts)} rows")

    # ── Step 2: Compute features ─────────────────────────────────────────
    print("\n[2/6] Computing play-by-play game metrics...")
    game_metrics = predictor.make_game_metrics(pbp)

    print("Building pregame features, starting QB metrics & position-weighted injuries...")
    model_data = predictor.build_pregame_features(schedule, game_metrics, player_stats, injuries, depth_charts)

    model_data["home_win"] = (
        (model_data["home_score"] > model_data["away_score"]).astype(float)
        .where(model_data["home_score"].notna() & model_data["away_score"].notna() & (model_data["home_score"] != model_data["away_score"]))
    )
    completed = model_data.dropna(subset=["home_win"]).copy()
    completed["home_win"] = completed["home_win"].astype(int)
    print(f"  Total games: {len(model_data)}, Completed: {len(completed)}")

    # ── Step 3: Walk-forward evaluation & model fitting ──────────────────
    print("\n[3/6] Evaluating walk-forward model scores...")
    scores = predictor.walk_forward_scores(completed, validation_seasons=2)
    print("Fitting final forecaster ensemble...")
    models, weights = predictor.fit_forecaster(completed, scores)
    print(f"  Weights: {weights}")

    # ── Step 4: Upload games to Supabase ─────────────────────────────────
    print("\n[4/6] Uploading games to Supabase...")
    # Clear existing games first for a clean seed
    client.table("player_game_stats").delete().neq("id", -1).execute()
    client.table("games").delete().neq("game_id", "").execute()

    game_rows = []
    for _, row in model_data.iterrows():
        game_rows.append(df_row_to_game_dict(row))
    batch_upsert(client, "games", game_rows, on_conflict="game_id")
    print(f"  ✅ Uploaded {len(game_rows)} games")

    # ── Step 5: Upload player stats to Supabase ──────────────────────────
    print("\n[5/6] Uploading player game stats to Supabase...")
    # Only insert stats for completed games that exist in our games table
    completed_game_ids = set(model_data.dropna(subset=["home_score"])["game_id"].astype(str))

    if player_stats is not None and not player_stats.empty:
        # Filter to REG season and completed games
        ps_reg = player_stats[
            player_stats["season_type"].fillna("REG").str.upper() == "REG"
        ] if "season_type" in player_stats.columns else player_stats

        ps_filtered = ps_reg[ps_reg["game_id"].astype(str).isin(completed_game_ids)]
        print(f"  Filtering {len(player_stats)} total → {len(ps_filtered)} rows for completed games")

        ps_rows = []
        for _, row in ps_filtered.iterrows():
            ps_rows.append(ps_row_to_dict(row))

        if ps_rows:
            batch_insert(client, "player_game_stats", ps_rows)
            print(f"  ✅ Uploaded {len(ps_rows)} player stat rows")
        else:
            print("  ⚠️ No player stats to upload")
    else:
        print("  ⚠️ No player stats available from nflreadpy")

    # ── Step 6: Upload model evaluation scores ───────────────────────────
    print("\n[6/6] Uploading model evaluation scores...")
    # Clear existing evaluations
    client.table("model_evaluations").delete().neq("id", -1).execute()

    eval_rows = []
    for _, row in scores.iterrows():
        model_name = str(row["model"])
        eval_rows.append({
            "model": model_name,
            "season": int(row["season"]),
            "games": int(row["games"]),
            "accuracy": float(row["accuracy"]),
            "brier": float(row["brier"]),
            "log_loss": float(row["log_loss"]),
            "weight": float(weights.get(model_name, 0.5)),
        })
    if eval_rows:
        batch_insert(client, "model_evaluations", eval_rows)
        print(f"  ✅ Uploaded {len(eval_rows)} evaluation rows")

    # Update sync status
    latest_week = int(model_data["week"].max()) if not model_data.empty else 1
    latest_season = int(model_data["season"].max()) if not model_data.empty else PREDICT_SEASON

    client.table("sync_status").upsert({
        "id": 1,
        "latest_season": latest_season,
        "latest_week": latest_week,
        "status": "ready",
        "error": None,
    }).execute()

    print("\n" + "=" * 70)
    print("✅ Supabase ingestion complete!")
    print(f"   Games: {len(game_rows)}")
    print(f"   Player stats: {len(ps_rows) if 'ps_rows' in dir() else 0}")
    print(f"   Model evals: {len(eval_rows)}")
    print(f"   Latest season: {latest_season}, Week: {latest_week}")
    print("=" * 70)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        traceback.print_exc()
        print(f"\n❌ Ingestion failed: {e}")
        sys.exit(1)
