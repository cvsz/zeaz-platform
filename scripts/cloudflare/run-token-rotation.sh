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

API_BASE="${CLOUDFLARE_API_BASE:-${CF_API_BASE:-https://api.cloudflare.com/client/v4}}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die(){ log "ERROR: $*" >&2; exit 1; }

load_env_file(){
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

set_if_empty_from_alias(){
  local canonical="$1" alias="$2"
  if [[ -z "${!canonical:-}" && -n "${!alias:-}" ]]; then
    export "$canonical=${!alias}"
  fi
}

normalize_cloudflare_env(){
  set_if_empty_from_alias CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ACCOUNT_ID
  set_if_empty_from_alias CLOUDFLARE_ZONE_ID CLOUDFLARE_ZONE_ID
  set_if_empty_from_alias CLOUDFLARE_BOOTSTRAP_TOKEN CLOUDFLARE_BOOTSTRAP_TOKEN
  set_if_empty_from_alias CLOUDFLARE_DNS_TOKEN CLOUDFLARE_DNS_TOKEN
  set_if_empty_from_alias CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_WORKERS_TOKEN
  set_if_empty_from_alias CLOUDFLARE_ZT_TOKEN CLOUDFLARE_ZT_TOKEN
  set_if_empty_from_alias CLOUDFLARE_WAF_TOKEN CLOUDFLARE_WAF_TOKEN
  set_if_empty_from_alias CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_TUNNEL_TOKEN
  set_if_empty_from_alias CLOUDFLARE_R2_TOKEN CLOUDFLARE_R2_TOKEN
  set_if_empty_from_alias CLOUDFLARE_AUDIT_TOKEN CLOUDFLARE_AUDIT_TOKEN
  set_if_empty_from_alias CLOUDFLARE_AI_GATEWAY_TOKEN CLOUDFLARE_AI_GATEWAY_TOKEN
  set_if_empty_from_alias CLOUDFLARE_AI_GATEWAY_SLUG CLOUDFLARE_AI_GATEWAY_SLUG

  # Export legacy names for older helper scripts until they are fully migrated.
  export CLOUDFLARE_ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-}"
  export CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID:-}"
  export CLOUDFLARE_BOOTSTRAP_TOKEN="${CLOUDFLARE_BOOTSTRAP_TOKEN:-}"
  export CLOUDFLARE_DNS_TOKEN="${CLOUDFLARE_DNS_TOKEN:-}"
  export CLOUDFLARE_WORKERS_TOKEN="${CLOUDFLARE_WORKERS_TOKEN:-}"
  export CLOUDFLARE_ZT_TOKEN="${CLOUDFLARE_ZT_TOKEN:-}"
  export CLOUDFLARE_WAF_TOKEN="${CLOUDFLARE_WAF_TOKEN:-}"
  export CLOUDFLARE_TUNNEL_TOKEN="${CLOUDFLARE_TUNNEL_TOKEN:-}"
  export CLOUDFLARE_R2_TOKEN="${CLOUDFLARE_R2_TOKEN:-}"
  export CLOUDFLARE_AUDIT_TOKEN="${CLOUDFLARE_AUDIT_TOKEN:-}"
  export CLOUDFLARE_AI_GATEWAY_TOKEN="${CLOUDFLARE_AI_GATEWAY_TOKEN:-}"
  export CLOUDFLARE_AI_GATEWAY_SLUG="${CLOUDFLARE_AI_GATEWAY_SLUG:-zeaz}"
}

contains_arg(){
  local wanted="$1"
  shift
  local arg
  for arg in "$@"; do
    [[ "$arg" == "$wanted" ]] && return 0
  done
  return 1
}

value_after_arg(){
  local wanted="$1"
  shift
  local prev=""
  local arg
  for arg in "$@"; do
    if [[ "$prev" == "$wanted" ]]; then
      printf '%s' "$arg"
      return 0
    fi
    prev="$arg"
  done
  return 1
}

verify_bootstrap_token(){
  command -v curl >/dev/null 2>&1 || die "curl is required"
  command -v jq >/dev/null 2>&1 || die "jq is required"

  local response ok errors
  response="$(curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}" "${API_BASE}/user/tokens/verify" 2>/dev/null || true)"
  [[ -n "$response" ]] || die "could not verify CLOUDFLARE_BOOTSTRAP_TOKEN. Check network access and token value."

  ok="$(printf '%s' "$response" | jq -r '.success // false' 2>/dev/null || printf 'false')"
  if [[ "$ok" != "true" ]]; then
    errors="$(printf '%s' "$response" | jq -c '.errors // []' 2>/dev/null || printf '[]')"
    die "CLOUDFLARE_BOOTSTRAP_TOKEN failed /user/tokens/verify: ${errors}. Check .env and .env.cloudflare; generated .env.cloudflare may be overriding .env."
  fi

  log "verified CLOUDFLARE_BOOTSTRAP_TOKEN"
}

# Load .env first, then .env.cloudflare so generated token files can override.
load_env_file .env
load_env_file .env.cloudflare
normalize_cloudflare_env

: "${CLOUDFLARE_AI_GATEWAY_SLUG:=zeaz}"
export CLOUDFLARE_AI_GATEWAY_SLUG CLOUDFLARE_AI_GATEWAY_SLUG

[[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || die "CLOUDFLARE_ACCOUNT_ID is missing. Fill it in .env before token rotation."
[[ -n "${CLOUDFLARE_BOOTSTRAP_TOKEN:-}" ]] || die "CLOUDFLARE_BOOTSTRAP_TOKEN is missing. Fill it in .env before token rotation."

verify_bootstrap_token

if contains_arg --regenerate "$@"; then
  types="$(value_after_arg --types "$@" || true)"
  [[ -n "$types" ]] || die "--regenerate requires --types"
  if [[ "$types" == "all" || ",$types," == *",dns,"* ]]; then
    [[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || die "CLOUDFLARE_ZONE_ID is missing. DNS token creation needs the real Cloudflare zone ID."
  fi
fi

exec bash scripts/cloudflare/clean-and-regenerate-tokens.sh "$@"