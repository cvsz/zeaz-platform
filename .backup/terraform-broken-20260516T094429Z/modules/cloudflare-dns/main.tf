locals {
  normalized_records = {
    for key, record in var.records : key => merge(record, {
      resolved_value = (
        contains(["A", "AAAA"], upper(record.type))
        ? lookup(var.origin_hosts, try(record.origin_host_key, ""), "")
        : record.value
      )
    })
  }

resource "cloudflare_record" "records" {
  for_each = local.normalized_records

  zone_id  = var.zone_id
  type     = upper(each.value.type)
  content  = each.value.resolved_value
  ttl      = each.value.ttl
  proxied  = each.value.proxied
  comment  = try(each.value.comment, null)
  priority = try(each.value.priority, null)

  lifecycle {
  }
