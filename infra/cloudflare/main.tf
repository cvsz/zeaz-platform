terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
  # configured via environment variables CLOUDFLARE_API_TOKEN
}

module "dns" {
  source = "../modules/cloudflare-dns"
}

module "tunnel" {
  source = "../modules/cloudflare-tunnel"
}

module "access" {
  source = "../modules/cloudflare-access-app"
}

module "waf" {
  source = "../modules/cloudflare-waf"
}

module "rules" {
  source = "../modules/cloudflare-rules"
}

module "cache" {
  source = "../modules/cloudflare-cache"
}

module "pages" {
  source = "../modules/cloudflare-pages"
}
