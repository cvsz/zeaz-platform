locals {
  tunnel_cname = "${var.cloudflare_tunnel_id}.cfargotunnel.com"
}

resource "cloudflare_dns_record" "app_routes" {
  for_each = var.app_routes

  zone_id = var.cloudflare_zone_id
  name    = each.key
  type    = "CNAME"
  content = local.tunnel_cname
  ttl     = 1
  proxied = true
  comment = "zeaz-platform ${each.value.app_id} ${each.value.role} via Cloudflare Tunnel"
}
