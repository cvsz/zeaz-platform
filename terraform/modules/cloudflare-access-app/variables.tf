variable "account_id" {
  type        = string
  description = "Cloudflare account ID."
  nullable    = false
  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.account_id))
    error_message = "account_id must be 32 lowercase hex chars."
  }
}

variable "name" {
  type        = string
  description = "Access app name."
  nullable    = false
}

variable "domain" {
  type        = string
  description = "Application domain."
  nullable    = false
}

variable "session_duration" {
  type        = string
  description = "Session duration string (e.g., 4h, 24h)."
  nullable    = false
  default     = "8h"
  validation {
    condition     = can(regex("^[0-9]+h$", var.session_duration))
    error_message = "session_duration must be in hours, e.g. 4h."
  }
}

variable "allowed_idps" {
  type        = list(string)
  description = "Allowed IdP IDs."
  nullable    = false
  default     = []
}

