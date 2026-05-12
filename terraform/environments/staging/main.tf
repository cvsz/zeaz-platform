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
  api_token = var.cf_api_token
}

locals {
  is_enterprise        = lower(var.cloudflare_plan_tier) == "enterprise"
}

variable "cf_api_token" {
  type        = string
  description = "Cloudflare API token"
  sensitive   = true
  nullable    = false

  validation {
    condition     = length(var.cf_api_token) >= 30
    error_message = "cf_api_token must be a valid API token."
  }
}

variable "cf_account_id" {
  type        = string
  description = "Cloudflare account ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", lower(var.cf_account_id)))
    error_message = "cf_account_id must be a 32-char hex string."
  }
}

variable "cf_zone_id" {
  type        = string
  description = "Cloudflare zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", lower(var.cf_zone_id)))
    error_message = "cf_zone_id must be a 32-char hex string."
  }
}

variable "primary_domain" {
  type        = string
  description = "Primary DNS domain"
  nullable    = false

  validation {
    condition     = can(regex("^[a-z0-9.-]+$", var.primary_domain))
    error_message = "primary_domain must be a valid domain."
  }
}

variable "cloudflare_plan_tier" {
  type        = string
  description = "Cloudflare plan tier"
  nullable    = false
  default     = "Free"

  validation {
    condition     = contains(["free", "pro", "business", "enterprise"], lower(var.cloudflare_plan_tier))
    error_message = "cloudflare_plan_tier must be Free, Pro, Business, or Enterprise."
  }
}

variable "enable_foundation" {
  type        = bool
  description = "Enable Phase F2 foundation resources."
  nullable    = false
  default     = true
}

variable "enable_zero_trust" {
  type        = bool
  description = "Enable Phase F3 zero trust resources."
  nullable    = false
  default     = false
}

variable "enable_networking" {
  type        = bool
  description = "Enable Phase F4 networking resources."
  nullable    = false
  default     = false
}

variable "enable_workers_ai" {
  type        = bool
  description = "Enable Phase F5 workers and AI resources."
  nullable    = false
  default     = false
}

variable "enable_monitoring_security" {
  type        = bool
  description = "Enable Phase F6 monitoring and security resources."
  nullable    = false
  default     = false
}

variable "access_application_id" {
  type        = string
  description = "Existing access application id for policy binding."
  nullable    = false
  default     = "00000000000000000000000000000000"
}

variable "saml_metadata_url" {
  type        = string
  description = "SAML metadata URL."
  nullable    = false
  default     = "https://example.com/saml/metadata"
}

variable "tunnel_secret" {
  type        = string
  description = "Tunnel secret in base64."
  nullable    = false
  sensitive   = true
  default     = "dGVzdC10dW5uZWwtc2VjcmV0LWRldGVybWluaXN0aWM="
}

module "dns" {
  count   = var.enable_foundation ? 1 : 0
  source  = "../../modules/cloudflare-dns"
  zone_id = var.cf_zone_id
  records = {}
}

module "access_app" {
  count      = var.enable_zero_trust ? 1 : 0
  source     = "../../modules/cloudflare-access-app"
  account_id = var.cf_account_id
  name       = "staging-access-app"
  domain     = "auth.${var.primary_domain}"
}

module "access_policy" {
  count          = var.enable_zero_trust ? 1 : 0
  source         = "../../modules/cloudflare-access-policy"
  account_id     = var.cf_account_id
  application_id = var.access_application_id
  name           = "staging-allow-policy"
}

module "saml_provider" {
  count        = var.enable_zero_trust ? 1 : 0
  source       = "../../modules/cloudflare-saml-provider"
  account_id   = var.cf_account_id
  name         = "staging-saml-provider"
  metadata_url = var.saml_metadata_url
}

module "tunnel" {
  count      = var.enable_networking ? 1 : 0
  source     = "../../modules/cloudflare-tunnel"
  account_id = var.cf_account_id
  name       = "staging-tunnel"
  secret     = var.tunnel_secret
}

module "workers" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-workers"
  account_id = var.cf_account_id
  name       = "staging-workers"
}

module "r2" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-r2"
  account_id = var.cf_account_id
  name       = "staging-r2"
}

module "d1" {
  count      = var.enable_workers_ai ? 1 : 0
  source     = "../../modules/cloudflare-d1"
  account_id = var.cf_account_id
  name       = "staging-d1"
}

module "waf" {
  count         = var.enable_monitoring_security ? 1 : 0
  source        = "../../modules/cloudflare-waf"
  zone_id       = var.cf_zone_id
  redirect_host = var.primary_domain
}

module "api_shield" {
  count   = var.enable_monitoring_security && local.is_enterprise ? 1 : 0
  source  = "../../modules/cloudflare-api-shield"
  zone_id = var.cf_zone_id
}

output "enterprise_features_warning" {
  description = "Warning message when enterprise-only resources are disabled."
  value       = local.is_enterprise ? "" : "Cloudflare plan is not Enterprise; enterprise-only resources are skipped (API Shield, advanced Zero Trust controls)."
}
