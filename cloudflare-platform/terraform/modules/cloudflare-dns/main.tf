resource "cloudflare_record" "records" {
  for_each = var.records

  zone_id = var.zone_id
  name    = each.key
  value   = each.value
  type    = "CNAME"
  proxied = true
  ttl     = 1
}
