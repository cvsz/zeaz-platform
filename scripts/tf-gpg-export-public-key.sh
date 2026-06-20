#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# Export Terraform provider public signing key
#
# Usage:
#   bash scripts/tf-gpg-export-public-key.sh KEY_ID_OR_EMAIL
# ============================================================

KEY="${1:-}"

if [[ -z "$KEY" ]]; then
  echo "Usage: bash scripts/tf-gpg-export-public-key.sh KEY_ID_OR_EMAIL" >&2
  exit 1
fi

mkdir -p .secrets

gpg --armor --export "$KEY" > .secrets/terraform-provider-public.gpg

echo "Exported:"
echo ".secrets/terraform-provider-public.gpg"
echo
echo "Upload this public key to:"
echo "Terraform Registry -> User Settings -> Signing Keys"
