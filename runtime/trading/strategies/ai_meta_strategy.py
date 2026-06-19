import logging

logger = logging.getLogger("AIMetaStrategy")

class AIMetaStrategy:
    def __init__(self):
        self.strategies = {
            "momentum": {"weight": 0.3, "active": True},
            "mean_reversion": {"weight": 0.3, "active": True},
            "market_making": {"weight": 0.4, "active": True}
        }
        
    def optimize_allocations(self, market_regime):
        logger.info(f"Optimizing strategy allocations for regime: {market_regime}")
        # Disable underperforming, shift weights
        if market_regime == "HIGH_VOLATILITY":
            self.strategies["mean_reversion"]["weight"] = 0.1
            self.strategies["momentum"]["weight"] = 0.6
