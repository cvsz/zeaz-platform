import hmac
import hashlib
import time
import logging
from typing import Dict, Any

logger = logging.getLogger("TradingViewWebhookServer")

class TradingViewWebhookValidator:
    def __init__(self, secret: str):
        self.secret = secret.encode('utf-8')
        self.processed_nonces = set()

    def validate_payload(self, signature: str, timestamp: int, payload: str) -> bool:
        # Prevent replay attacks > 5 minutes
        if abs(time.time() - timestamp) > 300:
            logger.error("Payload rejected: Timestamp expired (Replay Attack Prevention)")
            return False

        expected = hmac.new(self.secret, f"{timestamp}.{payload}".encode('utf-8'), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(expected, signature):
            logger.error("Payload rejected: Invalid HMAC signature")
            return False
            
        return True
