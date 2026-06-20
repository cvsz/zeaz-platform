resource "cloudflare_record" "auth_zeaz_dev" {
  zone_id = var.zone_id
  name    = "auth"
  type    = "CNAME"
  value   = "proxy.zeaz.dev"
  proxied = true
}

resource "cloudflare_record" "zagents_zeaz_dev" {
  zone_id = var.zone_id
  name    = "zagents"
  type    = "CNAME"
  value   = "eebf6c99-b37e-450b-851b-0bc8e427280d.cfargotunnel.com"
  proxied = true
}
