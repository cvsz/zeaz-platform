resource "cloudflare_ruleset" "waf_managed" {
  zone_id = var.zone_id
  name    = "waf-managed"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  rules {
    action = "execute"
    expression = "true"
    action_parameters {
      id = "efb7b8c949ac4650a09736fc376e9aee"
    }
    enabled = true
  }
}
