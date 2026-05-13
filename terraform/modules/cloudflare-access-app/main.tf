resource "cloudflare_zero_trust_access_application" "this" {
  account_id            = var.account_id
  name                  = var.name
  domain                = var.domain
  type                  = "self_hosted"
  session_duration      = var.session_duration
  allowed_idps          = var.allowed_idps
  app_launcher_visible  = false
  enable_binding_cookie = true

  auto_redirect_to_identity = length(var.allowed_idps) == 1
}
