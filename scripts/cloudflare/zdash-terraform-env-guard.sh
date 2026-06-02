#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ENV_FILE="${ROOT_DIR}/.env.cloudflare.zdash.generated"
TF_DIR="${ROOT_DIR}/terraform/zdash"

if grep -RIn "REPLACE_WITH_ZEAZ_DEV_ZONE_ID\|REPLACE_WITH_TUNNEL_UUID\|REPLACE_WITH_REAL_ZONE_ID\|REPLACE_WITH_REAL_TUNNEL_UUID" \
  "${TF_DIR}" \
  --include='*.tfvars' \
  --include='*.auto.tfvars' \
  --include='terraform.tfvars' >/tmp/zdash-placeholder-tfvars.log 2>/dev/null; then
  cat /tmp/zdash-placeholder-tfvars.log >&2
  echo "ERROR: placeholder values found in Terraform auto-loaded tfvars. Remove or replace them." >&2
  exit 1
fi

if [[ ! -f "$ENV_FILE" ]]; then
  echo "ERROR: missing ${ENV_FILE}; run make cf-zdash-preflight first" >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

if [[ -z "${TF_VAR_cloudflare_zone_id:-}" || "${TF_VAR_cloudflare_zone_id:-}" == REPLACE_* ]]; then
  echo "ERROR: invalid TF_VAR_cloudflare_zone_id" >&2
  exit 1
fi

if [[ -z "${TF_VAR_cloudflare_tunnel_id:-}" || "${TF_VAR_cloudflare_tunnel_id:-}" == REPLACE_* ]]; then
  echo "ERROR: invalid TF_VAR_cloudflare_tunnel_id" >&2
  exit 1
fi

exec "$@"
