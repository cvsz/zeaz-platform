resource "random_password" "tunnel_secret" {
  length           = 64
  special          = false
  override_special = ""
}

resource "cloudflare_zero_trust_tunnel_cloudflared" "this" {
  account_id = var.account_id
  name       = var.name
  secret     = base64encode(random_password.tunnel_secret.result)
}
