#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

find_root(){
  local d="${PROJECT_ROOT:-${PWD}}"
  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] || [[ -d "$d/terraform" ]] || [[ -f "$d/.env.example" ]] || [[ -f "$d/README.md" ]]; then
      printf '%s\n' "$d"
      return 0
    fi
    d="$(dirname "$d")"
  done
  printf '%s\n' "${PROJECT_ROOT:-${PWD}}"
}

ROOT="$(find_root)"
ENV_FILE="${ENV_FILE:-$ROOT/.env}"
TOKEN_ENV_FILE="${TOKEN_ENV_FILE:-$ROOT/.env.cloudflare}"

load_file(){
  local file="$1"
  [[ -f "$file" ]] || return 0
  set -a
  # shellcheck disable=SC1090
  source "$file"
  set +a
}

normalize_bool(){
  case "$1" in
    true|TRUE|True) printf 'true\n' ;;
    false|FALSE|False) printf 'false\n' ;;
    *) return 1 ;;
  esac
}

load_file "$TOKEN_ENV_FILE"
load_file "$ENV_FILE"

export TF_VAR_cf_api_token="${TF_VAR_cf_api_token:-${CF_API_TOKEN:-}}"
export TF_VAR_cf_dns_token="${TF_VAR_cf_dns_token:-${CF_DNS_TOKEN:-}}"
export TF_VAR_cf_zone_id="${TF_VAR_cf_zone_id:-${CF_ZONE_ID:-}}"
export TF_VAR_cf_waf_token="${TF_VAR_cf_waf_token:-${CF_WAF_TOKEN:-}}"
export TF_VAR_cf_account_id="${TF_VAR_cf_account_id:-${CF_ACCOUNT_ID:-}}"
export TF_VAR_domain="${TF_VAR_domain:-${PRIMARY_DOMAIN:-zeaz.dev}}"
export TF_VAR_plan_tier="${TF_VAR_plan_tier:-${CLOUDFLARE_PLAN_TIER:-Free}}"
export TF_VAR_environment="${TF_VAR_environment:-${ENVIRONMENT:-prod}}"
export TF_VAR_identity_provider_type="${TF_VAR_identity_provider_type:-${IDENTITY_PROVIDER_TYPE:-saml}}"
export TF_VAR_identity_provider_metadata_url="${TF_VAR_identity_provider_metadata_url:-${IDENTITY_PROVIDER_METADATA_URL:-}}"
export TF_VAR_tunnel_secret="${TF_VAR_tunnel_secret:-${TUNNEL_SECRET:-dGVzdC10dW5uZWwtc2VjcmV0LWRldGVybWluaXN0aWM=}}"
export TF_VAR_enable_waf="${TF_VAR_enable_waf:-${ENABLE_WAF:-false}}"
export TF_VAR_enable_zero_trust="${TF_VAR_enable_zero_trust:-${ENABLE_ZERO_TRUST:-false}}"

TF_VAR_enable_waf="$(normalize_bool "$TF_VAR_enable_waf")" || {
  printf 'ERROR: ENABLE_WAF/TF_VAR_enable_waf must be true or false\n' >&2
  exit 1
}
export TF_VAR_enable_waf

TF_VAR_enable_zero_trust="$(normalize_bool "$TF_VAR_enable_zero_trust")" || {
  printf 'ERROR: ENABLE_ZERO_TRUST/TF_VAR_enable_zero_trust must be true or false\n' >&2
  exit 1
}
export TF_VAR_enable_zero_trust

exec "$@"
