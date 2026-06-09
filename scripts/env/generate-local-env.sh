#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: generate-local-env.sh [--env-file PATH]

Creates a gitignored local env file from .env.example and generates local-only
secret values where needed. Existing files are preserved.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: local env generation failed at line $LINENO"' ERR
env_file=.env.local
while [ "$#" -gt 0 ]; do case "$1" in --env-file) env_file="${2:?missing env file}"; shift 2;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
[ -f .env.example ] || { echo "ERROR: .env.example missing" >&2; exit 1; }
if [ -f "$env_file" ]; then log "$env_file exists; preserving it"; exit 0; fi
umask 077
cp .env.example "$env_file"
scripts/db/generate-secure-db-password.sh --env-file "$env_file"
if ! grep -q '^DATABASE_URL=' "$env_file"; then
  cat >> "$env_file" <<'ENV'
DATABASE_URL=postgresql://zeazdev:${POSTGRES_PASSWORD}@postgres:5432/zeaz_platform
ENV
fi
log "created $env_file with local-only generated secrets (values not printed)"
