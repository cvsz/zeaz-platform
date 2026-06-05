#!/bin/bash
set -e

# Setup if first time
if [ ! -f ".setup_done" ]; then
    echo "Running initial Google Sheets setup..."
    PYTHONPATH=. python src/cli/setup.py || true
    touch .setup_done
fi

# Start the FastAPI Health & Metrics server in the background
echo "Starting monitoring API server on port 8000..."
PYTHONPATH=. uvicorn src.cli.api:app --host 0.0.0.0 --port 8000 &

# Start the main automation loop
echo "Starting automation main loop (runs every 60 seconds)..."
while true; do
    PYTHONPATH=. python src/cli/run.py
    sleep 60
done
