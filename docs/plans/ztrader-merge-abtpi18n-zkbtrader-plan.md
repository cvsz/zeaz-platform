# zTrader Merge Plan: ABTPi18n + zkbtrader

## Overview
Merge the source stacks of ABTPi18n and zkbtrader into the unified `ztrader` application.

## Source Mapping
- apps/ABTPi18n/configs -> apps/ztrader/config/abtpi18n
- apps/ABTPi18n/core -> apps/ztrader/backend/src/ztrader/abt/core
- apps/ABTPi18n/strategies -> apps/ztrader/backend/src/ztrader/strategies/abtpi18n
- apps/ABTPi18n/monitoring -> apps/ztrader/backend/src/ztrader/monitoring/abtpi18n
- apps/ABTPi18n/scripts -> apps/ztrader/scripts/abtpi18n
- apps/ABTPi18n/tests -> apps/ztrader/backend/tests/abtpi18n
- apps/zkbtrader/src -> apps/ztrader/backend/src/ztrader/zkb
- apps/zkbtrader/harness -> apps/ztrader/harness/zkbtrader
- apps/zkbtrader/tests -> apps/ztrader/backend/tests/zkbtrader
- apps/zkbtrader/reports -> apps/ztrader/reports/zkbtrader
- apps/zkbtrader/scripts -> apps/ztrader/scripts/zkbtrader
- apps/zkbtrader/alembic -> apps/ztrader/backend/alembic/zkbtrader_source

## Safety Defaults
- EXECUTION_MODE: "paper"
- LIVE_TRADING_ENABLED: false
- GLOBAL_KILL_SWITCH: true

## Validation
- Python compileall must pass.
- Unit tests must pass.
- Frontend package.json must be valid.
