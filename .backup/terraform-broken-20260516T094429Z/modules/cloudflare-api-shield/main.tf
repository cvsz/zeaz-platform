resource "cloudflare_ruleset" "api_shield_schema_validation" {
  zone_id = var.zone_id
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "log"
    expression  = "starts_with(http.request.uri.path, \"/api\")"
    description = "Log API traffic for schema onboarding"
    enabled     = true
  }
