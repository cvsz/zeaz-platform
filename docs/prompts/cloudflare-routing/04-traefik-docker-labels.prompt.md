# AI Agent Prompt — Traefik Host Routing for Zeaz Apps

Goal:
Generate or update Traefik routers for all Zeaz hostnames.

Rules:
- Cloudflared forwards to `http://traefik:80`.
- Traefik must route by Host header to the right app service.
- Detect app service ports from Dockerfile/package.json/compose, do not guess permanently.
- Add security headers middleware.
- Add API CORS middleware only to API routers.
- Avoid exposing Traefik dashboard publicly unless protected.

Required routers:
- zcfdash -> zcfdash.zeaz.dev
- openwork -> openwork.zeaz.dev
- web -> www.zeaz.dev + zeaz.dev
- api -> api.zeaz.dev
- zcino -> zcino.zeaz.dev
- zdash -> zdash.zeaz.dev + api-zdash.zeaz.dev
- zlms-prod -> zlms.zeaz.dev
- zoffice -> zoffice.zeaz.dev
- zsp-aitool -> zaiz.zeaz.dev + api-zveo.zeaz.dev
- zsticker -> zsticker.zeaz.dev
- ztrader -> ztrader.zeaz.dev
- zveo -> zveo.zeaz.dev
- zwallet -> app.zeaz.dev

Output:
- Docker label patch or dynamic config patch.
- Health-check commands.
- Rollback patch.
