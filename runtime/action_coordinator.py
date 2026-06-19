import logging
import threading
from typing import Dict, Optional

logger = logging.getLogger("ActionCoordinator")

class ActionCoordinator:
    def __init__(self):
        # In a distributed system, this would be backed by Redis locks
        self._leases: Dict[str, float] = {}
        self._lock = threading.Lock()

    def acquire_lease(self, action_id: str, timeout: float = 60.0) -> bool:
        """
        Acquires an exclusive lease for a critical operational action.
        Prevents conflicting operations (e.g. heal while rolling back).
        """
        import time
        with self._lock:
            current_time = time.time()
            if action_id in self._leases:
                if current_time < self._leases[action_id]:
                    logger.warning(f"Action lease {action_id} is currently held.")
                    return False
            
            self._leases[action_id] = current_time + timeout
            logger.info(f"Acquired action lease: {action_id}")
            return True

    def release_lease(self, action_id: str):
        with self._lock:
            if action_id in self._leases:
                del self._leases[action_id]
                logger.info(f"Released action lease: {action_id}")
                
    def cancel_all_leases(self):
        with self._lock:
            self._leases.clear()
            logger.info("All action leases cancelled.")
