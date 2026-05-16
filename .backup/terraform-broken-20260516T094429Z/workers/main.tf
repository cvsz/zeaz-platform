resource "cloudflare_workers_script" "app" {
  account_id = var.cloudflare_account_id
  content = file("${path.module}/../../src/worker.js")
  main_module = "worker.js"
  compatibility_date = "2025-01-01"

resource "cloudflare_workers_route" "app" {
  zone_id = var.cloudflare_zone_id
  pattern = var.worker_route
  script  = cloudflare_workers_script.app.script_name
