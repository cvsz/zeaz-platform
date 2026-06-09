# Reverse Proxy Report

Generated: 2026-06-09 UTC

## Completed

- Added `infrastructure/nginx/zeaz-platform.conf` with canonical domain-to-port mappings.
- Included websocket upgrade support and standard proxy headers: `Host`, `X-Real-IP`, `X-Forwarded-For`, and `X-Forwarded-Proto`.
- Added upload/body size default (`client_max_body_size 50m`).
- Added `scripts/proxy/check-nginx-config.sh` for static config checks and optional local `nginx -t` execution when nginx is available.

## Existing Standard

The repository already contains Traefik infrastructure. This nginx file is therefore an operator-reviewable alternative/local reverse-proxy artifact, not an automatic replacement for Traefik.
