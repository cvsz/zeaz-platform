# Cloudflare Config Report

Generated: 2026-06-09 15:57:26Z

## Implemented

- Added `infrastructure/cloudflare/config.yml` with canonical hostname-to-localhost ingress.
- Added offline YAML/config checker.
- Added guarded setup helper that validates environment variables and does not create tunnels unless `CONFIRM_TUNNEL_SETUP=yes` is set.

## Safety

No Cloudflare account IDs, zone IDs, tunnel tokens, or credentials are committed.
