output "cf_dns_token" {
  value     = cloudflare_account_token.dns.value
  sensitive = true

output "cf_workers_token" {
  value     = cloudflare_account_token.workers.value
  sensitive = true

output "cf_pages_token" {
  value     = cloudflare_account_token.pages.value
  sensitive = true

output "cf_r2_token" {
  value     = cloudflare_account_token.r2.value
  sensitive = true

output "cf_d1_token" {
  value     = cloudflare_account_token.d1.value
  sensitive = true
