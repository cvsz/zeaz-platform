#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# ZeaZ Platform - Environment Validation Script
# Ensures required environment variables are set and meet basic criteria.

REQUIRED_VARS=(
  "CLOUDFLARE_ACCOUNT_ID"
  "CLOUDFLARE_ZONE_ID"
  "PRIMARY_DOMAIN"
  "DATABASE_URL"
)

echo "--- Validating Environment Variables ---"

MISSING_VARS=0
for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var:-}" ]; then
    echo "ERROR: Required environment variable '$var' is not set."
    MISSING_VARS=$((MISSING_VARS + 1))
  fi
done

if [ $MISSING_VARS -gt 0 ]; then
  echo "--- Validation Failed: $MISSING_VARS missing variable(s) ---"
  exit 1
fi

echo "--- Environment Validation Passed ---"
exit 0
