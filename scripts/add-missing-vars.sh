#!/usr/bin/env bash
set -Eeuo pipefail

echo "🧩 Adding missing Terraform variables..."

for env in dev staging prod; do
  FILE="terraform/environments/$env/variables.tf"

  echo "✏️ Updating $FILE"

  cat >> "$FILE" <<'TF'

# -----------------------------------------------------------------------------
# Feature flags
# -----------------------------------------------------------------------------
variable "enable_foundation" {
  type    = bool
  default = true
}

variable "enable_zero_trust" {
  type    = bool
  default = true
}

variable "enable_networking" {
  type    = bool
  default = true
}

variable "enable_workers_ai" {
  type    = bool
  default = true
}

variable "enable_monitoring_security" {
  type    = bool
  default = true
}

# -----------------------------------------------------------------------------
# Plan tier
# -----------------------------------------------------------------------------
variable "cloudflare_plan_tier" {
  type    = string
  default = "Free"
}
TF

done

echo
echo "✅ Missing variables added"
echo
echo "Now run:"
echo "cd terraform/environments/prod"
echo "terraform init"
echo "terraform plan"
