resource "cloudflare_zero_trust_tunnel_cloudflared" "main" {
  account_id = var.cf_account_id
  name       = "zeaz-main"
  secret     = base64encode(sha256("${var.cf_account_id}:${var.cf_zone_id}:${var.domain}"))
}

locals {
  tunnel_hostnames = [
    "zeaz.dev",
    "app.zeaz.dev",
    "zveo.zeaz.dev",
    "admin.zeaz.dev",
    "grafana.zeaz.dev",
    "logs.zeaz.dev",
    "tunnel.zeaz.dev"
  ]
}

resource "cloudflare_record" "tunnel_cname" {
  for_each = toset(local.tunnel_hostnames)
  zone_id  = var.cf_zone_id
  name     = each.value
  type     = "CNAME"
  content  = "${cloudflare_zero_trust_tunnel_cloudflared.main.id}.cfargotunnel.com"
  proxied  = true
}
