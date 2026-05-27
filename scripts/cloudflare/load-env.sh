#!/usr/bin/env bash
# load-env.sh — Resolve project root, load env files, enforce required Cloudflare vars,
# and optionally export state to GitHub Actions ($GITHUB_ENV).
set -Eeuo pipefail
IFS=$'\n\t'

log()  { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn() { log "WARN: $*" >&2; }
die()  { log "ERROR: $*" >&2; exit 1; }

check_bash_version() {
  [[ "${BASH_VERSINFO[0]}" -ge 4 ]] || die "Bash 4.0+ required (found ${BASH_VERSION})"
}

find_root() {
  local d="${PROJECT_ROOT:-${GITHUB_WORKSPACE:-${PWD}}}"

  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] || [[ -f "$d/.env.example" ]] || [[ -d "$d/terraform" ]]; then
      printf '%s\n' "$d"
      return 0
    fi
    d="$(dirname "$d")"
  done

  printf '%s\n' "${GITHUB_WORKSPACE:-${PWD}}"
}

readonly CF_RUNTIME_KEYS=(
  CF_ACCOUNT_ID
  CF_ZONE_ID
  CLOUDFLARE_ACCOUNT_ID
  CLOUDFLARE_ZONE_ID
  CLOUDFLARE_API_TOKEN
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
  CLOUDFLARE_DNS_TOKEN
  CLOUDFLARE_ZT_TOKEN
  CLOUDFLARE_WORKERS_TOKEN
  CLOUDFLARE_WAF_TOKEN
  CLOUDFLARE_TUNNEL_TOKEN
  CLOUDFLARE_R2_TOKEN
  CF_AUDIT_TOKEN
  CF_AI_GATEWAY_TOKEN
  CF_AI_GATEWAY_SLUG
  TERRAFORM_BACKEND_TYPE
  TERRAFORM_STATE_BUCKET
  TERRAFORM_LOCK_TABLE
  COST_LOCK
)

readonly CF_REQUIRED_VARS=(
  CF_ACCOUNT_ID
  CF_ZONE_ID
  CLOUDFLARE_API_TOKEN
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
)

readonly S3_BACKEND_REQUIRED_VARS=(TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE)

load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  set -a
  # shellcheck disable=SC1090
  source "$file" || { set +a; die "failed to source env file: $file"; }
  set +a

  log "loaded env file: $file"
}

capture_runtime_secrets() {
  declare -gA _runtime_secrets=()

  local key
  for key in "${CF_RUNTIME_KEYS[@]}"; do
    if [[ -n "${!key:-}" ]]; then
      _runtime_secrets[$key]="${!key}"
    fi
  done
}

restore_runtime_secrets() {
  local key
  for key in "${!_runtime_secrets[@]}"; do
    export "$key=${_runtime_secrets[$key]}"
  done
}

set_if_empty_from_alias() {
  local canonical="$1" alias="$2"
  if [[ -z "${!canonical:-}" && -n "${!alias:-}" ]]; then
    export "$canonical=${!alias}"
  fi
}

normalize_cloudflare_env_aliases() {
  set_if_empty_from_alias CF_ACCOUNT_ID CLOUDFLARE_ACCOUNT_ID
  set_if_empty_from_alias CF_ZONE_ID CLOUDFLARE_ZONE_ID
  set_if_empty_from_alias CF_DNS_TOKEN CLOUDFLARE_DNS_TOKEN
  set_if_empty_from_alias CF_ZT_TOKEN CLOUDFLARE_ZT_TOKEN
  set_if_empty_from_alias CF_WORKERS_TOKEN CLOUDFLARE_WORKERS_TOKEN
  set_if_empty_from_alias CF_WAF_TOKEN CLOUDFLARE_WAF_TOKEN
  set_if_empty_from_alias CF_TUNNEL_TOKEN CLOUDFLARE_TUNNEL_TOKEN
  set_if_empty_from_alias CF_R2_TOKEN CLOUDFLARE_R2_TOKEN
}

validate_required_vars() {
  local strict="$1"
  local missing=0
  local key

  normalize_cloudflare_env_aliases

  for key in "${CF_REQUIRED_VARS[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      warn "missing environment variable: $key"
      (( missing++ )) || true
    fi
  done

  if [[ "${TERRAFORM_BACKEND_TYPE:-local}" == "s3" ]]; then
    for key in "${S3_BACKEND_REQUIRED_VARS[@]}"; do
      if [[ -z "${!key:-}" ]]; then
        warn "missing environment variable for s3 backend: $key"
        (( missing++ )) || true
      fi
    done
  fi

  (( missing == 0 )) && return 0

  if [[ "$strict" == "true" ]]; then
    die "$missing required variable(s) missing. Set GitHub Actions secrets or provide .env/.env.cloudflare."
  fi

  warn "$missing required variable(s) missing; continuing (STRICT_ENV='${strict}')"
}

export_to_github_env() {
  [[ -n "${GITHUB_ENV:-}" ]] || return 0

  {
    printf 'PROJECT_ROOT=%s\n'       "$PROJECT_ROOT"
    printf 'ENV_FILE=%s\n'           "$ENV_FILE"
    printf 'TOKEN_ENV_FILE=%s\n'     "$TOKEN_ENV_FILE"
    printf 'CF_AI_GATEWAY_SLUG=%s\n' "$CF_AI_GATEWAY_SLUG"
    printf 'COST_LOCK=%s\n'          "$COST_LOCK"
  } >> "$GITHUB_ENV"

  log "exported vars to GITHUB_ENV"
}

main() {
  check_bash_version

  PROJECT_ROOT="$(find_root)"
  ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"
  TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-$PROJECT_ROOT/.env.cloudflare}"
  STRICT_ENV="${STRICT_ENV:-true}"

  capture_runtime_secrets
  load_env_file "$TOKEN_ENV_FILE"
  load_env_file "$ENV_FILE"
  restore_runtime_secrets
  normalize_cloudflare_env_aliases

  : "${CF_AI_GATEWAY_SLUG:=zeaz}"
  : "${TERRAFORM_BACKEND_TYPE:=local}"
  : "${COST_LOCK:=true}"
  export CF_AI_GATEWAY_SLUG TERRAFORM_BACKEND_TYPE COST_LOCK

  validate_required_vars "$STRICT_ENV"
  export_to_github_env

  log "environment loaded successfully"
}

main "$@"
