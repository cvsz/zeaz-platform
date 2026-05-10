resource "cloudflare_access_identity_provider" "this" {
  account_id = var.account_id
  name       = coalesce(var.name, "default-saml-idp")
  type       = "saml"

  config {
    issuer_url   = "https://idp.example.com/metadata"
    sso_target_url = "https://idp.example.com/sso"
    attributes   = ["email"]
  }
}
