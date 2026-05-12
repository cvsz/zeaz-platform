locals {
  enterprise           = lower(var.plan_tier) == "enterprise"
}

module "dns" {
  source  = "./modules/cloudflare-dns"
  zone_id = var.cf_zone_id

  records = {
    auth = {
      name    = "auth"
      type    = "CNAME"
      value   = "auth.${var.domain}"
      ttl     = 1
      proxied = true
      comment = "Authentication endpoint"
    }

    api = {
      name    = "api"
      type    = "CNAME"
      value   = "api.${var.domain}"
      ttl     = 1
      proxied = true
      comment = "Primary API endpoint"
    }
  }
}

module "api_shield" {
  count   = local.enterprise ? 1 : 0
  source  = "./modules/cloudflare-api-shield"
  zone_id = var.cf_zone_id
}

module "waf" {
  source        = "./modules/cloudflare-waf"
  zone_id       = var.cf_zone_id
  redirect_host = var.domain
}

module "workers" {
  source     = "./modules/cloudflare-workers"
  account_id = var.cf_account_id
  name       = "edge-worker"
}

module "r2" {
  source     = "./modules/cloudflare-r2"
  account_id = var.cf_account_id
  name       = "platform-artifacts"
}

module "d1" {
  source     = "./modules/cloudflare-d1"
  account_id = var.cf_account_id
  name       = "platform-db"
}

module "access_app_platform" {
  source     = "./modules/cloudflare-access-app"
  account_id = var.cf_account_id
  name       = "platform-access"
  domain     = "auth.${var.domain}"
}

module "access_policy_platform" {
  source         = "./modules/cloudflare-access-policy"
  account_id     = var.cf_account_id
  application_id = module.access_app_platform.application_id
  name           = "allow-corp"
}

module "saml_provider_platform" {
  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cf_account_id
  name          = "corp-idp"
  provider_type = var.identity_provider_type
  metadata_url  = var.identity_provider_metadata_url
}

module "tunnel_platform" {
  source     = "./modules/cloudflare-tunnel"
  account_id = var.cf_account_id
  name       = "platform-tunnel"
  secret     = var.tunnel_secret
}
