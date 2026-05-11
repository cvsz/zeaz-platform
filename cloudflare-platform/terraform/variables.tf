variable "cf_dns_token" {
  type        = string
  sensitive   = true
  description = "Cloudflare DNS Token"
}

variable "cf_zone_id" {
  type        = string
  description = "Cloudflare Zone ID"
}

variable "cf_account_id" {
  type        = string
  description = "Cloudflare Account ID"
}

variable "plan_tier" {
  type        = string
  description = "Cloudflare plan tier"
  default     = "Free"

  validation {
    condition     = contains(["Free", "Pro", "Business", "Enterprise"], var.plan_tier)
    error_message = "plan_tier must be one of Free, Pro, Business, Enterprise"
  }
}
