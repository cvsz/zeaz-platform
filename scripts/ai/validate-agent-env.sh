#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

required_vars=(
  CF_ACCOUNT_ID CF_ZONE_ID CF_DNS_TOKEN CF_TUNNEL_TOKEN CF_ZT_TOKEN CF_WAF_TOKEN CF_WORKERS_TOKEN
  IDENTITY_PROVIDER_TYPE IDENTITY_PROVIDER_VENDOR IDENTITY_PROVIDER_METADATA_URL
  ENVIRONMENT REGION PRIMARY_DOMAIN CLOUDFLARE_PLAN_TIER
)

fail=0
for v in "${required_vars[@]}"; do
  if [[ -z "${!v:-}" ]]; then
    echo "[ERROR] missing variable: $v"
    fail=1
  fi
done

[[ "${PRIMARY_DOMAIN:-}" == "zeaz.dev" ]] || { echo "[ERROR] PRIMARY_DOMAIN must be zeaz.dev"; fail=1; }
[[ "${CF_ACCOUNT_ID:-}" =~ ^[a-f0-9]{32}$ ]] || { echo "[ERROR] CF_ACCOUNT_ID must be 32-char hex"; fail=1; }
[[ "${CF_ZONE_ID:-}" =~ ^[a-f0-9]{32}$ ]] || { echo "[ERROR] CF_ZONE_ID must be 32-char hex"; fail=1; }
[[ "${CLOUDFLARE_PLAN_TIER:-}" =~ ^(Free|Pro|Business|Enterprise)$ ]] || { echo "[ERROR] invalid CLOUDFLARE_PLAN_TIER"; fail=1; }

if [[ $fail -ne 0 ]]; then
  exit 1
fi

echo "Agent environment validation passed"
