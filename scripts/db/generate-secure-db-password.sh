#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'USAGE'
Usage: generate-secure-db-password.sh [--length N] [--env-file PATH] [--force]

Generate a cryptographically random PostgreSQL password and write it to a
local, gitignored env file. Existing POSTGRES_PASSWORD values are preserved
unless --force is supplied.
USAGE
}

log() { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: password generation failed at line $LINENO"' ERR

length=48
env_file=".env.local"
force=0
while [ "$#" -gt 0 ]; do
  case "$1" in
    --length) length="${2:?missing length}"; shift 2 ;;
    --env-file) env_file="${2:?missing env file}"; shift 2 ;;
    --force) force=1; shift ;;
    --help|-h) usage; exit 0 ;;
    *) echo "ERROR: unknown argument: $1" >&2; usage; exit 2 ;;
  esac
done

case "$length" in ''|*[!0-9]*) echo "ERROR: --length must be numeric" >&2; exit 2 ;; esac
if [ "$length" -lt 32 ]; then echo "ERROR: length must be at least 32" >&2; exit 2; fi

mkdir -p "$(dirname "$env_file")"
touch "$env_file"
chmod 600 "$env_file"
if grep -q '^POSTGRES_PASSWORD=' "$env_file" && [ "$force" -ne 1 ]; then
  log "POSTGRES_PASSWORD already exists in $env_file; preserving existing value"
  exit 0
fi

if command -v openssl >/dev/null 2>&1; then
  password="$(openssl rand -base64 72 | tr -dc 'A-Za-z0-9_@%+=:,.~-' | head -c "$length")"
else
  password="$(LC_ALL=C tr -dc 'A-Za-z0-9_@%+=:,.~-' </dev/urandom | head -c "$length")"
fi
[ "${#password}" -ge "$length" ] || { echo "ERROR: failed to generate password" >&2; exit 1; }

tmp="$(mktemp)"
if [ "$force" -eq 1 ]; then grep -v '^POSTGRES_PASSWORD=' "$env_file" > "$tmp" || true; else cat "$env_file" > "$tmp"; fi
{
  cat "$tmp"
  printf 'POSTGRES_PASSWORD=%s\n' "$password"
} > "$env_file"
rm -f "$tmp"
chmod 600 "$env_file"
log "Generated POSTGRES_PASSWORD in $env_file (value not printed)"
