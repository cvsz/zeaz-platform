import logging
from enum import Enum

logger = logging.getLogger("RiskEngine")

class RiskMode(Enum):
    NORMAL = "NORMAL"
    REDUCE_ONLY_MODE = "REDUCE_ONLY_MODE"
    NO_NEW_POSITIONS = "NO_NEW_POSITIONS"
    SAFE_MODE = "SAFE_MODE"
    EMERGENCY_STOP = "EMERGENCY_STOP"

class RiskEngine:
    def __init__(self):
        self.mode = RiskMode.NORMAL
        self.max_drawdown_limit = 0.15
        self.daily_loss_limit = 0.05
        
    def evaluate_order(self, order_req):
        if self.mode in [RiskMode.EMERGENCY_STOP, RiskMode.NO_NEW_POSITIONS]:
            if order_req.get('side') == 'open':
                logger.error(f"Order blocked: Risk engine in {self.mode.name}")
                return False
                
        # Slippage, drawdown, leverage caps logic goes here
        logger.info("Order passed risk evaluation.")
        return True

    def trigger_kill_switch(self):
        logger.critical("EMERGENCY STOP TRIGGERED!")
        self.mode = RiskMode.EMERGENCY_STOP
        return True
