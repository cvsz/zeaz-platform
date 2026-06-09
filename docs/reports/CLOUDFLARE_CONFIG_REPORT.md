# Cloudflare Config Report

Generated: 2026-06-09 UTC

## Completed

- Added canonical tunnel config at `infrastructure/cloudflare/config.yml`.
- Updated `infra/cloudflare/config.yml` to the same canonical hostname-to-localhost-port mapping used by cloudflared compose.
- Added `scripts/cloudflare/check-cloudflare-config.sh` for offline tunnel mapping validation.
- Added `scripts/cloudflare/setup-cloudflare-tunnel.sh`, which is offline by default and requires explicit operator action for real Cloudflare setup.

## Hostname Mapping

Every requested hostname maps to exactly one local app port from 4101 through 4112, with a final `http_status:404` catch-all.

## Security Notes

- No Cloudflare token, account ID, zone ID, or tunnel credentials were committed.
- Real setup remains a manual operator task after local secret injection.
