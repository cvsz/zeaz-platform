# apps/ztrader/backend/src/ztrader/engine/backtest.py

from dataclasses import dataclass
from typing import List
from ztrader.engine.paper import PaperExecutionEngine, PaperPortfolio
from ztrader.engine.risk import RiskEngine
from ztrader.engine.strategy import Candle, Strategy

@dataclass(frozen=True)
class BacktestResult:
    strategy_id: str
    candles_seen: int
    orders_created: int
    ending_usdt: float
    ending_btc: float

class BacktestEngine:
    """Deterministic replay engine using the same risk and paper execution path."""

    def __init__(self, allowed_symbols: tuple[str, ...], starting_usdt: float = 1000.0, starting_btc: float = 0.0) -> None:
        self.paper = PaperExecutionEngine(PaperPortfolio(usdt=starting_usdt, btc=starting_btc))
        # Backtest uses a local risk engine with kill switch = False for simulation
        self.risk = RiskEngine(
            allowed_symbols=allowed_symbols,
            max_order_notional=1000000.0, # Large limit for backtesting
            kill_switch=False
        )

    def run(self, strategy: Strategy, candles: List[Candle]) -> BacktestResult:
        orders = []
        for idx in range(1, len(candles) + 1):
            window = candles[:idx]
            intent = strategy.generate_intent(window)
            if intent is None:
                continue
            try:
                # Assign a dummy request_id for simulation purposes
                import uuid
                intent_with_id = intent
                if not intent.request_id:
                    intent_with_id = intent.__class__(
                        symbol=intent.symbol,
                        side=intent.side,
                        notional=intent.notional,
                        strategy_id=intent.strategy_id,
                        request_id=str(uuid.uuid4())
                    )
                order = self.paper.execute(intent_with_id, price=window[-1].close, risk=self.risk)
                orders.append(order)
            except ValueError:
                continue

        return BacktestResult(
            strategy_id=strategy.id,
            candles_seen=len(candles),
            orders_created=len(orders),
            ending_usdt=self.paper.portfolio.usdt,
            ending_btc=self.paper.portfolio.btc,
        )
