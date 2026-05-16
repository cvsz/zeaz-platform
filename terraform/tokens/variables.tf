variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "cloudflare_account_id" {
  type = string
}

variable "cloudflare_zone_id" {
  type = string
}

variable "token_prefix" {
  type    = string
  default = "zeaz"
}
