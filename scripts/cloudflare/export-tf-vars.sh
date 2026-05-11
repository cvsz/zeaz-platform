#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

source secrets/cloudflare.env

export TF_VAR_cf_account_id="${CF_ACCOUNT_ID}"
export TF_VAR_cf_zone_id="${CF_ZONE_ID}"
export TF_VAR_cf_dns_token="${CF_DNS_TOKEN}"

printf '\nTerraform variables exported.\n'
