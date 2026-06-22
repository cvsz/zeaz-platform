# ZeaZ Platform — Token Scope Checklist

This checklist defines the minimal required scopes for each Cloudflare token category. Use these to adhere to the least-privilege principle.

| Token Category | Recommended Scope |
| :--- | :--- |
| `CLOUDFLARE_DNS_TOKEN` | DNS:Edit (Zone-specific) |
| `CLOUDFLARE_WORKERS_TOKEN` | Workers:Edit |
| `CLOUDFLARE_ZT_TOKEN` | Access:Edit |
| `CLOUDFLARE_WAF_TOKEN` | WAF:Edit |
| `CLOUDFLARE_TUNNEL_TOKEN` | Tunnel:Edit |
| `CLOUDFLARE_R2_TOKEN` | R2:Edit |

*Ensure tokens are scoped to the smallest possible resource boundary.*
