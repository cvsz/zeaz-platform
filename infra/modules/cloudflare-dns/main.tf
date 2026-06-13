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
}

resource "cloudflare_record" "records" {
  for_each = local.normalized_records

  zone_id  = var.zone_id
  name     = each.value.name
  type     = upper(each.value.type)
  value    = each.value.resolved_value
  ttl      = each.value.ttl
  proxied  = each.value.proxied
  comment  = try(each.value.comment, null)
  priority = try(each.value.priority, null)

  lifecycle {
    precondition {
      condition = (
        contains(["A", "AAAA"], upper(each.value.type))
        ? length(trim(each.value.resolved_value)) > 0
        : true
      )
      error_message = "A/AAAA records require origin_host_key mapped in origin_hosts (ORIGIN_HOSTS source)."
    }
  }
}
