variable "account_id" {
  type        = string
  description = "Cloudflare account ID"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.account_id))
    error_message = "account_id must be a 32-char lowercase hex Cloudflare account ID."
  }
}

variable "name" {
  type        = string
  description = "Tunnel name"
  nullable    = false

  validation {
    condition     = length(var.name) >= 3 && length(var.name) <= 64
    error_message = "name must be between 3 and 64 chars."
  }
}
