variable "account_id" {
  type        = string
  description = "Cloudflare account ID."
  nullable    = false
}

variable "name" {
  type        = string
  description = "Identity provider name."
  nullable    = false
}

variable "provider_type" {
  type        = string
  description = "Identity provider type: saml or oidc."
  nullable    = false
  default     = "saml"
  validation {
    condition     = contains(["saml", "oidc"], var.provider_type)
    error_message = "provider_type must be saml or oidc"
  }
}

variable "metadata_url" {
  type        = string
  description = "SAML metadata URL (https only)."
  nullable    = false
  validation {
    condition     = can(regex("^https://", var.metadata_url))
    error_message = "metadata_url must start with https://"
  }
}

variable "attributes" {
  type        = list(string)
  description = "User attributes."
  nullable    = false
  default     = ["email"]
}

variable "oidc_issuer_url" {
  type        = string
  nullable    = true
  default     = null
  description = "OIDC issuer URL when provider_type=oidc."
}

variable "oidc_client_id" {
  type        = string
  nullable    = true
  default     = null
  description = "OIDC client ID."
}

variable "oidc_client_secret" {
  type        = string
  nullable    = true
  default     = null
  sensitive   = true
  description = "OIDC client secret."
}
