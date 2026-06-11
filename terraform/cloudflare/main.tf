locals {
  subdomains = [
    "panel", "api", "auth", "grafana", "loki", "prometheus",
    "trader", "ws.trader", "risk", "memory", "agents", "fcc",
    "office"
  ]
}

resource "cloudflare_record" "ingress_records" {
  for_each = toset(local.subdomains)
  zone_id  = var.zone_id
  name     = each.key
  value    = var.tunnel_cname
  type     = "CNAME"
  proxied  = true
}
