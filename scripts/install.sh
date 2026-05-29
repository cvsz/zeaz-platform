#!/bin/bash
set -e

echo "Installing Zeaz Meta OS Dependencies..."

# Check prerequisites
command -v docker >/dev/null 2>&1 || { echo "Docker is required but it's not installed. Aborting." >&2; exit 1; }
command -v npm >/dev/null 2>&1 || { echo "npm is required but it's not installed. Aborting." >&2; exit 1; }
command -v python3 >/dev/null 2>&1 || { echo "python3 is required but it's not installed. Aborting." >&2; exit 1; }

# Install backend dependencies
echo "Installing API dependencies..."
cd apps/api
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ../..

# Install frontend dependencies
echo "Installing Web dependencies..."
cd apps/web
npm install
cd ../..

# Pull docker images
echo "Pulling Docker images..."
docker compose pull

echo "Installation complete!"