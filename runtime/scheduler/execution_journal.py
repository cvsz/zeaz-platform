import json
import hashlib
import hmac
import time
import logging
from typing import Dict, Any, List, Optional

logger = logging.getLogger("ExecutionJournal")

class ExecutionJournal:
    def __init__(self, secret_key: str = "zeaz-internal-secret", log_path: str = "/tmp/zeaz_execution_journal.log"):
        self.secret_key = secret_key.encode()
        self.log_path = log_path

    def record_execution(self, task_id: str, action: str, tenant_id: str, payload: Dict[str, Any], result: Optional[Dict[str, Any]] = None):
        """
        Record a task execution event in the journal.
        """
        timestamp = time.time()
        entry = {
            "task_id": task_id,
            "action": action,
            "tenant_id": tenant_id,
            "timestamp": timestamp,
            "payload": payload,
            "result": result,
            "nonce": str(int(timestamp * 1000000))
        }
        
        entry["signature"] = self._sign_entry(entry)
        
        with open(self.log_path, "a") as f:
            f.write(json.dumps(entry) + "\n")
            
        logger.info(f"Execution journaled: {task_id} - {action}")

    def _sign_entry(self, entry: Dict[str, Any]) -> str:
        """
        Generate an HMAC-SHA256 signature for the entry.
        """
        # Exclude signature itself from calculation
        sign_data = {k: v for k, v in entry.items() if k != "signature"}
        message = json.dumps(sign_data, sort_keys=True).encode()
        return hmac.new(self.secret_key, message, hashlib.sha256).hexdigest()

    def verify_entry(self, entry: Dict[str, Any]) -> bool:
        """
        Verify the signature of a journal entry.
        """
        if "signature" not in entry:
            return False
        expected_signature = self._sign_entry(entry)
        return hmac.compare_digest(entry["signature"], expected_signature)

    def get_task_lineage(self, task_id: str) -> List[Dict[str, Any]]:
        """
        Retrieve all journal entries related to a specific task.
        """
        lineage = []
        try:
            with open(self.log_path, "r") as f:
                for line in f:
                    entry = json.loads(line)
                    if entry["task_id"] == task_id:
                        lineage.append(entry)
        except FileNotFoundError:
            pass
        return lineage
