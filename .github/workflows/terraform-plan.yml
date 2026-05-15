#!/usr/bin/env bash
# load-env.sh — Resolve project root, load env files, enforce required Cloudflare vars,
# and optionally export state to GitHub Actions ($GITHUB_ENV).
set -Eeuo pipefail
IFS=$'\n\t'

# ─── Logging ──────────────────────────────────────────────────────────────────

log()  { printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn() { log "WARN: $*" >&2; }
die()  { log "ERROR: $*" >&2; exit 1; }

# ─── Preconditions ────────────────────────────────────────────────────────────

check_bash_version() {
  [[ "${BASH_VERSINFO[0]}" -ge 4 ]] \
    || die "Bash 4.0+ required (found ${BASH_VERSION})"
}

# ─── Project root resolution ──────────────────────────────────────────────────

# Walk up from the starting directory until a reliable root marker is found.
# Markers (in priority order): .git dir, .env.example file, terraform dir.
# Falls back to $GITHUB_WORKSPACE or $PWD if the filesystem root is reached.
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

# ─── Constants ────────────────────────────────────────────────────────────────

# All Cloudflare keys that may be injected at runtime (e.g. GitHub Actions secrets).
readonly CF_RUNTIME_KEYS=(
  CF_ACCOUNT_ID
  CF_ZONE_ID
  CF_API_TOKEN
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
  CF_AUDIT_TOKEN
  CF_AI_GATEWAY_TOKEN
  CF_AI_GATEWAY_SLUG
)

# Subset that must be present for the script to consider the environment valid.
readonly CF_REQUIRED_VARS=(
  CF_ACCOUNT_ID
  CF_ZONE_ID
  CF_API_TOKEN
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
)

# ─── Env file loading ─────────────────────────────────────────────────────────

# Source a .env-style file, auto-exporting every variable it sets.
# Silently skips missing files; hard-stops on sourcing errors.
load_env_file() {
  local file="$1"
  [[ -f "$file" ]] || return 0

  set -a
  # shellcheck disable=SC1090
  source "$file" || { set +a; die "failed to source env file: $file"; }
  set +a

  log "loaded env file: $file"
}

# ─── Runtime-secret priority ──────────────────────────────────────────────────

# Snapshot any CF_* vars that are already set in the environment (e.g. injected
# by GitHub Actions) before env files are sourced.  After sourcing, restore them
# so that CI secrets always win over file-based values.
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

# ─── Validation ───────────────────────────────────────────────────────────────

validate_required_vars() {
  local strict="$1"
  local missing=0
  local key

  for key in "${CF_REQUIRED_VARS[@]}"; do
    if [[ -z "${!key:-}" ]]; then
      warn "missing environment variable: $key"
      (( missing++ )) || true
    fi
  done

  (( missing == 0 )) && return 0

  if [[ "$strict" == "true" ]]; then
    die "$missing required variable(s) missing. Set GitHub Actions secrets or provide .env/.env.cloudflare."
  fi

  warn "$missing required variable(s) missing; continuing (STRICT_ENV='${strict}')"
}

# ─── GitHub Actions export ────────────────────────────────────────────────────

export_to_github_env() {
  [[ -n "${GITHUB_ENV:-}" ]] || return 0

  {
    printf 'PROJECT_ROOT=%s\n'       "$PROJECT_ROOT"
    printf 'ENV_FILE=%s\n'           "$ENV_FILE"
    printf 'TOKEN_ENV_FILE=%s\n'     "$TOKEN_ENV_FILE"
    printf 'CF_AI_GATEWAY_SLUG=%s\n' "$CF_AI_GATEWAY_SLUG"
  } >> "$GITHUB_ENV"

  log "exported vars to GITHUB_ENV"
}

# ─── Main ─────────────────────────────────────────────────────────────────────

main() {
  check_bash_version

  # Resolve paths
  PROJECT_ROOT="$(find_root)"
  ENV_FILE="${ENV_FILE:-$PROJECT_ROOT/.env}"
  TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-$PROJECT_ROOT/.env.cloudflare}"
  STRICT_ENV="${STRICT_ENV:-true}"

  # Snapshot CI-injected secrets before env files can clobber them
  capture_runtime_secrets

  # Load env files (lowest priority)
  load_env_file "$TOKEN_ENV_FILE"
  load_env_file "$ENV_FILE"

  # Re-apply CI secrets (highest priority)
  restore_runtime_secrets

  # Apply default for optional slug
  : "${CF_AI_GATEWAY_SLUG:=zeaz}"
  export CF_AI_GATEWAY_SLUG

  # Enforce required vars
  validate_required_vars "$STRICT_ENV"

  # Propagate key paths to subsequent GitHub Actions steps
  export_to_github_env

  log "environment loaded successfully"
}

main "$@"
