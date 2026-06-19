import logging

logger = logging.getLogger("TrustScore")

class TrustScoreEngine:
    def __init__(self):
        self.score = 1.0
        
    def calculate_score(self, reconciliation_health: float, regime_stability: float):
        logger.info("Calculating Financial Trust Score...")
        
        self.score = (reconciliation_health * 0.6) + (regime_stability * 0.4)
        logger.info(f"System Trust Score: {self.score * 100:.2f}%")
        
        return self.score
