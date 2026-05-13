locals {
  access_apps = var.enable_zero_trust ? {
    auth = {
      domain           = "auth.${var.domain}"
      session_duration = "24h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id, module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    zveo = {
      domain           = "zveo.${var.domain}"
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    studio = {
      domain           = "studio.${var.domain}"
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    analytics = {
      domain           = "analytics.${var.domain}"
      session_duration = "8h"
      allowed_idps     = [module.identity_provider_ai[0].identity_provider_id]
      require_mfa      = true
    }
    app = {
      domain           = "app.${var.domain}"
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    pay = {
      domain           = "pay.${var.domain}"
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    treasury = {
      domain           = "treasury.${var.domain}"
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
    admin_wallet = {
      domain           = "admin-wallet.${var.domain}"
      session_duration = "4h"
      allowed_idps     = [module.identity_provider_finance[0].identity_provider_id]
      require_mfa      = true
    }
  } : {}
}

module "identity_provider_ai" {
  count = var.enable_zero_trust ? 1 : 0

  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cf_account_id
  name          = "zeazdev-ai-saml"
  provider_type = var.identity_provider_type
  metadata_url  = var.identity_provider_metadata_url
  attributes    = ["email", "name", "username", "groups", "role", "ai_access", "publishing_access"]

  oidc_issuer_url    = var.identity_provider_type == "oidc" ? var.oidc_issuer_url : null
  oidc_client_id     = var.identity_provider_type == "oidc" ? var.oidc_client_id : null
  oidc_client_secret = var.identity_provider_type == "oidc" ? var.oidc_client_secret : null
}

module "identity_provider_finance" {
  count = var.enable_zero_trust ? 1 : 0

  source        = "./modules/cloudflare-saml-provider"
  account_id    = var.cf_account_id
  name          = "zeazdev-finance-saml"
  provider_type = var.identity_provider_type
  metadata_url  = var.identity_provider_metadata_url
  attributes    = ["email", "name", "username", "groups", "role", "wallet_access", "crypto_access"]

  oidc_issuer_url    = var.identity_provider_type == "oidc" ? var.oidc_issuer_url : null
  oidc_client_id     = var.identity_provider_type == "oidc" ? var.oidc_client_id : null
  oidc_client_secret = var.identity_provider_type == "oidc" ? var.oidc_client_secret : null
}

module "access_application" {
  for_each = local.access_apps

  source           = "./modules/cloudflare-access-app"
  account_id       = var.cf_account_id
  name             = "zeazdev-${var.environment}-${replace(each.key, "_", "-")}"
  domain           = each.value.domain
  session_duration = each.value.session_duration
  allowed_idps     = each.value.allowed_idps
}

module "access_policy" {
  for_each = local.access_apps

  source                = "./modules/cloudflare-access-policy"
  account_id            = var.cf_account_id
  application_id        = module.access_application[each.key].application_id
  name                  = "zeazdev-${var.environment}-${replace(each.key, "_", "-")}-allow"
  precedence            = 1
  decision              = "allow"
  include_groups        = []
  include_email_domains = [var.domain]
  require_mfa           = each.value.require_mfa
}
