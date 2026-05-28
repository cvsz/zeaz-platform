#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -d "$ROOT/terraform" || -f "$ROOT/.env.example" || -f "$ROOT/Makefile" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"

# shellcheck source=scripts/cloudflare/lib/env-scope.sh
source "$ROOT/scripts/cloudflare/lib/env-scope.sh"
cf_load_cloudflare_env_scope
cd "$PROJECT_ROOT"

normalize_bool(){
  case "${1:-}" in
    true|TRUE|True|1|yes|YES|Yes) printf 'true\n' ;;
    false|FALSE|False|0|no|NO|No|"") printf 'false\n' ;;
    *) return 1 ;;
  esac
}

# Terraform provider/API token preference:
#   1. Existing TF_VAR_* from caller
#   2. Scoped generated token for the specific module class
#   3. Generic Cloudflare API token
#   4. Bootstrap token as last resort for local plan/validate only
export TF_VAR_cf_api_token="${TF_VAR_cf_api_token:-${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_BOOTSTRAP_TOKEN:-}}}"
export TF_VAR_cf_dns_token="${TF_VAR_cf_dns_token:-${CLOUDFLARE_DNS_TOKEN:-${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_BOOTSTRAP_TOKEN:-}}}}"
export TF_VAR_cf_zone_id="${TF_VAR_cf_zone_id:-${CLOUDFLARE_ZONE_ID:-}}"
export TF_VAR_cf_waf_token="${TF_VAR_cf_waf_token:-${CLOUDFLARE_WAF_TOKEN:-${CLOUDFLARE_API_TOKEN:-${CLOUDFLARE_BOOTSTRAP_TOKEN:-}}}}"
export TF_VAR_cf_account_id="${TF_VAR_cf_account_id:-${CLOUDFLARE_ACCOUNT_ID:-}}"
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
