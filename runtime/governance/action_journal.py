import json
import hashlib
import time
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("ActionJournal")

class ActionJournal:
    def __init__(self, log_path: str = "/tmp/zeaz_action_journal.log"):
        self.log_path = log_path
        self._setup_logging()

    def _setup_logging(self):
        # In a real system, this would be a high-performance append-only log
        pass

    def record_action(self, action_id: str, action_type: str, actor_id: str, payload: Dict[str, Any]):
        timestamp = time.time()
        entry = {
            "action_id": action_id,
            "action_type": action_type,
            "actor_id": actor_id,
            "timestamp": timestamp,
            "payload": payload,
            "signature": self._sign_action(action_id, timestamp, payload)
        }
        
        # Write to append-only log
        with open(self.log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")
            
        logger.info(f"Action journaled: {action_id} ({action_type})")

    def _sign_action(self, action_id: str, timestamp: float, payload: Dict[str, Any]) -> str:
        # Simplified signature for forensic audit
        data = f"{action_id}|{timestamp}|{json.dumps(payload, sort_keys=True)}"
        return hashlib.sha256(data.encode()).hexdigest()

    def get_action_history(self, action_type: Optional[str] = None) -> List[Dict[str, Any]]:
        history = []
        try:
            with open(self.log_path, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if action_type is None or entry["action_type"] == action_type:
                        history.append(entry)
        except FileNotFoundError:
            pass
        return history
