resource "cloudflare_tunnel" "this" {
  account_id = var.account_id
  name       = coalesce(var.name, "default-tunnel")
  secret     = base64encode("replace-with-32-byte-secret")
}
