resource "cloudflare_ruleset" "api_shield_schema_validation" {
  zone_id = var.zone_id
  name    = "api-shield-schema-validation"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "log"
    expression  = "starts_with(http.request.uri.path, \"/api\")"
    description = "Log API traffic for schema onboarding"
    enabled     = true
  }
}
