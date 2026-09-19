#!/usr/bin/env python3
"""Launch the Gamelytics NFL Predictor backend server."""

import os
import uvicorn

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    # Enable reload only when running locally (not in production on Render/cloud)
    is_dev = os.environ.get("RENDER") is None and os.environ.get("ENVIRONMENT") != "production"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=is_dev,
        reload_dirs=["app"] if is_dev else None,
    )
