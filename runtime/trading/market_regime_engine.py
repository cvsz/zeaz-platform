import logging
from enum import Enum

logger = logging.getLogger("MarketRegimeEngine")

class Regime(Enum):
    NORMAL = "NORMAL"
    VOLATILE = "VOLATILE"
    CRISIS = "CRISIS"
    ILLIQUID = "ILLIQUID"
    EXCHANGE_UNSTABLE = "EXCHANGE_UNSTABLE"
    BLACK_SWAN = "BLACK_SWAN"

class MarketRegimeEngine:
    def __init__(self):
        self.current_regime = Regime.NORMAL
        
    def assess_regime(self, volatility_index: float, liquidity_depth: float):
        logger.info("Assessing market regime...")
        if volatility_index > 0.8:
            self.current_regime = Regime.CRISIS
        elif volatility_index > 0.5:
            self.current_regime = Regime.VOLATILE
        else:
            self.current_regime = Regime.NORMAL
            
        logger.info(f"Market regime updated to {self.current_regime.name}")
        return self.current_regime
