# cloudflare-tunnel

Cloudflare Tunnel module for managed tunnel creation and optional ingress mapping.

## Security Model
- Tunnel secret is required as input and must come from secret/env injection.
- No tunnel credentials are generated or committed by this module.

## Inputs
- `account_id`: Cloudflare account ID.
- `name`: Tunnel name.
- `secret`: Base64 secret from secret manager.
- `ingress_rules`: Optional ingress rule list for hostnames/services.
