#!/usr/bin/env bash
SERVICE=$1
echo "[REPAIR] Restarting service: $SERVICE"
docker restart "$SERVICE"
