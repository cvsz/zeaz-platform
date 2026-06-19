resource "cloudflare_access_application" "authentik" {
  zone_id                   = var.cloudflare_zone_id
  name                      = "Authentik IdP"
  domain                    = "auth.zeaz.dev"
  session_duration          = "24h"
  auto_redirect_to_identity = true
}

resource "cloudflare_access_policy" "authentik_allow" {
  application_id = cloudflare_access_application.authentik.id
  zone_id        = var.cloudflare_zone_id
  name           = "Allow All to Auth"
  precedence     = "1"
  decision       = "allow"

  include {
    everyone = true
  }
}
