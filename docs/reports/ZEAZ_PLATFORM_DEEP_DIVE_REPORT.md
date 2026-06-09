# ZEAZ Platform Deep Dive Report

Generated: 2026-06-09 15:57:26Z

## Scope

Read-only inventory for the master refactor prompt. The audit inspected top-level apps, root Docker Compose, root `.env.example`, available package manifests, Python manifests, and known infrastructure folders.

## App Directories

- `ABTPi18n`
- `api`
- `openwork`
- `web`
- `zAcademy`
- `zLinebot`
- `zcino`
- `zcino-modern`
- `zdash`
- `zkbtrader`
- `zlms-prod`
- `zoffice`
- `zsp-aitool`
- `zsticker`
- `ztrader`
- `zveo`
- `zwallet`

## Canonical Inventory

| App | Path | Exists | Framework | Start command | Build command | Port | Domain | Env file | DB signals | Docker service | Health |
| --- | --- | --- | --- | --- | --- | ---: | --- | --- | --- | --- | --- |
| openwork | apps/openwork | yes | unclassified/static | OPENWORK_DEV_MODE=1 OPENWORK_ELECTRON_REMOTE_DEBUG_PORT=${OPENWORK_ELECTRON_REMOTE_DEBUG_PORT:-9823} pnpm --filter @openwork/desktop dev | node scripts/build.mjs | 4101 | zow.zeaz.dev | root .env.example | DATABASE_URL, drizzle, mysql | openwork | /health |
| api | apps/api | yes | Python | not detected | not detected | 4102 | api-zcfdash.zeaz.dev | root .env.example | redis | api | /health |
| web | apps/web | yes | Next.js, React | next start | next build --turbopack | 4103 | zcfdash.zeaz.dev | root .env.example | not detected | web | /health |
| zoffice | apps/zoffice | yes | unclassified/static | not detected | not detected | 4104 | zoffice.zeaz.dev | .env.example | postgres | zoffice | /health |
| zwallet | apps/zwallet | yes | unclassified/static | not detected | not detected | 4105 | app.zeaz.dev | .env.example | redis | zwallet | /health |
| ztrader | apps/ztrader | yes | Next.js, React | next start | next build | 4106 | ztrader.zeaz.dev | .env.example | redis | ztrader | /health |
| zdash | apps/zdash | yes | Vite, React | vite | tsc -p tsconfig.build.json && vite build | 4107 | dash.zeaz.dev | .env.example | DATABASE_URL | zdash | /health |
| zsp-aitool | apps/zsp-aitool | yes | unclassified/static | not detected | not detected | 4108 | zaiz.zeaz.dev | root .env.example | not detected | zsp-aitool | /health |
| zveo | apps/zveo | yes | unclassified/static | not detected | not detected | 4109 | zveo.zeaz.dev | root .env.example | not detected | zveo | /health |
| zsticker | apps/zsticker | yes | Python | not detected | not detected | 4110 | zsticker.zeaz.dev | .env.example | not detected | zsticker | /health |
| zcino | apps/zcino | yes | Next.js, React | node .next/standalone/server.js | next build | 4111 | zcino.zeaz.dev | root .env.example | redis | zcino | /health |
| zlms-prod | apps/zlms-prod | yes | frontend app | not detected | not detected | 4112 | zlms.zeaz.dev | root .env.example | redis | zlms-prod | /health |
| zLinebot | apps/zLinebot | yes | unclassified/static | not detected | not detected | 4113 | internal bot service | root .env.example | not detected | zLinebot | /health |


## Existing Platform Signals

- Root Docker Compose delegates to `infra/traefik`, `infra/cloudflare`, `infra/authentik`, `infra/observability`, `infra/ai-runtime`, and `infra/security`.
- Several app-specific Compose files exist under `apps/*` and should be treated as app-owned implementation details unless intentionally adopted.
- Cloudflare and token automation already exists under `scripts/cloudflare`, but the master prompt-required local tunnel checker and setup wrapper were missing before this change.

## Blockers / Cautions

- No real secrets were read or printed.
- Local app startup was not attempted during read-only audit. Startup is handled by generated guarded scripts.
- Consolidating source trees for `zcino-modern` and LINE bot variants is destructive if done blindly; this change documents inactive sources and adds canonical orchestration without deleting source code.
