# DNS Records (F4)

Source of truth: `dns/records.yaml`.

## Rules
- All required records are CNAME and proxied through Cloudflare.
- No public origin IPs are permitted in record definitions.
- `PRIMARY_DOMAIN` controls suffix rendering (`<host>.${PRIMARY_DOMAIN}`).
- DNS targets are always derived from the Cloudflare tunnel endpoint.

## Required hostnames
- auth.zeaz.dev
- zveo.zeaz.dev
- studio.zeaz.dev
- analytics.zeaz.dev
- app.zeaz.dev
- pay.zeaz.dev
- treasury.zeaz.dev
- admin-wallet.zeaz.dev
- zkbtrader.zeaz.dev

## Service routing notes
- `zkbtrader.zeaz.dev` routes through Cloudflare Tunnel to the local ZKBTrader API on port `8004`.
- Keep the DNS record proxied and CNAME-based; do not expose the VM public IP.

## Rollback notes
1. Revert `dns/records.yaml` to prior commit.
2. Re-apply DNS via Terraform/OpenTofu.
3. Validate with `bash scripts/tunnel-validate.sh --offline`.