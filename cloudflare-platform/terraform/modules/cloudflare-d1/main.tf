resource "cloudflare_d1_database" "this" {
  account_id = var.account_id
  name       = coalesce(var.name, "default-d1")
}
