terraform {
  required_version = ">= 1.6.0"
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
  phase_enabled = {
    f1_context             = contains(var.enabled_phases, "F1")
    f2_foundation          = contains(var.enabled_phases, "F2")
    f3_zero_trust          = contains(var.enabled_phases, "F3")
    f4_networking          = contains(var.enabled_phases, "F4")
    f5_workers_ai          = contains(var.enabled_phases, "F5")
    f6_monitoring_security = contains(var.enabled_phases, "F6")
  }
  enterprise_only = lower(var.cloudflare_plan_tier) == "enterprise"
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
variable "environment" {
  type        = string
  description = "Environment name"
  nullable    = false
  default     = "staging"
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be dev, staging, or prod."
  }
}
variable "cloudflare_plan_tier" {
  type        = string
  description = "Cloudflare plan tier"
  nullable    = false
  default     = "Free"
  validation {
    condition     = contains(["Free", "Pro", "Business", "Enterprise"], var.cloudflare_plan_tier)
    error_message = "cloudflare_plan_tier must be Free|Pro|Business|Enterprise."
  }
}
variable "enabled_phases" {
  type        = set(string)
  description = "Deployment phases to run"
  nullable    = false
  default     = ["F1", "F2"]
  validation {
    condition     = length(setsubtract(var.enabled_phases, ["F1", "F2", "F3", "F4", "F5", "F6"])) == 0
    error_message = "enabled_phases can only include F1..F6."
  }
}

module "dns" {
  count   = local.phase_enabled.f2_foundation ? 1 : 0
  source  = "../../modules/cloudflare-dns"
  zone_id = var.cf_zone_id
  records = {}
}

module "api_shield" {
  count   = local.phase_enabled.f6_monitoring_security && local.enterprise_only ? 1 : 0
  source  = "../../modules/cloudflare-api-shield"
  zone_id = var.cf_zone_id
}
