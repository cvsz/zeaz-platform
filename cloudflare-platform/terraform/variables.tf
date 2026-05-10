variable "cf_api_token" {
  type        = string
  description = "Cloudflare API Token"
  sensitive   = true

  validation {
    condition     = length(var.cf_api_token) > 20
    error_message = "Invalid Cloudflare API token"
  }
}

variable "cf_account_id" {
  type        = string
  description = "Cloudflare Account ID"

  validation {
    condition     = length(var.cf_account_id) > 10
    error_message = "Invalid Cloudflare account ID"
  }
}

variable "cf_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"

  validation {
    condition     = length(var.cf_zone_id) > 10
    error_message = "Invalid Cloudflare zone ID"
  }
}

variable "plan_tier" {
  type        = string
  description = "Free|Pro|Business|Enterprise"
  default     = "Free"

  validation {
    condition     = contains(["Free", "Pro", "Business", "Enterprise"], var.plan_tier)
    error_message = "invalid"
  }
}
