#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# ZEAZ Platform Env Variable Validator
# Validates presence and basic format of mandatory variables defined in GEMINI.md

log() { printf '[%s] %s\n' "validate-env" "$*"; }
err() { printf '[%s] ERROR: %s\n' "validate-env" "$*" >&2; }

REQUIRED_VARS=(
  "CLOUDFLARE_ACCOUNT_ID"
  "CLOUDFLARE_ZONE_ID"
  "CLOUDFLARE_API_TOKEN"
  "CLOUDFLARE_DNS_TOKEN"
  "CLOUDFLARE_WORKERS_TOKEN"
  "CLOUDFLARE_ZT_TOKEN"
  "CLOUDFLARE_WAF_TOKEN"
  "CLOUDFLARE_TUNNEL_TOKEN"
  "CLOUDFLARE_R2_TOKEN"
  "CLOUDFLARE_AI_GATEWAY_SLUG"
  "IDENTITY_PROVIDER_TYPE"
  "IDENTITY_PROVIDER_VENDOR"
  "IDENTITY_PROVIDER_METADATA_URL"
  "ENVIRONMENT"
  "REGION"
  "PRIMARY_DOMAIN"
  "ORIGIN_INFRA_TYPE"
  "ORIGIN_HOSTS"
  "TERRAFORM_BACKEND_TYPE"
  "TERRAFORM_STATE_BUCKET"
  "TERRAFORM_LOCK_TABLE"
  "SOPS_AGE_KEY"
  "SECRET_ROTATION_INTERVAL"
  "CLOUDFLARE_PLAN_TIER"
)

# Load .env if exists
if [[ -f .env ]]; then
    log "Loading .env"
    set -a
    source .env
    set +a
fi

failed=0
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var:-}" ]]; then
    err "Required variable missing or empty: $var"
    failed=1
  fi
done

if [[ $failed -eq 1 ]]; then
  log "Environment validation failed."
  exit 1
fi

log "Environment validation passed."
exit 0
