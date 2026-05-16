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
  value = "staging"
}

output "primary_domain" {
  value = var.primary_domain
}
