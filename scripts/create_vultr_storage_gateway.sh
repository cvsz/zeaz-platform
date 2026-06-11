#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Create Vultr Storage Gateway Script
# Usage: ./scripts/create_vultr_storage_gateway.sh

if [[ -z "${VULTR_API_KEY:-}" ]]; then
  echo "Error: VULTR_API_KEY environment variable is not set."
  echo "Please set it before running this script: export VULTR_API_KEY='your-key'"
  exit 1
fi

echo "[*] Creating Vultr Storage Gateway..."
# Ensure you adjust the payload to match your region and required specifications
curl -s -X POST "https://api.vultr.com/v2/storage-gateways" \
  -H "Authorization: Bearer ${VULTR_API_KEY}" \
  -H "Content-Type: application/json" \
  -d '{
    "region": "lhr",
    "description": "zeaz-platform-storage-gateway"
  }' | jq .

echo "[+] Operation completed."
