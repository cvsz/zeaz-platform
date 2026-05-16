resource "cloudflare_zero_trust_tunnel_cloudflared" "main" {
  account_id = var.cloudflare_account_id
  secret     = base64encode(sha256("${var.cloudflare_account_id}:${var.cloudflare_zone_id}:${var.domain}"))

locals {
  active_tunnel_id = "ef0355dd-8e90-45ed-a222-b5053794ed20"

  tunnel_hostnames = [
    "zeaz.dev",
    "www.zeaz.dev",
    "app.zeaz.dev",
    "admin-wallet.zeaz.dev",
    "zveo.zeaz.dev",
    "api-zveo.zeaz.dev",
    "admin.zeaz.dev",
    "grafana.zeaz.dev",
    "logs.zeaz.dev",
    "tunnel.zeaz.dev"
  ]

resource "cloudflare_record" "tunnel_cname" {
  for_each = toset(local.tunnel_hostnames)
  zone_id  = var.cloudflare_zone_id
  type     = "CNAME"
  content  = "${local.active_tunnel_id}.cfargotunnel.com"
  proxied  = true
