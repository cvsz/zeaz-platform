resource "cloudflare_zero_trust_access_policy" "this" {
  account_id     = var.account_id
  precedence     = var.precedence
  decision       = var.decision

  dynamic "include" {
    for_each = length(var.include_groups) > 0 ? [1] : []
    content {
      group = var.include_groups
    }
  }

  dynamic "include" {
    for_each = length(var.include_groups) == 0 && length(var.include_email_domains) > 0 ? [1] : []
    content {
    }
  }

  dynamic "require" {
    for_each = var.require_mfa ? [1] : []
    content {
      login_method = ["mfa"]
    }
  }
