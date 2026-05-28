#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

log() {
  printf '[%s] %s\n' "$1" "$2"
}

require_var() {
  local name="$1"
  local value="${!name:-}"
  if [[ -z "$value" ]]; then
    log ERROR "missing variable: ${name}"
    return 1
  fi
  return 0
}

validate_regex() {
  local name="$1"
  local pattern="$2"
  local message="$3"
  local value="${!name:-}"
  if [[ -n "$value" && ! "$value" =~ $pattern ]]; then
    log ERROR "${name} ${message}"
    return 1
  fi
  return 0
}

fail=0
required_vars=(
  CLOUDFLARE_ACCOUNT_ID CLOUDFLARE_ZONE_ID CLOUDFLARE_API_TOKEN CLOUDFLARE_DNS_TOKEN CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_ZT_TOKEN CLOUDFLARE_WAF_TOKEN CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_R2_TOKEN
  IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL
  ENVIRONMENT REGION PRIMARY_DOMAIN ORIGIN_INFRA_TYPE ORIGIN_HOSTS
  TERRAFORM_BACKEND_TYPE TERRAFORM_STATE_BUCKET TERRAFORM_LOCK_TABLE
  SOPS_AGE_KEY SECRET_ROTATION_INTERVAL CLOUDFLARE_PLAN_TIER
)

for v in "${required_vars[@]}"; do
  require_var "$v" || fail=1
done

validate_regex PRIMARY_DOMAIN '^zeaz\.dev$' 'must be zeaz.dev' || fail=1
validate_regex CLOUDFLARE_ACCOUNT_ID '^[a-f0-9]{32}$' 'must be a 32-char lowercase hex ID' || fail=1
validate_regex CLOUDFLARE_ZONE_ID '^[a-f0-9]{32}$' 'must be a 32-char lowercase hex ID' || fail=1
validate_regex CLOUDFLARE_PLAN_TIER '^(Free|Pro|Business|Enterprise)$' 'must be one of Free, Pro, Business, Enterprise' || fail=1
validate_regex ENVIRONMENT '^(dev|staging|prod)$' 'must be one of dev, staging, prod' || fail=1
validate_regex REGION '^[a-z]{2,}-[a-z]+-[0-9]+$' 'must be an IaaS-style region (example: us-east-1)' || fail=1
validate_regex IDENTITY_PROVIDER_TYPE '^(saml|oidc)$' 'must be saml or oidc' || fail=1
validate_regex IDENTITY_PROVIDER_METADATA_URL '^https://.+' 'must be an https URL' || fail=1
validate_regex SECRET_ROTATION_INTERVAL '^[0-9]+(d|h)$' 'must be duration (example: 30d, 12h)' || fail=1
validate_regex TERRAFORM_BACKEND_TYPE '^(s3|local)$' 'must be s3 or local' || fail=1
validate_regex ORIGIN_INFRA_TYPE '^(vm|kubernetes|serverless|hybrid)$' 'must be vm, kubernetes, serverless, or hybrid' || fail=1

if [[ "${TERRAFORM_BACKEND_TYPE:-}" == "s3" ]]; then
  validate_regex TERRAFORM_STATE_BUCKET '^[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$' 'must be a valid bucket name' || fail=1
  require_var TERRAFORM_LOCK_TABLE || fail=1
fi

if [[ "${SOPS_AGE_KEY:-}" != age1* ]]; then
  log ERROR 'SOPS_AGE_KEY must be an age private key (prefix age1...)'
  fail=1
fi

for token_var in CLOUDFLARE_API_TOKEN CLOUDFLARE_DNS_TOKEN CLOUDFLARE_WORKERS_TOKEN CLOUDFLARE_ZT_TOKEN CLOUDFLARE_WAF_TOKEN CLOUDFLARE_TUNNEL_TOKEN CLOUDFLARE_R2_TOKEN; do
  token_value="${!token_var:-}"
  if [[ -n "$token_value" && ${#token_value} -lt 20 ]]; then
    log ERROR "${token_var} is unexpectedly short"
    fail=1
  fi
done

if [[ $fail -ne 0 ]]; then
  log ERROR 'agent environment validation failed'
  exit 1
fi

log INFO 'agent environment validation passed'