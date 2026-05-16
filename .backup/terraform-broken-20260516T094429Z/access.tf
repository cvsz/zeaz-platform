locals {
  access_apps = var.enable_zero_trust ? {
    auth = {
      session_duration = "24h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id, module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    zveo = {
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    studio = {
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    analytics = {
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    app = {
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    pay = {
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    treasury = {
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    admin_wallet = {
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
  } : {}

module "identity_provider_ai" {
  count = var.enable_zero_trust ? 1 : 0

  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cloudflare_account_id
  provider_type = var.identity_provider_type
  attributes    = ["email", "name", "username", "groups", "role", "ai_access", "publishing_access"]

  oidc_issuer_url    = var.identity_provider_type == "oidc" ? var.oidc_issuer_url : null
  oidc_client_id     = var.identity_provider_type == "oidc" ? var.oidc_client_id : null
  oidc_client_secret = var.identity_provider_type == "oidc" ? var.oidc_client_secret : null

module "identity_provider_finance" {
  count = var.enable_zero_trust ? 1 : 0

  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cloudflare_account_id
  provider_type = var.identity_provider_type
  attributes    = ["email", "name", "username", "groups", "role", "wallet_access", "crypto_access"]

  oidc_issuer_url    = var.identity_provider_type == "oidc" ? var.oidc_issuer_url : null
  oidc_client_id     = var.identity_provider_type == "oidc" ? var.oidc_client_id : null
  oidc_client_secret = var.identity_provider_type == "oidc" ? var.oidc_client_secret : null

module "access_application" {
  for_each = local.access_apps

  source           = "./modules/cloudflare-access-app"
  account_id       = var.cloudflare_account_id
  session_duration = each.value.session_duration
  allowed_idps     = each.value.allowed_idps

module "access_policy" {
  for_each = local.access_apps

  source                = "./modules/cloudflare-access-policy"
  account_id            = var.cloudflare_account_id
  precedence            = 1
  decision              = "allow"
  include_groups        = []
  include_email_domains = [var.domain]
  require_mfa           = each.value.require_mfa
