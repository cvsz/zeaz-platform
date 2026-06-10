# zkbtrader

Last updated: 2026-06-10

`apps/zkbtrader` is a safety-first crypto market research and paper-trading stack. It is designed for strategy research, backtesting, dry-run execution, read-only exchange data access, and risk-control validation.

## Safety mode

Default execution mode is:

```text
paper
```

Live trading is intentionally not the default path. Keep real exchange keys, write permissions, withdrawals, and live execution disabled unless a future audited release explicitly enables them.

## Stack

| Layer | Stack |
|---|---|
| Backend / services | Python |
| Database migrations | Alembic |
| Containers | Dockerfile.api, Dockerfile.worker, docker-compose.yml |
| Package metadata | pyproject.toml, package.json |
| Test harness | `tests/`, `harness/` |
| Operations | Makefile, scripts, reports |

## Scope rule

This README documents only `apps/zkbtrader`. Do not mix commands from `apps/ztrader`, `apps/zdash`, or other trading stacks.

## Local development

```bash
cd /home/zeazdev/zeaz-platform/apps/zkbtrader
python3 -m venv .venv
source .venv/bin/activate
pip install -e .
```

If Node tooling is needed:

```bash
npm install
```

## Docker

```bash
docker compose up -d --build
```

## Validation

```bash
pytest
```

## Important files

```text
pyproject.toml
alembic.ini
alembic/
docker-compose.yml
Dockerfile.api
Dockerfile.worker
src/
harness/
tests/
reports/
Makefile
```

## Security notes

- Never commit exchange API keys.
- Prefer read-only exchange permissions.
- Keep execution mode as paper/dry-run by default.
- Require explicit risk checks before any live trading path.
