# zDash Cloudflare API Preflight

Generated: 2026-06-13T20:08:38Z

- zone_name: zeaz.dev
- zone_id: 92d9bfd6cbe3c327519d520e56268cba
- tunnel_id: 6fc5dc60-812e-479c-8f2b-a9e62b568aeb
- tunnel_target: 6fc5dc60-812e-479c-8f2b-a9e62b568aeb.cfargotunnel.com

## DNS records

- zzdash.zeaz.dev: MISSING
- api-zzdash.zeaz.dev: MISSING
- release.zeaz.dev: 38556f08b66f408ff81b031fe6ed09a3

## Terraform import commands
terraform import 'cloudflare_dns_record.zdash["zdash_release"]' '92d9bfd6cbe3c327519d520e56268cba/38556f08b66f408ff81b031fe6ed09a3'
