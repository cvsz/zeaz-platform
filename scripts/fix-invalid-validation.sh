#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔥 Fixing invalid Terraform validation blocks..."

ROOT="terraform"

# -----------------------------------------------------------------------------
# Remove ALL cf_* variable blocks from main.tf files
# -----------------------------------------------------------------------------
find "$ROOT/environments" -type f -name "main.tf" | while read -r f; do
  echo "🧹 Cleaning $f"

  # Remove full variable blocks for old vars
  sed -i '/variable "cf_api_token"/,/}/d' "$f"
  sed -i '/variable "cf_account_id"/,/}/d' "$f"
  sed -i '/variable "cf_zone_id"/,/}/d' "$f"
done

# -----------------------------------------------------------------------------
# Safety: remove any leftover invalid validation referencing wrong vars
# -----------------------------------------------------------------------------
find "$ROOT" -type f -name "*.tf" | while read -r f; do
  sed -i '/var.cloudflare_bootstrap_token/d' "$f"
done

echo
echo "✅ Invalid validation blocks removed"
echo
echo "Now run:"
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"
