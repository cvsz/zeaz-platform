locals { enterprise = var.plan_tier == "Enterprise" }
module "dns" { source="./modules/cloudflare-dns" zone_id=var.cf_zone_id records={"auth"="auth.zeaz.dev"} }
module "api_shield" { count=local.enterprise?1:0 source="./modules/cloudflare-api-shield" zone_id=var.cf_zone_id }
