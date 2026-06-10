#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/db/check-postgres.sh [--host HOST] [--port PORT]'; }
log() { printf '[zeaz-postgres] %s\n' "$*"; }
host="${POSTGRES_HOST:-localhost}"; port="${POSTGRES_PORT:-5432}"
while (($#)); do case "$1" in --host) host="$2"; shift 2;; --port) port="$2"; shift 2;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
if command -v pg_isready >/dev/null 2>&1; then
  pg_isready -h "$host" -p "$port" ${POSTGRES_USER:+-U "$POSTGRES_USER"} ${POSTGRES_DB:+-d "$POSTGRES_DB"}
elif command -v docker >/dev/null 2>&1 && docker compose version >/dev/null 2>&1; then
  docker compose ps postgres || true
  docker compose exec -T postgres pg_isready -U "${POSTGRES_USER:-zeazdev}" -d "${POSTGRES_DB:-zeaz_platform}"
else
  log "pg_isready and docker compose are unavailable; cannot check Postgres"
  exit 3
fi
