resource "cloudflare_access_policy" "this" {
  account_id     = var.account_id
  application_id = var.application_id
  name           = var.name
  precedence     = var.precedence
  decision       = var.decision

  dynamic "include" {
    for_each = length(var.include_groups) > 0 ? [1] : []
    content {
      group = var.include_groups
    }
  }

  dynamic "require" {
    for_each = var.require_mfa ? [1] : []
    content {
      login_method = ["mfa"]
    }
  }
}
