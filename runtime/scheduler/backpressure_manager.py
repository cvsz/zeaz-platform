import logging
import time
from typing import Dict, Any, Optional
from runtime.scheduler.models import WorkloadSnapshot

logger = logging.getLogger("BackpressureManager")

class BackpressureManager:
    def __init__(self, high_load_threshold: float = 0.85, extreme_load_threshold: float = 0.95):
        self.high_load_threshold = high_load_threshold
        self.extreme_load_threshold = extreme_load_threshold
        self.provider_backpressure: Dict[str, float] = {} # provider_id -> sleep_time
        self.last_update = time.time()

    def calculate_backpressure(self, snapshot: WorkloadSnapshot) -> float:
        """
        Calculate suggested delay (in seconds) based on provider load.
        """
        load = snapshot.current_load
        delay = 0.0

        if load >= self.extreme_load_threshold:
            delay = 2.0 # Heavy throttle
        elif load >= self.high_load_threshold:
            delay = 0.5 # Light throttle
            
        # Add latency factor
        if snapshot.latency_ms > 5000:
            delay += 1.0
            
        self.provider_backpressure[snapshot.provider_id] = delay
        return delay

    def should_reject(self, provider_id: str) -> bool:
        """
        Safety valve: Reject new tasks if load is dangerously high.
        """
        # This could be more sophisticated, e.g., checking queue depth
        return self.provider_backpressure.get(provider_id, 0.0) >= 2.0

    def get_throttle_delay(self, provider_id: str) -> float:
        return self.provider_backpressure.get(provider_id, 0.0)
