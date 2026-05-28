#!/usr/bin/env bash
set -Eeuo pipefail

TARGET="terraform/environments/prod/variables.tf"

mkdir -p terraform/environments/prod

echo "🔧 Fixing Terraform root variables..."

# Backup if exists
if [[ -f "$TARGET" ]]; then
  cp "$TARGET" "$TARGET.bak.$(date -u +%Y%m%dT%H%M%SZ)"
fi

cat > "$TARGET" <<'TF'
variable "cloudflare_account_id" {
  description = "Cloudflare account ID"
  type        = string
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "cloudflare_bootstrap_token" {
  description = "Bootstrap API token for Terraform"
  type        = string
  sensitive   = true
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "prod"
}
TF

# Ensure provider uses correct token
VERSIONS_FILE="terraform/environments/prod/versions.tf"

if [[ -f "$VERSIONS_FILE" ]]; then
  if ! grep -q "api_token" "$VERSIONS_FILE"; then
    echo "🔧 Injecting provider auth..."
    cat >> "$VERSIONS_FILE" <<'TF'

provider "cloudflare" {
  api_token = var.cloudflare_bootstrap_token
}
TF
  fi
fi

echo "✅ Terraform variables fixed."

echo
echo "Next:"
echo "export TF_VAR_cloudflare_account_id=\$CLOUDFLARE_ACCOUNT_ID"
echo "export TF_VAR_cloudflare_zone_id=\$CLOUDFLARE_ZONE_ID"
echo "export TF_VAR_cloudflare_bootstrap_token=\$CLOUDFLARE_BOOTSTRAP_TOKEN"
echo
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"