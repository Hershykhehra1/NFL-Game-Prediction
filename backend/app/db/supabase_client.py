"""Supabase client initialization with environment variable configuration."""

import os
from supabase import create_client, Client


DEFAULT_SUPABASE_URL = "https://aiesymlaxxpqatflouje.supabase.co"
DEFAULT_SUPABASE_KEY = (
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9."
    "eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpZXN5bWxheHhwcWF0ZmxvdWplIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE3NDU5NTcsImV4cCI6MjEwNzMyMTk1N30."
    "vVdpofYbMv4_ExgBxdXtwqTUQQEcj8SRihOBiOGjXGI"
)


def get_supabase_client() -> Client:
    """Initialize and return a Supabase client using environment variables.

    Required environment variables:
        SUPABASE_URL: The Supabase project URL (e.g., https://xxxxx.supabase.co)
        SUPABASE_KEY: The Supabase service role key (for write access) or anon key (read-only)
    """
    url = os.environ.get("SUPABASE_URL", DEFAULT_SUPABASE_URL)
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY") or os.environ.get("SUPABASE_KEY", DEFAULT_SUPABASE_KEY)

    if not url or not key:
        raise RuntimeError(
            "Missing SUPABASE_URL or SUPABASE_KEY environment variables. "
            "Set them before starting the server."
        )

    return create_client(url, key)


# Singleton client instance (lazy-initialized)
_client: Client | None = None


def get_client() -> Client:
    """Return the singleton Supabase client, creating it on first call."""
    global _client
    if _client is None:
        _client = get_supabase_client()
    return _client
