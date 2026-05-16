variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "primary_domain" {
  type    = string
  default = "zeaz.dev"
}

# -----------------------------------------------------------------------------
# Feature flags
# -----------------------------------------------------------------------------
variable "enable_foundation" {
  type    = bool
  default = true
}

variable "enable_zero_trust" {
  type    = bool
  default = true
}

variable "enable_networking" {
  type    = bool
  default = true
}

variable "enable_workers_ai" {
  type    = bool
  default = true
}

variable "enable_monitoring_security" {
  type    = bool
  default = true
}

# -----------------------------------------------------------------------------
# Plan tier
# -----------------------------------------------------------------------------
variable "cloudflare_plan_tier" {
  type    = string
  default = "Free"
}

# -----------------------------------------------------------------------------
# Zero Trust / Access
# -----------------------------------------------------------------------------
variable "access_application_id" {
  description = "Cloudflare Access Application ID"
  type        = string
  default     = ""
}

variable "saml_metadata_url" {
  description = "SAML metadata URL"
  type        = string
  default     = ""
}

# -----------------------------------------------------------------------------
# Tunnel
# -----------------------------------------------------------------------------
variable "tunnel_secret" {
  description = "Cloudflare Tunnel secret"
  type        = string
  sensitive   = true
  default     = ""
}
