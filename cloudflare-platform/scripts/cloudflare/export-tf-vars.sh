#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

########################################
# Export Terraform Variables
########################################

export TF_VAR_cf_api_token="${CF_API_TOKEN}"
export TF_VAR_cf_account_id="${CF_ACCOUNT_ID}"
export TF_VAR_cf_zone_id="${CF_ZONE_ID}"

printf '\nTerraform environment variables exported.\n'
