terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.30"
    }
  }

  backend "local" {}
}

provider "cloudflare" {
  api_token = var.cf_api_token
}
