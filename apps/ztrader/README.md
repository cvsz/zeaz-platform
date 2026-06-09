# zTrader

Last updated: 2026-06-10

`apps/ztrader` is a safety-first multi-language algorithmic trading platform stack. It is separate from `apps/zkbtrader` and `apps/zdash` even when concepts overlap.

## Stack

| Layer | Stack |
|---|---|
| Frontend | Next.js / TypeScript |
| Backend | FastAPI / Python |
| Workers | Celery-style async orchestration |
| Data | PostgreSQL-oriented backend storage |
| Deployment | Docker Compose |
| App areas | `frontend/`, `backend/` |

## Safety mode

Use paper/dry-run workflows by default. Live trading must remain explicitly gated by risk controls, environment flags, and operator review.

## Scope rule

This README documents only `apps/ztrader`. Do not copy `zkbtrader`, `zdash`, or zOffice commands into this app.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/ztrader
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

## Docker

```bash
cd /home/zeazdev/zeaz-platform/apps/ztrader
docker compose up -d --build
```

## Important files

```text
frontend/
backend/
docker-compose.yml
Makefile
LICENSE
SECURITY.md
```

## Security notes

- Never commit exchange API keys or wallet secrets.
- Keep live trading disabled unless explicitly audited.
- Use paper mode for tests and demos.
- Require risk gate validation before external exchange actions.
