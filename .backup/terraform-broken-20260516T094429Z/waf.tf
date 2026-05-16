resource "cloudflare_ruleset" "waf_entrypoint" {
  count   = var.enable_waf ? 1 : 0
  zone_id = var.cloudflare_zone_id
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    action     = "execute"
    expression = "true"

    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e9aee"
    }
  }
