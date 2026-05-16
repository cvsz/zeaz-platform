locals {
  enterprise  = lower(var.plan_tier) == "enterprise"
  waf_enabled = var.enable_waf

module "dns" {
  source  = "./modules/cloudflare-dns"
  zone_id = var.cloudflare_zone_id

  providers = {
    cloudflare = cloudflare.dns
  }

  records = {
    auth = {
      type    = "CNAME"
      value   = "zveo.${var.domain}"
      ttl     = 1
      proxied = true
      comment = "Authentication endpoint"
    }

    api = {
      type    = "CNAME"
      value   = "app.${var.domain}"
      ttl     = 1
      proxied = true
      comment = "Primary API endpoint"
    }
  }

module "api_shield" {
  count   = local.enterprise ? 1 : 0
  source  = "./modules/cloudflare-api-shield"
  zone_id = var.cloudflare_zone_id

module "waf" {
  count  = local.waf_enabled ? 1 : 0
  source = "./modules/cloudflare-waf"

  providers = {
    cloudflare = cloudflare.waf
  }

  zone_id       = var.cloudflare_zone_id
  redirect_host = var.domain

module "workers" {
  source     = "./modules/cloudflare-workers"
  account_id = var.cloudflare_account_id

module "r2" {
  source     = "./modules/cloudflare-r2"
  account_id = var.cloudflare_account_id

module "d1" {
  source     = "./modules/cloudflare-d1"
  account_id = var.cloudflare_account_id

module "access_app_platform" {
  count = var.enable_zero_trust ? 1 : 0

  source     = "./modules/cloudflare-access-app"
  account_id = var.cloudflare_account_id

module "access_policy_platform" {
  count = var.enable_zero_trust ? 1 : 0

  source                = "./modules/cloudflare-access-policy"
  account_id            = var.cloudflare_account_id
  include_email_domains = [var.domain]

module "saml_provider_platform" {
  count = var.enable_zero_trust ? 1 : 0

  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cloudflare_account_id
  provider_type = var.identity_provider_type

module "tunnel_platform" {
  source     = "./modules/cloudflare-tunnel"
  account_id = var.cloudflare_account_id
  secret     = var.tunnel_secret
