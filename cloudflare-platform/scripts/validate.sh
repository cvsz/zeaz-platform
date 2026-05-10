#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'
	'
log(){ printf '{"ts":"%s","level":"%s","msg":"%s"}
' "$(date -Iseconds)" "$1" "$2"; }
trap 'log ERROR "validation failed at line $LINENO"' ERR
required_vars=(
  "CF_ACCOUNT_ID"
  "CF_ZONE_ID"
  "CF_API_TOKEN"
  "CF_DNS_TOKEN"
  "CF_WORKERS_TOKEN"
  "CF_ZT_TOKEN"
  "CF_WAF_TOKEN"
  "CF_TUNNEL_TOKEN"
  "CF_R2_TOKEN"
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

for v in "${required_vars[@]}"; do
  [[ -n "${!v:-}" ]] || { log ERROR "$v is required"; exit 1; }
done
[[ "${CF_ACCOUNT_ID}" =~ ^[a-f0-9]{32}$ ]] || { log ERROR "CF_ACCOUNT_ID format"; exit 1; }
[[ "${CF_ZONE_ID}" =~ ^[a-f0-9]{32}$ ]] || { log ERROR "CF_ZONE_ID format"; exit 1; }
[[ "${PRIMARY_DOMAIN}" =~ ^[a-z0-9.-]+$ ]] || { log ERROR "PRIMARY_DOMAIN format"; exit 1; }
case "${CLOUDFLARE_PLAN_TIER}" in Free|Pro|Business|Enterprise) ;; *) log ERROR "invalid plan"; exit 1;; esac
for token in CF_API_TOKEN CF_DNS_TOKEN CF_WORKERS_TOKEN CF_ZT_TOKEN CF_WAF_TOKEN CF_TUNNEL_TOKEN CF_R2_TOKEN; do
  [[ ${#!token} -ge 20 ]] || { log ERROR "$token too short"; exit 1; }
done
log INFO "validation successful"
