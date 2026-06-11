variable "cloudflare_bootstrap_token" {
  type      = string
  sensitive = true
}

variable "primary_domain" {
  type    = string
  default = "zeaz.dev"
}
