# ztrader — Safety-First Multi-Language Algorithmic Trading Platform

`ztrader` is a unified cryptocurrency trading application merged from `ABTPi18n` and `zkbtrader`. It integrates a beautiful multi-language Next.js frontend, an asynchronous FastAPI backend gateway, relational PostgreSQL SQLAlchemy storage, Celery task queue orchestration, and a fail-closed risk gate.

---

## Key Features

1. **Safety-First Mode**:
   - `EXECUTION_MODE` is set to `paper` by default.
   - `LIVE_TRADING_ENABLED` is gated to `false` unless explicitly activated.
   - Immediate manual block via a global **Kill Switch**.
2. **Fail-Closed Risk Engine**:
   - Intercepts all trade intents before dispatching to brokers.
   - Restricts orders to allowed symbols (`BTC/USDT`, `ETH/USDT`) and validates `max_order_notional` limits.
3. **Multi-Language Support (i18n)**:
   - English, Thai, Japanese, and Chinese translations included.
4. **Relational Storage**:
   - Uses PostgreSQL with SQLAlchemy (asyncpg) to capture users, exchange credentials (AES-encrypted), strategies, orders, and security logs.
5. **Multi-Exchange Support**:
   - Out-of-the-box integration mappings for `binance.com`, `binance.th` (Binance Thailand local entity), `okx`, `bybit`, `kucoin`, and `MT5` (MetaTrader 5 via an external execution gateway).

---

## Directory Structure

```text
apps/ztrader/
├── backend/                   # FastAPI backend application
│   ├── db/                    # DDL schema files
│   ├── src/
│   │   └── ztrader/
│   │       ├── api/           # API router endpoints
│   │       ├── core/          # Database connection, config, and security helpers
│   │       ├── engine/        # RiskEngine, PaperBroker, Strategy, Backtest
│   │       ├── models/        # SQLAlchemy and Pydantic models
│   │       ├── main.py        # FastAPI server entry point
│   │       └── worker.py      # Celery task definitions
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/                  # Next.js web application
│   ├── public/                # Locales translation files
│   ├── src/
│   │   ├── app/               # App Router pages and dynamic routing
│   │   ├── components/        # Glassmorphic UI components
│   │   └── contexts/          # Theme context provider
│   ├── Dockerfile
│   ├── package.json
│   └── tsconfig.json
├── docker-compose.yml         # Container orchestrator
├── Makefile                   # Operation targets helper
├── .env.example               # Configuration template
└── README.md                  # This document
```

---

## Getting Started

### 1. Environment Setup
Copy the configuration template and customize details:
```bash
cp .env.example .env
```
Ensure you generate 32-byte keys for `ENCRYPTION_KEY` and `JWT_SECRET`.

Set `ADMIN_API_TOKEN` before using admin routes or the kill switch. Admin API calls
fail closed when this value is unset, and clients must send it as a bearer token.
For local browser testing, store the token in `localStorage` under
`ztrader_admin_token`; do not expose production admin tokens through public
frontend environment variables.

### 2. Local Manual Launch
Run the backend API:
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Start backend server
PYTHONPATH=backend/src uvicorn ztrader.main:app --reload --port 8000
```

Run the frontend app:
```bash
cd frontend
pnpm install
pnpm run dev
```
Open `http://localhost:3000` to view the platform.

### 3. Docker Compose Launch
Build and run all services (FastAPI, Next.js, Redis, PostgreSQL, Celery Worker) using a single command:
```bash
make run-docker
```
To stop the services:
```bash
make stop-docker
```

### 4. Running Backend Unit Tests
Execute the unit tests using pytest:
```bash
make test-backend
```

---

## Security Guidelines

- **No Hardcoded Secrets**: Ensure that `ENCRYPTION_KEY` and `JWT_SECRET` are never hardcoded.
- **Admin Token Required**: `/api/v1/admin/*` and `/api/v1/risk/kill-switch` require `ADMIN_API_TOKEN`.
- **Fail-Closed Gate**: Always check `RiskEngine` rules and audit logs for execution outcomes.
