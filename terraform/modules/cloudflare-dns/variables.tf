variable "zone_id" {
  type        = string
  description = "The Cloudflare zone ID"
  validation {
    condition     = length(var.zone_id) == 32
    error_message = "Zone ID must be 32 characters."
  }
}
