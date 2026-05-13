variable "cf_api_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare account-level API token. Required for Zero Trust, Tunnel, Workers, R2, D1, and account-level resources."
  nullable    = false

  validation {
    condition     = length(var.cf_api_token) >= 32
    error_message = "cf_api_token must be at least 32 characters"
  }
}

variable "cf_dns_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare DNS Token"
  nullable    = false

  validation {
    condition     = length(var.cf_dns_token) >= 32
    error_message = "cf_dns_token must be at least 32 characters"
  }
}

variable "cf_waf_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare WAF token. Required only when enable_waf=true."
  nullable    = true
  default     = null

  validation {
    condition     = var.cf_waf_token == null || var.cf_waf_token == "" || length(var.cf_waf_token) >= 32
    error_message = "cf_waf_token must be empty/null or at least 32 characters"
  }
}

variable "enable_waf" {
  type        = bool
  description = "Enable WAF and zone settings hardening resources. Requires Cloudflare token permissions for Zone:Read, Zone Settings:Edit, and WAF:Edit."
  nullable    = false
  default     = false
}

variable "enable_zero_trust" {
  type        = bool
  description = "Enable Zero Trust Access applications, policies, and identity providers. Requires complete SAML/OIDC IdP configuration."
  nullable    = false
  default     = false
}

variable "cf_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", lower(var.cf_zone_id)))
    error_message = "cf_zone_id must be a 32-character hexadecimal ID"
  }
}

variable "cf_account_id" {
  type        = string
  description = "Cloudflare Account ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", lower(var.cf_account_id)))
    error_message = "cf_account_id must be a 32-character hexadecimal ID"
  }
}

variable "domain" {
  type        = string
  description = "Primary DNS domain"
  nullable    = false
  default     = "zeaz.dev"

  validation {
    condition     = can(regex("^[a-z0-9.-]+$", var.domain))
    error_message = "domain must be a valid lower-case DNS domain"
  }
}

variable "plan_tier" {
  type        = string
  description = "Cloudflare plan tier"
  default     = "Free"
  nullable    = false

  validation {
    condition     = contains(["free", "pro", "business", "enterprise"], lower(var.plan_tier))
    error_message = "plan_tier must be one of Free, Pro, Business, Enterprise"
  }
}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  nullable    = false
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of dev, staging, prod"
  }
}

variable "identity_provider_type" {
  type        = string
  description = "Identity provider type for Zero Trust"
  nullable    = false
  default     = "saml"

  validation {
    condition     = contains(["saml", "oidc"], var.identity_provider_type)
    error_message = "identity_provider_type must be saml or oidc"
  }
}

variable "identity_provider_metadata_url" {
  type        = string
  description = "HTTPS metadata URL for SAML configuration"
  nullable    = false

  validation {
    condition     = can(regex("^https://", var.identity_provider_metadata_url))
    error_message = "identity_provider_metadata_url must start with https://"
  }
}

variable "oidc_issuer_url" {
  type        = string
  description = "OIDC issuer URL"
  nullable    = true
  default     = null
}

variable "oidc_client_id" {
  type        = string
  description = "OIDC client ID"
  nullable    = true
  default     = null
}

variable "oidc_client_secret" {
  type        = string
  description = "OIDC client secret"
  nullable    = true
  default     = null
  sensitive   = true
}

variable "tunnel_secret" {
  type        = string
  description = "Cloudflare Tunnel secret"
  nullable    = false
  sensitive   = true
  default     = "dGVzdC10dW5uZWwtc2VjcmV0LWRldGVybWluaXN0aWM="
}
