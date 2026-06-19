import time
import logging
from typing import Dict, Any, Optional
from threading import Lock

logger = logging.getLogger("TokenBudgetEngine")

class TokenBudgetEngine:
    def __init__(self, config: Optional[Dict[str, Any]] = None):
        self.config = config or {}
        self.lock = Lock()
        
        # Quotas
        self.global_daily_quota = self.config.get("global_daily_quota", 1_000_000)
        self.tenant_quotas: Dict[str, int] = self.config.get("tenant_quotas", {})
        self.provider_quotas: Dict[str, int] = self.config.get("provider_quotas", {})
        
        # Tracking
        self.usage_today: Dict[str, int] = {"global": 0} # tenant_id -> count, "global" -> count
        self.provider_usage: Dict[str, int] = {}
        self.last_reset = time.time()
        
        # Rolling burn window (e.g., tokens per minute)
        self.window_size = 60 # seconds
        self.rolling_usage: List[Dict[str, Any]] = [] # list of {timestamp, tokens}

    def _maybe_reset_quotas(self):
        # Reset if it's a new day (UTC)
        current_time = time.time()
        if current_time - self.last_reset > 86400:
            with self.lock:
                self.usage_today = {"global": 0}
                self.provider_usage = {}
                self.last_reset = current_time
                logger.info("Token quotas reset for the new day.")

    def check_budget(self, tenant_id: str, provider_id: str, estimated_tokens: int) -> bool:
        self._maybe_reset_quotas()
        
        with self.lock:
            # Check global quota
            if self.usage_today["global"] + estimated_tokens > self.global_daily_quota:
                logger.warning("Global daily token quota exceeded.")
                return False
            
            # Check tenant quota
            tenant_quota = self.tenant_quotas.get(tenant_id, self.config.get("default_tenant_quota", 100_000))
            if self.usage_today.get(tenant_id, 0) + estimated_tokens > tenant_quota:
                logger.warning(f"Tenant {tenant_id} daily token quota exceeded.")
                return False
            
            # Check provider quota
            provider_quota = self.provider_quotas.get(provider_id, self.config.get("default_provider_quota", 500_000))
            if self.provider_usage.get(provider_id, 0) + estimated_tokens > provider_quota:
                logger.warning(f"Provider {provider_id} daily token quota exceeded.")
                return False
                
            # Check rolling window (burst protection)
            current_time = time.time()
            self.rolling_usage = [u for u in self.rolling_usage if current_time - u["timestamp"] < self.window_size]
            current_window_total = sum(u["tokens"] for u in self.rolling_usage)
            
            burst_limit = self.config.get("burst_limit_per_min", 50_000)
            if current_window_total + estimated_tokens > burst_limit:
                logger.warning(f"Burst limit exceeded: {current_window_total} tokens in last minute.")
                return False

        return True

    def record_usage(self, tenant_id: str, provider_id: str, actual_tokens: int):
        with self.lock:
            self.usage_today["global"] += actual_tokens
            self.usage_today[tenant_id] = self.usage_today.get(tenant_id, 0) + actual_tokens
            self.provider_usage[provider_id] = self.provider_usage.get(provider_id, 0) + actual_tokens
            
            self.rolling_usage.append({
                "timestamp": time.time(),
                "tokens": actual_tokens
            })
            
            # Anomaly detection (simplified)
            if actual_tokens > self.config.get("anomaly_threshold", 20_000):
                logger.error(f"Anomaly detected: Unexpectedly large request ({actual_tokens} tokens) from tenant {tenant_id} on provider {provider_id}")

    def get_metrics(self) -> Dict[str, Any]:
        with self.lock:
            return {
                "global_usage": self.usage_today["global"],
                "global_quota": self.global_daily_quota,
                "tenant_usage": {k: v for k, v in self.usage_today.items() if k != "global"},
                "provider_usage": self.provider_usage
            }
