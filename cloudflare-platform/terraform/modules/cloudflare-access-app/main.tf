resource "cloudflare_access_application" "this" {
  account_id = var.account_id
  name       = coalesce(var.name, "default-access-app")
  domain     = "app.example.com"
  type       = "self_hosted"
}
