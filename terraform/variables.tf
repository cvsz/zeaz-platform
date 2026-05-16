variable "cloudflare_bootstrap_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare account-level API token. Required for Zero Trust, Tunnel, Workers, R2, D1, and account-level resources."
  nullable    = false

}

variable "cf_dns_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare DNS Token"
  nullable    = false

}

variable "cf_waf_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare WAF token. Required only when enable_waf=true."
  nullable    = true
  default     = null

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

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"
  nullable    = false

    error_message = "cloudflare_zone_id must be a 32-character hexadecimal ID"
  }
}

variable "cloudflare_account_id" {
  type        = string
  description = "Cloudflare Account ID"
  nullable    = false

    error_message = "cloudflare_account_id must be a 32-character hexadecimal ID"
  }
}

variable "domain" {
  type        = string
  description = "Primary DNS domain"
  nullable    = false
  default     = "zeaz.dev"

}

variable "plan_tier" {
  type        = string
  description = "Cloudflare plan tier"
  default     = "Free"
  nullable    = false

}

variable "environment" {
  type        = string
  description = "Deployment environment name"
  nullable    = false
  default     = "dev"

}

variable "identity_provider_type" {
  type        = string
  description = "Identity provider type for Zero Trust"
  nullable    = false
  default     = "saml"

}

variable "identity_provider_metadata_url" {
  type        = string
  description = "HTTPS metadata URL for SAML configuration"
  nullable    = false

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
