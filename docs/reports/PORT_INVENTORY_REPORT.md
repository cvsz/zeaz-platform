# Port Inventory Report

Generated: 2026-06-09 15:57:26Z

## Canonical Map

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


## Implemented

- Added scripts to list canonical ports and detect duplicate local listeners/configured canonical ports.
- Added reverse proxy and Cloudflare tunnel maps for ports `4101` through `4113`.
