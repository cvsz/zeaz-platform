module "platform" {
  source        = "../../"
  cf_api_token  = var.cf_api_token
  cf_account_id = var.cf_account_id
  cf_zone_id    = var.cf_zone_id
  plan_tier     = var.plan_tier
}
