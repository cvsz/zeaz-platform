#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

required_vars=(
  CF_ACCOUNT_ID
  CF_ZONE_ID
  CF_DNS_TOKEN
)

for key in "${required_vars[@]}"; do
  if [[ -z "${!key:-}" ]]; then
    printf '\nMissing environment variable: %s\n' "${key}"
    exit 1
  fi
done

printf '\nEnvironment loaded successfully.\n'
