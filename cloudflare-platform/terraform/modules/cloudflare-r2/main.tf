resource "cloudflare_r2_bucket" "this" {
  account_id = var.account_id
  name       = coalesce(var.name, "default-r2")
  location   = "WNAM"
}
