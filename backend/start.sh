#!/usr/bin/env bash
# Start the Gamelytics NFL Predictor backend.
# Run from the backend/ directory: bash start.sh

PYTHON=/opt/anaconda3/envs/NFL-Game-Prediction/bin/python3

echo "Starting backend with: $PYTHON"
cd "$(dirname "$0")" || exit 1
$PYTHON run.py
