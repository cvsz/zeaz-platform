#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

echo "Running baseline validation..."

# Check required files
[ -f .env.example ] || { echo "Missing .env.example"; exit 1; }
[ -d .ai-factory ] || { echo "Missing .ai-factory directory"; exit 1; }

echo "Offline validation passed."
