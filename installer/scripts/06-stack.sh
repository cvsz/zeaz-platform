#!/usr/bin/env bash
set -Eeuo pipefail

docker compose \
  -f compose/core/docker-compose.yml \
  -f compose/monitoring/docker-compose.yml \
  -f compose/ai/docker-compose.yml \
  up -d
