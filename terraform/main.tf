# Clean baseline Terraform root.
# Re-add modules only after CI is green.

module "zeaz-platform" {
  source  = "app.terraform.io/ZeaZDev/zeaz-platform/zeazdev"
  version = "0.1.0"

  account_id = var.cloudflare_account_id
  zone_id    = var.cloudflare_zone_id
}

output "cloudflare_account_id" {
  value = var.cloudflare_account_id
}

output "cloudflare_zone_id" {
  value = var.cloudflare_zone_id
}

output "primary_domain" {
  value = var.primary_domain
}
