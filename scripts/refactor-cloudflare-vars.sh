#!/usr/bin/env bash
set -Eeuo pipefail

echo "🚀 Refactoring Terraform variables → cloudflare_*"

ROOT="terraform"

# -----------------------------------------------------------------------------
# Backup
# -----------------------------------------------------------------------------
BACKUP_DIR=".backup-refactor-$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

echo "📦 Creating backup in $BACKUP_DIR"
cp -r "$ROOT" "$BACKUP_DIR/"

# -----------------------------------------------------------------------------
# Find all .tf files
# -----------------------------------------------------------------------------
mapfile -t FILES < <(find "$ROOT" -type f -name "*.tf")

echo "🔍 Found ${#FILES[@]} Terraform files"

# -----------------------------------------------------------------------------
# Replace variables safely
# -----------------------------------------------------------------------------
for f in "${FILES[@]}"; do
  echo "✏️  Processing $f"

  sed -i \
    -e 's/var\.cf_account_id/var.cloudflare_account_id/g' \
    -e 's/var\.cf_zone_id/var.cloudflare_zone_id/g' \
    -e 's/var\.cf_api_token/var.cloudflare_bootstrap_token/g' \
    -e 's/var\.cf_api_key/var.cloudflare_bootstrap_token/g' \
    "$f"

  # Fix provider blocks
  sed -i \
    -e 's/api_token *= *var\.cf_api_token/api_token = var.cloudflare_bootstrap_token/g' \
    "$f"
done

# -----------------------------------------------------------------------------
# Fix variable declarations (root modules)
# -----------------------------------------------------------------------------
echo "🔧 Fixing variable blocks..."

find "$ROOT" -type f -name "variables.tf" | while read -r file; do
  echo "🧩 Updating $file"

  sed -i \
    -e 's/variable "cf_account_id"/variable "cloudflare_account_id"/g' \
    -e 's/variable "cf_zone_id"/variable "cloudflare_zone_id"/g' \
    -e 's/variable "cf_api_token"/variable "cloudflare_bootstrap_token"/g' \
    "$file"

  # Ensure bootstrap token is sensitive
  if grep -q 'variable "cloudflare_bootstrap_token"' "$file"; then
    if ! grep -q 'sensitive *= *true' "$file"; then
      sed -i '/variable "cloudflare_bootstrap_token"/,/}/ s/}/  sensitive = true\n}/' "$file"
    fi
  fi
done

# -----------------------------------------------------------------------------
# Ensure provider exists in each environment
# -----------------------------------------------------------------------------
for env in dev staging prod; do
  FILE="terraform/environments/$env/versions.tf"

  if [[ -f "$FILE" ]]; then
    if ! grep -q "api_token" "$FILE"; then
      echo "🔧 Injecting provider into $FILE"
      cat >> "$FILE" <<'TF'

provider "cloudflare" {
  api_token = var.cloudflare_bootstrap_token
}
TF
    fi
  fi
done

# -----------------------------------------------------------------------------
# Clean old references (optional warning)
# -----------------------------------------------------------------------------
echo "🔎 Checking for leftover old variables..."

if grep -R "cf_" "$ROOT" | grep -v "cloudflare_" ; then
  echo "⚠️  Some old cf_* references still exist — review manually"
else
  echo "✅ No legacy variables found"
fi

# -----------------------------------------------------------------------------
# Done
# -----------------------------------------------------------------------------
echo
echo "✅ Refactor complete!"
echo
echo "Next:"
echo "export TF_VAR_cloudflare_account_id=\$CF_ACCOUNT_ID"
echo "export TF_VAR_cloudflare_zone_id=\$CF_ZONE_ID"
echo "export TF_VAR_cloudflare_bootstrap_token=\$CF_BOOTSTRAP_TOKEN"
echo
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"
