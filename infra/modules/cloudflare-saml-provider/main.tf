resource "cloudflare_access_identity_provider" "saml" {
  count      = var.provider_type == "saml" ? 1 : 0
  account_id = var.account_id
  name       = var.name
  type       = "saml"

  config {
    issuer_url     = var.metadata_url
    sso_target_url = var.metadata_url
    attributes     = var.attributes
  }
}

resource "cloudflare_access_identity_provider" "oidc" {
  count      = var.provider_type == "oidc" ? 1 : 0
  account_id = var.account_id
  name       = var.name
  type       = "oidc"

  config {
    issuer_url    = var.oidc_issuer_url
    client_id     = var.oidc_client_id
    client_secret = var.oidc_client_secret
    claims        = ["email", "name", "groups", "role"]
  }
}
