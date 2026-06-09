#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: check-postgres.sh [--offline] [--connect]

Offline mode validates env shape without connecting. --connect attempts pg_isready
or docker compose health checks without printing secrets.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: PostgreSQL check failed at line $LINENO"' ERR
mode=offline
while [ "$#" -gt 0 ]; do case "$1" in --offline) mode=offline; shift;; --connect) mode=connect; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
: "${POSTGRES_HOST:=postgres}"; : "${POSTGRES_PORT:=5432}"; : "${POSTGRES_DB:=zeaz_platform}"; : "${POSTGRES_USER:=zeazdev}"
case "$POSTGRES_PORT" in ''|*[!0-9]*) echo "ERROR: POSTGRES_PORT must be numeric" >&2; exit 1;; esac
[ "${#POSTGRES_DB}" -ge 1 ] || { echo "ERROR: POSTGRES_DB required" >&2; exit 1; }
[ "${#POSTGRES_USER}" -ge 1 ] || { echo "ERROR: POSTGRES_USER required" >&2; exit 1; }
log "PostgreSQL env shape valid for host=$POSTGRES_HOST port=$POSTGRES_PORT db=$POSTGRES_DB user=$POSTGRES_USER"
if [ "$mode" = connect ]; then
  if command -v pg_isready >/dev/null 2>&1; then pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -d "$POSTGRES_DB" -U "$POSTGRES_USER";
  elif command -v docker >/dev/null 2>&1 && docker compose ps postgres >/dev/null 2>&1; then docker compose ps postgres;
  else log "WARN: pg_isready/docker compose unavailable; connection check skipped"; fi
fi
