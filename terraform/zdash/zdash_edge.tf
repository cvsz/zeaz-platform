terraform {
  required_providers {
    cloudflare = {
      source = "cloudflare/cloudflare"
    }
  }
}

variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for zeaz.dev"
  type        = string
}

variable "cloudflare_tunnel_id" {
  description = "Cloudflare Tunnel UUID for zeaz.dev"
  type        = string
}

variable "zdash_domain" {
  description = "Primary zDash frontend hostname"
  type        = string
  default     = "zdash.zeaz.dev"
}

variable "zdash_api_domain" {
  description = "zDash API hostname. Existing Cloudflare route currently uses api-zdash.zeaz.dev."
  type        = string
  default     = "api-zdash.zeaz.dev"
}

variable "zdash_release_domain" {
  description = "Optional public release evidence hostname"
  type        = string
  default     = "release.zeaz.dev"
}

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
