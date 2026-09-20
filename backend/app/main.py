"""FastAPI application entrypoint — NFL Game Predictor (Gamelytics)."""

import threading
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes_matchups import router as matchups_router, load_model_pipeline
from app.api.routes_sandbox import router as sandbox_router
from app.api.routes_analytics import router as analytics_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start the ML pipeline in a background thread on server startup."""
    thread = threading.Thread(target=load_model_pipeline, args=(2021, 2026), daemon=True)
    thread.start()
    yield
    # Cleanup (if needed) goes here


app = FastAPI(
    title="NFL Game Predictor API",
    description="Leakage-free ensemble ML predictions for NFL weekly matchups.",
    version="2.0.0",
    lifespan=lifespan,
)

# ── CORS ────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ─────────────────────────────────────────────────────────────────
app.include_router(matchups_router, prefix="/api")
app.include_router(sandbox_router, prefix="/api")
app.include_router(analytics_router, prefix="/api")


@app.get("/")
def root():
    return {"service": "Gamelytics NFL Predictor API", "version": "2.0.0", "status": "online"}
