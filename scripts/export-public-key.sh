#!/usr/bin/env bash
set -Eeuo pipefail

KEY="${1:-}"

if [[ -z "$KEY" ]]; then
  echo "Usage: bash scripts/export-public-key.sh KEY_ID_OR_EMAIL" >&2
  exit 1
fi

mkdir -p .secrets

gpg --armor --export "$KEY" > .secrets/terraform-provider-public.gpg

echo "Exported public key:"
echo ".secrets/terraform-provider-public.gpg"
echo
echo "Upload it to Terraform Registry -> User Settings -> Signing Keys."
