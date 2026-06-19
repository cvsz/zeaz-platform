import logging

logger = logging.getLogger("CapitalPreservationGovernor")

class CapitalPreservationGovernor:
    def __init__(self, max_exposure=1.0):
        self.max_exposure = max_exposure
        
    def adjust_exposure(self, recent_drawdown: float, regime: str):
        logger.info("Running capital preservation checks...")
        if recent_drawdown > 0.1:
            logger.warning("Significant drawdown detected. Contracting exposure by 50%.")
            self.max_exposure *= 0.5
        elif regime in ["CRISIS", "BLACK_SWAN"]:
            logger.critical("Extreme market conditions. Reducing exposure to minimum survivable threshold.")
            self.max_exposure = 0.05
        else:
            self.max_exposure = 1.0
            
        return self.max_exposure
