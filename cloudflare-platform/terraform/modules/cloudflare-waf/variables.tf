variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "zone_id must be a 32-char lowercase hex Cloudflare zone ID."
  }
}

variable "managed_waf_packages" {
  type        = set(string)
  description = "Managed WAF package IDs"
  nullable    = false
  default     = ["efb7b8c949ac4650a09736fc376e9aee"]
}

variable "redirect_host" {
  type        = string
  description = "Primary hostname for canonical redirect target"
  nullable    = false

  validation {
    condition     = can(regex("^[a-z0-9.-]+$", var.redirect_host))
    error_message = "redirect_host must be a valid DNS hostname."
  }
}
