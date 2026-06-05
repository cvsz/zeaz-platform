# ZKBTrader ECC-Guided Next Build

Use local ECC reference at `.vendor/ECC`, but do not copy blindly.

Read first:
- README.md
- AGENTS.md
- SECURITY.md
- docs/ecc-upstream-import.md
- .vendor/ECC/AGENTS.md
- .vendor/ECC/the-security-guide.md

Goal:
Implement the next safe ZKBTrader milestone.

Tasks:
1. Fix local CI issues.
2. Add PostgreSQL persistence for audit events and paper orders.
3. Add Alembic migrations.
4. Add KuCoin public market-data client only.
5. Add backtest API endpoints.
6. Add minimal dashboard.
7. Add safety check proving live trading remains disabled.

Hard rules:
- Keep EXECUTION_MODE=paper.
- Do not add live order placement.
- Do not add private exchange auth.
- Do not add withdrawals, transfers, margin, leverage, futures, earn, or lending.
- Do not commit `.vendor/ECC`.
- Do not commit secrets.
- Route simulated execution through RiskEngine.

Required checks:
- make lint
- make typecheck
- make test
- make secret-scan
- docker compose up -d --build
- curl http://127.0.0.1:8004/health
- curl http://127.0.0.1:8004/ready
