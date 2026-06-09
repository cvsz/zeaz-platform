#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() { cat <<'USAGE'
Usage: scripts/db/generate-secure-db-password.sh [--length N]

Generate a cryptographically random PostgreSQL password and print only the password.
No files are written by this script.
USAGE
}
log() { printf '[zeaz-db-password] %s\n' "$*" >&2; }

length=48
while (($#)); do
  case "$1" in
    --length) length="${2:?missing length}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) log "unknown argument: $1"; usage; exit 2 ;;
  esac
done

[[ "$length" =~ ^[0-9]+$ ]] || { log "length must be numeric"; exit 2; }
(( length >= 32 )) || { log "length must be at least 32"; exit 2; }

if command -v openssl >/dev/null 2>&1; then
  openssl rand -base64 96 | tr -dc 'A-Za-z0-9_+=' | head -c "$length"
  printf '\n'
else
  LC_ALL=C tr -dc 'A-Za-z0-9_+=' </dev/urandom | head -c "$length"
  printf '\n'
fi
