variable "cloudflare_bootstrap_token" { type = string sensitive = true }
variable "cloudflare_account_id" { type = string }
variable "cloudflare_zone_id" { type = string }
variable "worker_name" { type = string default = "zeaz-platform" }
variable "worker_route" { type = string default = "zeaz.dev/*" }
