output "zdash_dns_records" {
  description = "zDash DNS records managed by Terraform"
  value = {
    for key, record in cloudflare_dns_record.zdash :
    key => {
      id      = record.id
      name    = record.name
      type    = record.type
      content = record.content
      proxied = record.proxied
    }
  }
}
