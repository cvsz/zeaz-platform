#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
TF_DIR="${ROOT_DIR}/terraform/zdash"

mkdir -p "$TF_DIR" "${ROOT_DIR}/docs/reports/generated"

# Remove legacy monolithic config to prevent duplicate provider/variable/local/resource declarations.
rm -f "${TF_DIR}/zdash_edge.tf"

cat > "${TF_DIR}/versions.tf" <<'TF'
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
  }
}
TF

cat > "${TF_DIR}/variables.tf" <<'TF'
variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for zeaz.dev"
  type        = string

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cloudflare_zone_id))
    error_message = "cloudflare_zone_id must be the real 32-character Cloudflare zone ID, not a placeholder."
  }
}

variable "cloudflare_tunnel_id" {
  description = "Cloudflare Tunnel UUID for zeaz.dev"
  type        = string

  validation {
    condition     = can(regex("^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$", var.cloudflare_tunnel_id))
    error_message = "cloudflare_tunnel_id must be the real Cloudflare Tunnel UUID, not a placeholder."
  }
}

variable "zdash_domain" {
  description = "zDash frontend hostname"
  type        = string
  default     = "zzdash.zeaz.dev"
}

variable "zdash_api_domain" {
  description = "zDash API hostname matching current Cloudflare route"
  type        = string
  default     = "api-zzdash.zeaz.dev"
}

variable "zdash_release_domain" {
  description = "Optional release evidence hostname"
  type        = string
  default     = "release.zeaz.dev"
}
TF

cat > "${TF_DIR}/main.tf" <<'TF'
locals {
  tunnel_target = "${var.cloudflare_tunnel_id}.cfargotunnel.com"

  zdash_dns_records = {
    zdash_frontend = {
      name    = var.zdash_domain
      type    = "CNAME"
      content = local.tunnel_target
      proxied = true
      comment = "zDash frontend via Cloudflare Tunnel"
    }

    zdash_api = {
      name    = var.zdash_api_domain
      type    = "CNAME"
      content = local.tunnel_target
      proxied = true
      comment = "zDash API via Cloudflare Tunnel"
    }

    zdash_release = {
      name    = var.zdash_release_domain
      type    = "CNAME"
      content = local.tunnel_target
      proxied = true
      comment = "zDash release evidence via Cloudflare Tunnel"
    }
  }
}

resource "cloudflare_dns_record" "zdash" {
  for_each = local.zdash_dns_records

  zone_id = var.cloudflare_zone_id
  name    = each.value.name
  type    = each.value.type
  content = each.value.content
  proxied = each.value.proxied
  ttl     = 1
  comment = each.value.comment
}
TF

cat > "${TF_DIR}/outputs.tf" <<'TF'
output "zdash_dns_records" {
  description = "zDash DNS records managed by Terraform"
  value = {
    for key, record in cloudflare_dns_record.zdash :
    key => {
      id      = record.id
      name    = record.name
      type    = record.type
      content = record.content
      proxied = record.proxied
    }
  }
}
TF

cat > "${TF_DIR}/terraform.tfvars.example" <<'TF'
cloudflare_zone_id   = "REPLACE_WITH_REAL_ZONE_ID"
cloudflare_tunnel_id = "REPLACE_WITH_REAL_TUNNEL_UUID"

zdash_domain         = "zzdash.zeaz.dev"
zdash_api_domain     = "api-zzdash.zeaz.dev"
zdash_release_domain = "release.zeaz.dev"
TF

cat > "${TF_DIR}/README.md" <<'MD'
# zDash Cloudflare Terraform

Terraform-managed DNS records for integrated zDash under `apps/zdash`.

Managed hostnames:

- `zzdash.zeaz.dev`
- `api-zzdash.zeaz.dev`
- `release.zeaz.dev`

Rules:

- Use scoped `CLOUDFLARE_API_TOKEN`.
- Do not use Global API Key.
- Do not commit `.env`, `.env.cloudflare`, `.tfvars`, `.terraform/`, or Terraform state.
- Import existing DNS records before apply.
- Apply requires explicit Makefile guards.
MD

cat > "${ROOT_DIR}/docs/reports/generated/zdash-terraform-integration.md" <<MD
# zDash Terraform Integration

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

- Terraform path: \`terraform/zdash\`
- App path: \`apps/zdash\`
- Frontend hostname: \`zzdash.zeaz.dev\`
- API hostname: \`api-zzdash.zeaz.dev\`
- Release hostname: \`release.zeaz.dev\`

No Cloudflare changes were made by this script.
MD

echo "PASS: zDash Terraform files generated under ${TF_DIR}"
