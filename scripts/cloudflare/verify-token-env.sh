#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -f "$ROOT/.env.example" || -f "$ROOT/Makefile" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"
cd "$ROOT"

API_BASE="${CLOUDFLARE_API_BASE:-https://api.cloudflare.com/client/v4}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die(){ log "ERROR: $*" >&2; exit 1; }

mask(){
  local value="${1:-}"
  local len="${#value}"
  if [[ "$len" -le 8 ]]; then
    printf '<missing-or-too-short>'
  else
    printf '%s...%s len=%s' "${value:0:4}" "${value: -4}" "$len"
  fi
}

file_has_key(){
  local file="$1" key="$2"
  [[ -f "$file" ]] || return 1
  grep -qE "^${key}=" "$file"
}

load_env_file(){
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

load_env_file .env
load_env_file .env.cloudflare

log "Cloudflare env source check"
for key in CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_BOOTSTRAP_TOKEN; do
  sources=()
  file_has_key .env "$key" && sources+=(.env)
  file_has_key .env.cloudflare "$key" && sources+=(.env.cloudflare)
  printf '%s sources: %s\n' "$key" "${sources[*]:-<none>}"
done

[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || die "CLOUDFLARE_ACCOUNT_ID is missing"
[[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || die "CLOUDFLARE_ZONE_ID is missing"
[[ -n "${CLOUDFLARE_BOOTSTRAP_TOKEN:-}" ]] || die "CLOUDFLARE_BOOTSTRAP_TOKEN is missing"

printf 'CLOUDFLARE_ACCOUNT_ID: %s\n' "$(mask "$CLOUDFLARE_ACCOUNT_ID")"
printf 'CLOUDFLARE_ZONE_ID: %s\n' "$(mask "$CLOUDFLARE_ZONE_ID")"
printf 'CLOUDFLARE_BOOTSTRAP_TOKEN: %s\n' "$(mask "$CLOUDFLARE_BOOTSTRAP_TOKEN")"

command -v curl >/dev/null 2>&1 || die "curl is required"
command -v jq >/dev/null 2>&1 || die "jq is required"

response="$(curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}" "${API_BASE}/user/tokens/verify" 2>/dev/null || true)"
[[ -n "$response" ]] || die "empty response from Cloudflare token verify endpoint"

success="$(printf '%s' "$response" | jq -r '.success // false' 2>/dev/null || printf 'false')"
if [[ "$success" != "true" ]]; then
  printf '%s\n' "$response" | jq -c '{success:(.success // false), errors:(.errors // [])}'
  die "CLOUDFLARE_BOOTSTRAP_TOKEN is invalid, expired, revoked, malformed, or overridden by .env.cloudflare"
fi

printf '%s\n' "$response" | jq -c '{success:(.success // false), result:{id:(.result.id // null), status:(.result.status // null)}}'
log "CLOUDFLARE_BOOTSTRAP_TOKEN is valid"
