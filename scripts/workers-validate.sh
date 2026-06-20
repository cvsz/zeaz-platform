#!/usr/bin/env bash
set -Eeuo pipefail
echo "Validating Workers foundation..."
[ -f workers/main.ts ] || { echo "Missing main.ts"; exit 1; }
[ -f configs/platform/ai-gateway.yaml ] || { echo "Missing ai-gateway.yaml"; exit 1; }
[ -f workers/middleware/jwt.ts ] || { echo "Missing jwt.ts"; exit 1; }
[ -f workers/middleware/rate-limit.ts ] || { echo "Missing rate-limit.ts"; exit 1; }
echo "Workers foundation valid."
