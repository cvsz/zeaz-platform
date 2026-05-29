from enum import Enum
from typing import Dict, Any, Optional
import time
import logging

logger = logging.getLogger("ProviderStateMachine")

class ProviderState(Enum):
    HEALTHY = "HEALTHY"
    DEGRADED = "DEGRADED"
    RATE_LIMITED = "RATE_LIMITED"
    CIRCUIT_OPEN = "CIRCUIT_OPEN"
    RECOVERING = "RECOVERING"
    DISABLED = "DISABLED"
    DRAINING = "DRAINING"

class ProviderStateMachine:
    def __init__(self, provider_id: str, config: Optional[Dict[str, Any]] = None):
        self.provider_id = provider_id
        self.state = ProviderState.HEALTHY
        self.last_transition = time.time()
        self.failure_count = 0
        self.success_count = 0
        self.config = config or {}
        
        # Thresholds
        self.failure_threshold = self.config.get("failure_threshold", 5)
        self.recovery_threshold = self.config.get("recovery_threshold", 3)
        self.cooldown_period = self.config.get("cooldown_period", 60) # seconds

    def transition_to(self, new_state: ProviderState):
        if self.state == new_state:
            return
        
        logger.info(f"Provider {self.provider_id} transitioning: {self.state.name} -> {new_state.name}")
        self.state = new_state
        self.last_transition = time.time()
        
        if new_state == ProviderState.HEALTHY:
            self.failure_count = 0
            self.success_count = 0

    def report_success(self):
        self.success_count += 1
        self.failure_count = 0
        
        if self.state == ProviderState.RECOVERING:
            if self.success_count >= self.recovery_threshold:
                self.transition_to(ProviderState.HEALTHY)
        elif self.state in [ProviderState.DEGRADED, ProviderState.CIRCUIT_OPEN]:
            # Attempt recovery if enough successes in these states (optional logic)
            pass

    def report_failure(self, error_type: str = "generic"):
        self.failure_count += 1
        self.success_count = 0
        
        if error_type == "rate_limit":
            self.transition_to(ProviderState.RATE_LIMITED)
        elif self.failure_count >= self.failure_threshold:
            self.transition_to(ProviderState.CIRCUIT_OPEN)
        elif self.failure_count >= (self.failure_threshold // 2):
            self.transition_to(ProviderState.DEGRADED)

    def is_available(self) -> bool:
        if self.state == ProviderState.HEALTHY:
            return True
        
        if self.state == ProviderState.CIRCUIT_OPEN:
            # Check if cooldown has passed
            if time.time() - self.last_transition > self.cooldown_period:
                self.transition_to(ProviderState.RECOVERING)
                return True
            return False
        
        if self.state == ProviderState.RATE_LIMITED:
            # Rate limited might need a longer or specific backoff
            if time.time() - self.last_transition > self.cooldown_period * 2:
                self.transition_to(ProviderState.RECOVERING)
                return True
            return False
            
        if self.state in [ProviderState.DEGRADED, ProviderState.RECOVERING]:
            return True
            
        return False

    def get_status(self) -> Dict[str, Any]:
        return {
            "provider_id": self.provider_id,
            "state": self.state.value,
            "last_transition": self.last_transition,
            "failure_count": self.failure_count,
            "success_count": self.success_count
        }
