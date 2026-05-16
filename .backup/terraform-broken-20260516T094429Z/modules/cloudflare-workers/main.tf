resource "cloudflare_workers_script" "this" {
  account_id = var.account_id
  content    = "addEventListener('fetch', event => event.respondWith(new Response('ok')))"
