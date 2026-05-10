#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

########################################
# Load GitHub Environment Secrets
########################################

required_vars=(
  CF_ACCOUNT_ID
  CF_API_TOKEN
  CF_DNS_TOKEN
  CF_ZT_TOKEN
  CF_WORKERS_TOKEN
  CF_WAF_TOKEN
  CF_TUNNEL_TOKEN
  CF_R2_TOKEN
  CF_ZONE_ID
)

log() {
  printf '\n[%s] %s\n' \
    "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
    "$*"
}

validate_var() {
  local key="$1"

  if [[ -z "${!key:-}" ]]; then
    log "Missing required environment variable: ${key}"
    exit 1
  fi
}

log "Validating Cloudflare environment secrets"

for key in "${required_vars[@]}"; do
  validate_var "${key}"
done

log "All required environment secrets loaded successfully"
