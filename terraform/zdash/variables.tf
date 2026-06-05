variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID for zeaz.dev"
  type        = string

  validation {
    condition     = can(regex("^[a-f0-9]{32}$", var.cloudflare_zone_id))
    error_message = "cloudflare_zone_id must be the real 32-character Cloudflare zone ID, not a placeholder."
  }
}

variable "cloudflare_tunnel_id" {
  description = "Cloudflare Tunnel UUID for zeaz.dev"
  type        = string

  validation {
    condition     = can(regex("^[0-9a-fA-F-]{8}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{4}-[0-9a-fA-F-]{12}$", var.cloudflare_tunnel_id))
    error_message = "cloudflare_tunnel_id must be the real Cloudflare Tunnel UUID, not a placeholder."
  }
}

variable "zdash_domain" {
  description = "zDash frontend hostname"
  type        = string
  default     = "zzdash.zeaz.dev"
}

variable "zdash_api_domain" {
  description = "zDash API hostname matching current Cloudflare route"
  type        = string
  default     = "api-zzdash.zeaz.dev"
}

variable "zdash_release_domain" {
  description = "Optional release evidence hostname"
  type        = string
  default     = "release.zeaz.dev"
}
