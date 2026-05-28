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
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }

load_env_file(){
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
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

is_cleanup_only(){
  ! contains_arg --regenerate "$@"
}

verify_bootstrap_token(){
  command -v curl >/dev/null 2>&1 || die "curl is required"
  command -v jq >/dev/null 2>&1 || die "jq is required"

  local response ok errors
  response="$(curl -fsS -H "Authorization: Bearer ${CLOUDFLARE_BOOTSTRAP_TOKEN}" "${API_BASE}/user/tokens/verify" 2>/dev/null || true)"
  [[ -n "$response" ]] || return 2

  ok="$(printf '%s' "$response" | jq -r '.success // false' 2>/dev/null || printf 'false')"
  if [[ "$ok" != "true" ]]; then
    errors="$(printf '%s' "$response" | jq -c '.errors // []' 2>/dev/null || printf '[]')"
    warn "CLOUDFLARE_BOOTSTRAP_TOKEN failed /user/tokens/verify: ${errors}"
    return 1
  fi

  log "verified CLOUDFLARE_BOOTSTRAP_TOKEN"
  return 0
}

# Load .env first, then .env.cloudflare so generated token files can override intentionally.
load_env_file .env
load_env_file .env.cloudflare

: "${CLOUDFLARE_AI_GATEWAY_SLUG:=zeaz}"
export CLOUDFLARE_AI_GATEWAY_SLUG

# token-clean is a safe dry-run housekeeping target. It should not break local
# make workflows when deployment token env is not configured yet.
if is_cleanup_only "$@"; then
  if [[ -z "${CLOUDFLARE_ACCOUNT_ID:-}" || -z "${CLOUDFLARE_BOOTSTRAP_TOKEN:-}" ]]; then
    warn "token-clean skipped: CLOUDFLARE_ACCOUNT_ID or CLOUDFLARE_BOOTSTRAP_TOKEN is missing"
    warn "run make token-verify after filling .env, then rerun make token-clean"
    exit 0
  fi
  if ! verify_bootstrap_token; then
    warn "token-clean skipped: bootstrap token is invalid, expired, revoked, malformed, or overridden by .env.cloudflare"
    warn "run make token-verify for a masked diagnostic"
    exit 0
  fi
else
  [[ -n "${CLOUDFLARE_ACCOUNT_ID:-}" ]] || die "CLOUDFLARE_ACCOUNT_ID is missing. Fill it in .env before token rotation."
  [[ -n "${CLOUDFLARE_BOOTSTRAP_TOKEN:-}" ]] || die "CLOUDFLARE_BOOTSTRAP_TOKEN is missing. Fill it in .env before token rotation."
  verify_bootstrap_token || die "CLOUDFLARE_BOOTSTRAP_TOKEN is invalid. Run make token-verify."
fi

if contains_arg --regenerate "$@"; then
  types="$(value_after_arg --types "$@" || true)"
  [[ -n "$types" ]] || die "--regenerate requires --types"
  if [[ "$types" == "all" || ",$types," == *",dns,"* ]]; then
    [[ -n "${CLOUDFLARE_ZONE_ID:-}" ]] || die "CLOUDFLARE_ZONE_ID is missing. DNS token creation needs the real Cloudflare zone ID."
  fi
fi

exec bash scripts/cloudflare/clean-and-regenerate-tokens.sh "$@"
