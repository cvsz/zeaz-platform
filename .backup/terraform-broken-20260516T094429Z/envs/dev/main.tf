terraform {
  required_version = ">= 1.7.0"

module "platform" {
  source        = "../../"
  cloudflare_account_id = var.cloudflare_account_id
  cloudflare_zone_id    = var.cloudflare_zone_id
  plan_tier     = var.plan_tier
