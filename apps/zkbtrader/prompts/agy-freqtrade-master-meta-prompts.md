# AGY Freqtrade Master Meta Prompt Pack for zkbtrader

## Master execution prompt

```text
AGY, deep review `freqtrade/freqtrade` for architecture concepts only, then integrate safe original equivalents into `cvsz/zkbtrader`.

Hard boundary:
- Do not copy GPL implementation code from Freqtrade.
- Do not copy strategy templates verbatim.
- Do not vendor Freqtrade files.
- Do not add live trading by default.
- Do not add withdrawal, transfer, earn, lending, leverage, or futures execution flows.

Build ZKBTrader as a safety-first paper trading and market research platform.
Default execution mode must be paper/dry-run only.
All strategies must emit intents only.
All intents must pass the risk engine.
All sensitive config must be redacted.
All tests and CI must prove risk gates block execution.
```

## Feature integration prompt

```text
Implement Freqtrade-informed features in original ZKBTrader code:

1. Paper/dry-run engine
2. Strategy interface
3. Pair whitelist/allowlist
4. Max trade count per symbol
5. Config validation
6. Backtesting scaffold
7. Web API control plane
8. Audit logging scaffold
9. Secret scanning
10. CI checks

Acceptance:
- `make test` passes
- `make lint` passes
- `make typecheck` passes
- no secret-looking values are committed
- README documents GPL boundary
- live trading remains blocked
```

## Future compatibility prompt

```text
Design a future optional compatibility adapter that can map a Freqtrade-like strategy dataframe result into ZKBTrader StrategyIntent objects.

Rules:
- adapter must be optional
- adapter must not execute orders
- adapter must not bypass risk engine
- adapter must include license notice
- adapter must support only paper/backtest mode first
- adapter must reject short/futures/leverage signals unless explicitly enabled in a future milestone
```
