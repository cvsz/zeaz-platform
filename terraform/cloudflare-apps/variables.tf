variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare zone ID for zeaz.dev"

  validation {
    condition     = length(var.cloudflare_zone_id) == 32 && var.cloudflare_zone_id != "REPLACE_WITH_ZEAZ_DEV_ZONE_ID"
    error_message = "cloudflare_zone_id must be the real 32-character Cloudflare zone ID."
  }
}

variable "cloudflare_tunnel_id" {
  type        = string
  description = "Cloudflare Tunnel UUID"

  validation {
    condition     = can(regex("^[0-9a-fA-F-]{36}$", var.cloudflare_tunnel_id)) && var.cloudflare_tunnel_id != "REPLACE_WITH_TUNNEL_UUID"
    error_message = "cloudflare_tunnel_id must be the real Cloudflare Tunnel UUID."
  }
}

variable "app_routes" {
  type = map(object({
    app_id             = string
    hostname           = string
    origin             = string
    port               = number
    role               = string
    status             = string
    api_gateway_prefix = optional(string)
  }))
}
