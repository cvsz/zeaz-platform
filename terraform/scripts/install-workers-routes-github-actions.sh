#!/usr/bin/env bash
set -Eeuo pipefail

mkdir -p terraform/workers .github/workflows src

cat > terraform/workers/versions.tf <<'TF'
terraform {
  required_version = ">= 1.5.0"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.19"
    }
  }
}
provider "cloudflare" {
  api_token = var.cloudflare_bootstrap_token
}
TF

cat > terraform/workers/variables.tf <<'TF'
variable "cloudflare_bootstrap_token" { type = string sensitive = true }
variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }
variable "worker_name" { type = string default = "zeaz-platform" }
variable "worker_route" { type = string default = "zeaz.dev/*" }
TF

cat > terraform/workers/main.tf <<'TF'
resource "cloudflare_workers_script" "app" {
  account_id = var.cloudflare_account_id
  script_name = var.worker_name
  content = file("${path.module}/../../src/worker.js")
  main_module = "worker.js"
  compatibility_date = "2025-01-01"
}

resource "cloudflare_workers_route" "app" {
  zone_id = var.cloudflare_zone_id
  pattern = var.worker_route
  script  = cloudflare_workers_script.app.script_name
}
TF

cat > src/worker.js <<'JS'
export default {
  async fetch(request) {
    return new Response("zeaz-platform worker ok\n", {
      headers: { "content-type": "text/plain" }
    });
  }
}
JS

cat > wrangler.toml <<'TOML'
name = "zeaz-platform"
main = "src/worker.js"
compatibility_date = "2025-01-01"
workers_dev = false
TOML

cat > .github/workflows/deploy-worker.yml <<'YAML'
name: deploy-worker

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  terraform-workers:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: terraform/workers
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3

      - run: terraform init
      - run: terraform apply -auto-approve
        env:
          TF_VAR_cloudflare_bootstrap_token: ${{ secrets.CF_BOOTSTRAP_TOKEN }}
          TF_VAR_cloudflare_account_id: ${{ secrets.CF_ACCOUNT_ID }}
          TF_VAR_cloudflare_zone_id: ${{ secrets.CF_ZONE_ID }}

  wrangler-deploy:
    runs-on: ubuntu-latest
    needs: terraform-workers
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: npm install --no-audit --no-fund || true
      - run: npx wrangler deploy
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CF_WORKERS_TOKEN }}
YAML

echo "Installed Workers + Routes Terraform and GitHub Actions pipeline."
