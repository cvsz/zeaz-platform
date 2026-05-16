#!/usr/bin/env bash
set -Eeuo pipefail

echo "🧩 Adding final required input variables..."

for env in dev staging prod; do
  FILE="terraform/environments/$env/variables.tf"

  echo "✏️ Updating $FILE"

  cat >> "$FILE" <<'TF'

# -----------------------------------------------------------------------------
# Zero Trust / Access
# -----------------------------------------------------------------------------
variable "access_application_id" {
  description = "Cloudflare Access Application ID"
  type        = string
  default     = ""
}

variable "saml_metadata_url" {
  description = "SAML metadata URL"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Tunnel
# -----------------------------------------------------------------------------
variable "tunnel_secret" {
  description = "Cloudflare Tunnel secret"
  type        = string
  sensitive   = true
  default     = ""
}
TF

done

echo
echo "✅ Final input variables added"
echo
echo "Now run:"
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"
