#!/usr/bin/env bash
echo "[REPAIR] Repairing Authentik Configuration"
# Force-restart worker and server to resync with database and reset outposts
docker compose -f ../authentik/compose.yaml restart server worker
