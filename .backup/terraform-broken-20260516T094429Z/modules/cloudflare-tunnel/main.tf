resource "cloudflare_zero_trust_tunnel_cloudflared" "this" {
  account_id = var.account_id
  secret     = var.secret

resource "cloudflare_zero_trust_tunnel_cloudflared_config" "this" {
  count      = length(var.ingress_rules) > 0 ? 1 : 0
  account_id = var.account_id
  tunnel_id  = cloudflare_zero_trust_tunnel_cloudflared.this.id

  config {
    dynamic "ingress_rule" {
      for_each = var.ingress_rules
      content {
        service  = ingress_rule.value.service
      }
    }
  }
