# Agent Operating Guide

## Mission

ZKBTrader is a research and paper-execution platform. Keep the project safe, testable, and auditable.

## Core rules

- Default execution mode stays `paper`.
- Strategy modules produce `StrategyIntent` objects only.
- Risk validation is mandatory before paper execution.
- The risk engine fails closed.
- Configuration examples must use placeholders only.
- Do not copy implementation files from external GPL projects.
- Add or update tests with behavior changes.

## Required local checks

```bash
make lint
make typecheck
make test
make secret-scan
```

## File boundaries

- `src/zkbtrader/strategy.py`: signal logic only
- `src/zkbtrader/risk.py`: allow or deny decisions
- `src/zkbtrader/paper.py`: simulated execution only
- `src/zkbtrader/api.py`: safe status and control API
- `src/zkbtrader/config.py`: settings and redacted output

## Report format

Include changed files, safety gates touched, tests run, and remaining limitations.
