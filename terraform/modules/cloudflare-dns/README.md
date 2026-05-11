# cloudflare-dns

Cloudflare DNS module with tunnel-friendly CNAME support and origin-host derived A/AAAA records.

## Features
- Default `primary_domain` set to `zeaz.dev` with override support.
- CNAME records can target tunnel endpoints.
- A/AAAA records are blocked unless value is resolved from `origin_hosts`.

## Inputs
- `zone_id`: Cloudflare Zone ID.
- `primary_domain`: Domain override (default `zeaz.dev`).
- `records`: DNS record map.
- `origin_hosts`: key/value source for A/AAAA record targets.
