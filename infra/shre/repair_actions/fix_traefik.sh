#!/usr/bin/env bash
echo "[REPAIR] Reloading Traefik configuration"
# Traefik auto-reloads dynamic config if touched
touch ../traefik/dynamic.yml
docker restart traefik
