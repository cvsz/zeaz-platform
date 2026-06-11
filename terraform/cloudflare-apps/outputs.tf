output "app_routes" {
  value = {
    for hostname, record in cloudflare_dns_record.app_routes : hostname => {
      id      = record.id
      name    = record.name
      content = record.content
      proxied = record.proxied
    }
  }
}
