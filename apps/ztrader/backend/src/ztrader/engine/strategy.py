# apps/ztrader/backend/src/ztrader/engine/strategy.py

from abc import ABC, abstractmethod
from dataclasses import dataclass
from typing import List, Optional
from ztrader.engine.risk import StrategyIntent

@dataclass(frozen=True)
class Candle:
    timestamp: str
    open: float
    high: float
    low: float
    close: float
    volume: float

class Strategy(ABC):
    """Strategies emit intents only; they never execute orders directly."""
    id: str
    symbol: str

    @abstractmethod
    def generate_intent(self, candles: List[Candle]) -> Optional[StrategyIntent]:
        raise NotImplementedError

class MovingAverageCrossoverStrategy(Strategy):
    def __init__(
        self,
        symbol: str = "BTC/USDT",
        fast: int = 3,
        slow: int = 5,
        notional: float = 25.0,
    ) -> None:
        if fast <= 0 or slow <= 0 or fast >= slow:
            raise ValueError("fast must be positive and lower than slow")
        self.id = "ma-crossover-paper"
        self.symbol = symbol
        self.fast = fast
        self.slow = slow
        self.notional = notional

    def generate_intent(self, candles: List[Candle]) -> Optional[StrategyIntent]:
        if len(candles) < self.slow:
            return None
        closes = [c.close for c in candles]
        fast_avg = sum(closes[-self.fast :]) / self.fast
        slow_avg = sum(closes[-self.slow :]) / self.slow
        if fast_avg > slow_avg:
            return StrategyIntent(
                symbol=self.symbol,
                side="buy",
                notional=self.notional,
                strategy_id=self.id,
                request_id="", # Assigned by caller or default
            )
        if fast_avg < slow_avg:
            return StrategyIntent(
                symbol=self.symbol,
                side="sell",
                notional=self.notional,
                strategy_id=self.id,
                request_id="", # Assigned by caller or default
            )
        return None
