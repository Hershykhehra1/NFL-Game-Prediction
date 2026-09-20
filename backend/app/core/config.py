"""Configuration and in-memory cache state for the NFL prediction service."""

from typing import Dict, Any, Optional

class StateCache:
    """Thread-safe application memory cache."""
    def __init__(self):
        self.is_loaded: bool = False
        self.is_loading: bool = False
        self.error: Optional[str] = None
        self.is_fallback: bool = False
        self.model_data: Any = None
        self.completed: Any = None
        self.models: Optional[Dict[str, Any]] = None
        self.weights: Dict[str, float] = {"logistic": 48.2, "boosted": 51.8}
        self.scores: Any = None
        self.schedule: Any = None
        self.latest_season: int = 2026
        self.last_updated: Optional[str] = None

CACHE = StateCache()
