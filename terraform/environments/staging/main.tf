terraform {
  required_version = ">= 1.7.0"

  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

provider "cloudflare" {
}

locals {
  is_enterprise = lower(var.cloudflare_plan_tier) == "enterprise"
}














module "dns" {
  count   = var.enable_foundation ? 1 : 0
  source  = "../../modules/cloudflare-dns"
  zone_id = var.cloudflare_zone_id
  records = {}
}

module "access_app" {
  count      = var.enable_zero_trust ? 1 : 0
  source     = "../../modules/cloudflare-access-app"
  account_id = var.cloudflare_account_id
  name       = "staging-access-app"
  domain     = "auth.${var.primary_domain}"
}

module "access_policy" {
  count          = var.enable_zero_trust ? 1 : 0
  source         = "../../modules/cloudflare-access-policy"
  account_id     = var.cloudflare_account_id
  application_id = var.access_application_id
  name           = "staging-allow-policy"
}

module "saml_provider" {
  count        = var.enable_zero_trust ? 1 : 0
  source       = "../../modules/cloudflare-saml-provider"
  account_id   = var.cloudflare_account_id
  name         = "staging-saml-provider"
  metadata_url = var.saml_metadata_url
}

module "tunnel" {
  count      = var.enable_networking ? 1 : 0
  source     = "../../modules/cloudflare-tunnel"
  account_id = var.cloudflare_account_id
  name       = "staging-tunnel"
  secret     = var.tunnel_secret
}

module "workers" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-workers"
  account_id = var.cloudflare_account_id
  name       = "staging-workers"
}

module "r2" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-r2"
  account_id = var.cloudflare_account_id
  name       = "staging-r2"
}

module "d1" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-d1"
  account_id = var.cloudflare_account_id
  name       = "staging-d1"
}

module "waf" {
  count         = var.enable_monitoring_security ? 1 : 0
  source        = "../../modules/cloudflare-waf"
  zone_id       = var.cloudflare_zone_id
  redirect_host = var.primary_domain
}

module "api_shield" {
  count   = var.enable_monitoring_security && local.is_enterprise ? 1 : 0
  source  = "../../modules/cloudflare-api-shield"
  zone_id = var.cloudflare_zone_id
}

output "enterprise_features_warning" {
  description = "Warning message when enterprise-only resources are disabled."
  value       = local.is_enterprise ? "" : "Cloudflare plan is not Enterprise; enterprise-only resources are skipped (API Shield, advanced Zero Trust controls)."
}
