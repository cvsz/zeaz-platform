variable "cf_api_token" { type=string description="Cloudflare API token" sensitive=true nullable=false validation { condition=length(var.cf_api_token)>20 error_message="token too short" } }
variable "cf_account_id" { type=string description="Cloudflare account" nullable=false validation { condition=can(regex("^[a-f0-9]{32}$", var.cf_account_id)) error_message="bad id" } }
variable "cf_zone_id" { type=string description="Cloudflare zone" nullable=false validation { condition=can(regex("^[a-f0-9]{32}$", var.cf_zone_id)) error_message="bad id" } }
variable "plan_tier" { type=string description="Free|Pro|Business|Enterprise" default="Free" nullable=false validation { condition=contains(["Free","Pro","Business","Enterprise"],var.plan_tier) error_message="invalid" } }
