resource "cloudflare_zone_settings_override" "tls_hardening" {
  zone_id = var.zone_id

  settings {
    ssl                      = "strict"
    always_use_https         = "on"
    tls_1_3                  = "on"
    automatic_https_rewrites = "on"
    min_tls_version          = "1.2"
    opportunistic_encryption = "on"
  }
}

resource "cloudflare_ruleset" "waf_managed" {
  zone_id = var.zone_id
  name    = "managed-waf"
  kind    = "zone"
  phase   = "http_request_firewall_managed"

  dynamic "rules" {
    for_each = var.managed_waf_packages
    content {
      action      = "execute"
      expression  = "true"
      description = "Managed WAF package"
      enabled     = true
      action_parameters {
        id = rules.value
      }
    }
  }
}

resource "cloudflare_ruleset" "firewall_custom" {
  zone_id = var.zone_id
  name    = "firewall-custom"
  kind    = "zone"
  phase   = "http_request_firewall_custom"

  rules {
    action      = "managed_challenge"
    expression  = "(cf.bot_management.score lt 30 and not cf.client.bot)"
    description = "Mitigate AI abuse and automation attacks"
    enabled     = true
  }

  rules {
    action      = "block"
    expression  = "(http.request.uri.path contains \"/.env\" or http.request.uri.path contains \"/wp-admin\")"
    description = "Block common probing attacks"
    enabled     = true
  }
}

resource "cloudflare_ruleset" "cache" {
  zone_id = var.zone_id
  name    = "cache-rules"
  kind    = "zone"
  phase   = "http_request_cache_settings"

  rules {
    action      = "set_cache_settings"
    expression  = "(http.request.uri.path matches \"^/assets/.*\")"
    description = "Edge cache static assets"
    enabled     = true

    action_parameters {
      cache = true
      edge_ttl {
        mode    = "override_origin"
        default = 14400
      }
      browser_ttl {
        mode    = "override_origin"
        default = 3600
      }
    }
  }
}

resource "cloudflare_ruleset" "redirects" {
  zone_id = var.zone_id
  name    = "redirect-rules"
  kind    = "zone"
  phase   = "http_request_dynamic_redirect"

  rules {
    action      = "redirect"
    expression  = "(http.host ne \"${var.redirect_host}\")"
    description = "Canonical host redirect"
    enabled     = true

    action_parameters {
      from_value {
        status_code = 301
        target_url {
          expression = "concat(\"https://${var.redirect_host}\", http.request.uri.path)"
        }
        preserve_query_string = true
      }
    }
  }
}
