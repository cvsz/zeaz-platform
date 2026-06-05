# zkbtrader

**ZKBTrader** is a safety-first crypto market research and paper-trading platform. It is designed for strategy research, backtesting, dry-run execution, exchange-read-only data access, and risk-control validation before any real exchange action is considered.

> Status: early scaffold. Default execution mode is `paper`. Live trading is intentionally disabled in this repository scaffold.

## Why this rebuild exists

The original project brief targeted an automated BTC/USDT trader. This rewrite converts the idea into a professional engineering platform with strict safety boundaries:

- no committed API keys, passphrases, tokens, or secret-looking values
- paper trading / dry-run mode by default
- read-only exchange adapter first
- strategy signals cannot create orders directly
- every execution intent must pass the risk engine
- audit logs for strategy decisions, risk decisions, and simulated fills
- tests and CI for safety-critical behavior

## Freqtrade-informed integration

This project is **informed by public Freqtrade concepts** such as dry-run mode, backtesting, strategy classes, pair selection, configuration validation, web UI control surfaces, and risk/money-management workflows.

Important license boundary:

- Freqtrade is GPL-3.0 licensed.
- This repository does not copy Freqtrade implementation code.
- Integration is done through clean-room architecture notes, compatible concepts, and optional subprocess/import boundaries only if the repository owner intentionally accepts the license impact.

See [`docs/freqtrade-integration-plan.md`](docs/freqtrade-integration-plan.md).

## MVP modules

```text
src/zkbtrader/
  api.py        FastAPI health/config/risk endpoints
  config.py     redacted settings model, paper mode default
  models.py     shared dataclasses and enums
  paper.py      deterministic paper execution simulator
  risk.py       fail-closed risk engine and kill switch
  strategy.py   strategy interface that emits intents, not orders
docs/
  freqtrade-integration-plan.md
prompts/
  agy-freqtrade-master-meta-prompts.md
tests/
  test_risk.py
  test_paper.py
```

## Quick start

```bash
python -m venv .venv
. .venv/bin/activate
pip install -e '.[dev]'
cp .env.example .env
make test
make api
```

API health endpoint:

```bash
curl http://127.0.0.1:8004/health
```

Dashboard v2:

```bash
curl http://127.0.0.1:8004/
```

The root dashboard is server-rendered HTML and is paper-ops focused. It shows:

- system status and links (`/health`, `/ready`)
- safety state (`safe`, `live_trading_enabled`, kill-switch status)
- market-data quick links (public KuCoin endpoints via local API)
- latest paper orders (up to 5)
- latest audit events (up to 5)
- latest backtest runs (up to 5)
- API quick links for config/risk/orders/audit/backtests

## Safety defaults

| Setting | Default | Meaning |
| --- | --- | --- |
| `EXECUTION_MODE` | `paper` | no real orders |
| `LIVE_TRADING_ENABLED` | `false` | live trading path blocked |
| `GLOBAL_KILL_SWITCH` | `false` | can block all new execution intents when enabled |
| `DEFAULT_STAKE_CURRENCY` | `USDT` | simulated stake only |
| `DEFAULT_SYMBOLS` | `BTC/USDT` | research pairlist |

## What is intentionally not implemented

- withdrawal or transfer automation
- earn/lending automation
- leverage changes
- futures execution
- live market order placement
- secret storage inside repo files
- claims of guaranteed profit

## Development commands

```bash
make lint
make typecheck
make test
make secret-scan
make api
```

## Financial risk notice

This project is educational/research software. It is not financial advice, does not guarantee profit, and must not be used with real funds unless the operator understands the code, exchange permissions, legal obligations, and operational risks.

## Public market and backtest API endpoints

Local API base URL (default):

```bash
http://127.0.0.1:8004
```

Public market-data endpoints:

```text
GET /api/v1/markets
GET /api/v1/markets/{symbol}/ticker
GET /api/v1/markets/{symbol}/candles?timeframe=1hour&limit=100
GET /api/v1/markets/{symbol}/orderbook?depth=20
GET /api/v1/markets/server-time
```

Backtest endpoints:

```text
POST /api/v1/backtest/run
GET /api/v1/backtests
GET /api/v1/backtests/{run_id}
```

`symbol` supports either `BTC/USDT` or `BTC-USDT` in path inputs and is normalized to `BTC/USDT` in responses.

## Operational data pagination and filtering

Endpoints:

```text
GET /api/v1/audit/events
GET /api/v1/paper/orders
GET /api/v1/backtests
```

Shared query params:

- `limit` (default `50`, min `1`, max `200`)
- `offset` (default `0`, min `0`)

Audit filters:

- `event_type`
- `request_id`
- `actor`

Paper order filters:

- `symbol`
- `strategy_id`
- `side` (`enter_long` or `exit_long`)

Backtest filters:

- `symbol`
- `strategy_id`

Response envelope:

```json
{
  "items": [],
  "limit": 50,
  "offset": 0,
  "count": 0
}
```
