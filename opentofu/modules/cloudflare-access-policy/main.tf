resource "cloudflare_access_policy" "this" {
  account_id     = var.account_id
  application_id = cloudflare_access_application.app.id
  name           = coalesce(var.name, "allow-all")
  precedence     = 1
  decision       = "allow"

  include {
    everyone = true
  }
}

resource "cloudflare_access_application" "app" {
  account_id = var.account_id
  name       = "policy-anchor-app"
  domain     = "policy.example.com"
  type       = "self_hosted"
}
