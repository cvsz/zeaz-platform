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

variable "cf_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cf_zone_id))
    error_message = "cf_zone_id must be a 32-character hexadecimal ID"
  }
}

variable "cf_account_id" {
  type        = string
  description = "Cloudflare Account ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cf_account_id))
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
    condition     = contains(["Free", "Pro", "Business", "Enterprise"], var.plan_tier)
    error_message = "plan_tier must be one of Free, Pro, Business, Enterprise"
  }
}
