# zDash

Last updated: 2026-06-10

`apps/zdash` is the safety-first AI operations and trading dashboard stack inside `cvsz/zeaz-platform`. It is operated as its own full-stack app and must stay separate from `ztrader`, `zkbtrader`, `zoffice`, and other app stacks unless a future migration explicitly merges them.

## Stack

| Layer | Stack |
|---|---|
| Backend | FastAPI / Python |
| Frontend | React / Vite |
| Data | PostgreSQL-oriented persistence |
| Cache / queue | Redis-compatible services |
| Deployment | Docker Compose, production compose assets |
| Operations | Makefile, install scripts, deploy scripts |
| Route intent | `zdash.zeaz.dev`, `api-zdash.zeaz.dev` |

## Safety mode

zDash is safety-first. Trading and external action features must be guarded by explicit risk controls, environment configuration, and operator review.

Default expectation:

```text
paper / dry-run / audit-first
```

## Scope rule

This README documents only `apps/zdash`. Do not copy zOffice, zTrader, zkbtrader, zWallet, or web commands into this app.

## Local setup

```bash
cd /home/zeazdev/zeaz-platform/apps/zdash
```

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

## Docker

```bash
cd /home/zeazdev/zeaz-platform/apps/zdash
docker compose up -d --build
```

Production compose assets are present, but production deployment should be reviewed with secrets, TLS, Cloudflare routing, and backup controls before public exposure.

## Important files

```text
backend/
frontend/
config/
deploy/
docs/
infra/
scripts/
tools/
Makefile
docker-compose.yml
docker-compose.prod.yml
docker-compose.prod.secrets.yml
install-zdash-fullstack.sh
install-zdash-prod.sh
SECURITY.md
VERSION
```

## Security notes

- Never commit broker/exchange keys, database passwords, JWT secrets, or Cloudflare tokens.
- Keep live trading disabled unless explicitly audited.
- Use paper/dry-run execution for demos and testing.
- Validate risk gates before external actions.
- Keep domain/TLS/Cloudflare routing in platform configs and app deployment docs.
