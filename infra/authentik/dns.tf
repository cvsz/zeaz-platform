resource "cloudflare_record" "authentik" {
  zone_id = var.cloudflare_zone_id
  name    = "auth"
  value   = var.authentik_ingress_ip
  type    = "A"
  proxied = true
}
