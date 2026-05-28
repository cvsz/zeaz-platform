#!/usr/bin/env bash
set -Eeuo pipefail

echo "🧨 Backing up old Terraform..."
mkdir -p .backup
mv terraform ".backup/terraform-broken-$(date -u +%Y%m%dT%H%M%SZ)" 2>/dev/null || true

echo "🚀 Regenerating clean Terraform system..."

mkdir -p terraform/environments/{dev,staging,prod} .github/workflows workers/src

cat > terraform/versions.tf <<'TF'
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.52"
    }
  }
}
TF

cat > terraform/variables.tf <<'TF'
variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }

variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "primary_domain" {
  type    = string
  default = "zeaz.dev"
}
TF

cat > terraform/providers.tf <<'TF'
provider "cloudflare" {
  api_token = var.cloudflare_bootstrap_token
}
TF

cat > terraform/main.tf <<'TF'
# Clean baseline Terraform root.
# Re-add modules only after CI is green.

output "cloudflare_account_id" {
  value = var.cloudflare_account_id
}

output "cloudflare_zone_id" {
  value = var.cloudflare_zone_id
}

output "primary_domain" {
  value = var.primary_domain
}
TF

for env in dev staging prod; do
cat > terraform/environments/$env/main.tf <<TF
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.52"
    }
  }
}

provider "cloudflare" {
  api_token = var.cloudflare_bootstrap_token
}

variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }

variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "primary_domain" {
  type    = string
  default = "zeaz.dev"
}

output "environment" {
  value = "$env"
}

output "primary_domain" {
  value = var.primary_domain
}
TF
done

cat > workers/src/index.js <<'JS'
export default {
  async fetch() {
    return new Response("zeaz-platform worker online\n", {
      headers: { "content-type": "text/plain" }
    });
  }
}
JS

cat > wrangler.toml <<'TOML'
name = "zeaz-platform"
main = "workers/src/index.js"
compatibility_date = "2025-01-01"
workers_dev = true
TOML

cat > .github/workflows/deploy-worker.yml <<'YAML'
name: deploy-worker

on:
  workflow_dispatch:
  push:
    branches: [master]

jobs:
  terraform-validate:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
      - run: terraform init
      - run: terraform validate

  deploy-worker:
    runs-on: ubuntu-latest
    needs: terraform-validate
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_WORKERS_TOKEN }}
YAML

echo "✅ Clean system regenerated."
echo "Next:"
echo "  terraform -chdir=terraform init"
echo "  terraform -chdir=terraform validate"
echo "  git add ."
echo "  git commit -m 'rebuild(terraform): clean cloudflare platform baseline'"
echo "  git push"