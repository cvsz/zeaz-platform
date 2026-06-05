# Freqtrade-informed safe integration plan

## Source review

Freqtrade is a mature Python crypto trading bot with dry-run mode, backtesting, strategy development, optimization, persistence, WebUI, Telegram control, pairlists, plotting, and reporting. Its README explicitly recommends starting in dry-run mode and understanding the code before risking funds.

Freqtrade is licensed under GPL-3.0. ZKBTrader must not copy Freqtrade source code unless the repository owner intentionally accepts GPL obligations for the combined work.

## Integration strategy

ZKBTrader uses a clean-room, concept-level integration:

1. Study public behavior and architecture concepts.
2. Rebuild compatible concepts using original implementation.
3. Keep execution default as paper-only.
4. Keep exchange integrations read-only until risk and test coverage are strong.
5. Treat live trading as a later, gated milestone.

## Concepts to adapt

| Freqtrade concept | ZKBTrader equivalent |
| --- | --- |
| Dry-run | PaperExecutionEngine |
| Strategy class | Strategy interface that emits StrategyIntent |
| Candles/OHLCV dataframe | Candle dataclass now, dataframe adapter later |
| Pair whitelist | RiskLimits.allowed_symbols |
| max_open_trades | RiskLimits.max_trades_per_symbol / future portfolio slots |
| backtesting | future deterministic replay module |
| WebUI | future dashboard/API control plane |
| config validation | pydantic Settings |
| Telegram/RPC controls | future command API, disabled by default |

## Boundary rules

- Do not vendor Freqtrade code.
- Do not copy Freqtrade strategy templates verbatim.
- Do not import Freqtrade as a library inside core modules in this scaffold.
- Optional future interop should use a subprocess boundary or explicit plugin package with license notice.
- Keep all strategy execution routed through the ZKBTrader risk engine.

## Roadmap

### Phase 1: Safety foundation

- README cleanup
- env template
- secret scanning
- risk engine
- paper execution
- tests
- CI

### Phase 2: Research features

- candle storage
- simple backtesting
- strategy metrics
- CSV/JSON result export
- dashboard overview

### Phase 3: Exchange read-only adapter

- public market data
- read-only account summary
- rate limit handling
- no order placement

### Phase 4: Optional compatibility layer

- import strategy-like classes through a separate adapter
- map dataframe signals into StrategyIntent
- reject direct order execution
- document license impact before enabling

## Non-goals

- no withdrawal automation
- no transfer automation
- no lending/earn automation
- no leverage automation
- no live order placement in MVP
- no profit guarantees
