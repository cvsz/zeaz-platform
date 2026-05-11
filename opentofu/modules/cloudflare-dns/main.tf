resource "cloudflare_record" "records" {
  for_each = var.records

  zone_id  = var.zone_id
  name     = each.value.name
  type     = upper(each.value.type)
  value    = each.value.value
  ttl      = each.value.ttl
  proxied  = each.value.proxied
  comment  = try(each.value.comment, null)
  priority = try(each.value.priority, null)
}
