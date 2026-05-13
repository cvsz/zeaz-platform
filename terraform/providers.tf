terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.30"
    }
  }
}

provider "cloudflare" {
  api_token = var.cf_api_token
}

provider "cloudflare" {
  alias     = "dns"
  api_token = var.cf_dns_token
}

provider "cloudflare" {
  alias     = "waf"
  api_token = coalesce(var.cf_waf_token, var.cf_api_token)
}
