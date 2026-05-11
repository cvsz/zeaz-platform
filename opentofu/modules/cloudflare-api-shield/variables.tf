variable "zone_id" {
  type        = string
  description = "Cloudflare zone ID used for API logging ruleset deployment"
  nullable    = false

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.zone_id))
    error_message = "zone_id must be a valid 32-character lowercase hex Cloudflare zone ID."
  }
}
