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
}

provider "cloudflare" {
  alias     = "dns"
}

provider "cloudflare" {
  alias     = "waf"
}
