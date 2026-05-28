#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔥 Final Cloudflare Terraform cleanup..."

ROOT="terraform"

# -----------------------------------------------------------------------------
# Fix variable blocks inside main.tf (envs)
# -----------------------------------------------------------------------------
find "$ROOT/environments" -type f -name "main.tf" | while read -r f; do
  echo "🧩 Fixing vars in $f"

  sed -i \
    -e 's/variable "cf_account_id"/variable "cloudflare_account_id"/g' \
    -e 's/variable "cf_zone_id"/variable "cloudflare_zone_id"/g' \
    -e 's/variable "cf_api_token"/variable "cloudflare_bootstrap_token"/g' \
    "$f"

  sed -i \
    -e 's/var\.cf_account_id/var.cloudflare_account_id/g' \
    -e 's/var\.cf_zone_id/var.cloudflare_zone_id/g' \
    -e 's/var\.cf_api_token/var.cloudflare_bootstrap_token/g' \
    "$f"
done

# -----------------------------------------------------------------------------
# Fix provider usage (IMPORTANT)
# -----------------------------------------------------------------------------
echo "🔧 Fixing provider tokens..."

find "$ROOT" -type f -name "*.tf" | while read -r f; do
  sed -i \
    -e 's/var\.cf_dns_token/var.cloudflare_bootstrap_token/g' \
    -e 's/var\.cf_api_token/var.cloudflare_bootstrap_token/g' \
    "$f"
done

# -----------------------------------------------------------------------------
# Fix validation messages (cosmetic but useful)
# -----------------------------------------------------------------------------
find "$ROOT" -type f -name "*.tf" | while read -r f; do
  sed -i \
    -e 's/cf_account_id/cloudflare_account_id/g' \
    -e 's/cf_zone_id/cloudflare_zone_id/g' \
    -e 's/cf_api_token/cloudflare_bootstrap_token/g' \
    "$f"
done

# -----------------------------------------------------------------------------
# Remove legacy var declarations from variables.tf (root)
# -----------------------------------------------------------------------------
echo "🧹 Cleaning old variable declarations..."

find "$ROOT" -type f -name "variables.tf" | while read -r f; do
  sed -i '/variable "cf_account_id"/,/}/d' "$f"
  sed -i '/variable "cf_zone_id"/,/}/d' "$f"
  sed -i '/variable "cf_api_token"/,/}/d' "$f"
done

# -----------------------------------------------------------------------------
# Ensure new variables exist (root environments)
# -----------------------------------------------------------------------------
for env in dev staging prod; do
  FILE="terraform/environments/$env/variables.tf"

  mkdir -p "$(dirname "$FILE")"

  cat > "$FILE" <<'TF'
variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "primary_domain" {
  type    = string
  default = "zeaz.dev"
}
TF
done

echo
echo "✅ FINAL CLEAN COMPLETE"
echo
echo "Now run:"
echo "export TF_VAR_cloudflare_account_id=\$CLOUDFLARE_ACCOUNT_ID"
echo "export TF_VAR_cloudflare_zone_id=\$CLOUDFLARE_ZONE_ID"
echo "export TF_VAR_cloudflare_bootstrap_token=\$CLOUDFLARE_BOOTSTRAP_TOKEN"
echo
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"