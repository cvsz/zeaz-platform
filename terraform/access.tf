resource "cloudflare_access_application" "app" {
  zone_id          = var.cf_zone_id
  name             = "app-zeaz"
  domain           = "app.zeaz.dev"
  session_duration = "4h"
  type             = "self_hosted"
}
