resource "cloudflare_ruleset" "waf_entrypoint" {
  zone_id = var.cf_zone_id
  name    = "zeaz-waf"
  kind    = "zone"
  phase   = "http_request_firewall_managed"
  rules {
    action     = "execute"
    expression = "true"
    action_parameters { id = "efb7b8c949ac4650a09736fc376e9aee" }
  }
}
