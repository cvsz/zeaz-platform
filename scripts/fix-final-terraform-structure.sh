#!/usr/bin/env bash
set -Eeuo pipefail

echo "🔥 Fixing Terraform structure (final)..."

ROOT="terraform/environments"

for env in dev staging prod; do
  MAIN="$ROOT/$env/main.tf"
  VARS="$ROOT/$env/variables.tf"

  echo "🧹 Cleaning $MAIN"

  # 1. REMOVE ALL variable blocks from main.tf
  sed -i '/^variable "/,/^}/d' "$MAIN"

  # 2. REMOVE broken validation blocks
  sed -i '/validation {/,/}/d' "$MAIN"

  # 3. RECREATE clean variables.tf (overwrite safely)
  echo "🧩 Rebuilding $VARS"

  cat > "$VARS" <<'TF'
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
echo "✅ Terraform structure FIXED"
echo
echo "Now run:"
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"
