import logging
import json
import redis
from typing import Dict, List, Any, Optional
from runtime.llm.base import BaseLLMProvider
from runtime.llm.providers.google.vertex_adapter import VertexAIProvider

logger = logging.getLogger("ProviderRegistry")

class ProviderRegistry:
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        self.redis = redis.from_url(redis_url)
        self.providers: Dict[str, BaseLLMProvider] = {}
        self._load_providers()

    def _load_providers(self):
        # In a real system, this might load from a DB or config file
        # For now, we manually register Vertex AI
        vertex_config = {
            "project": "zeaz-platform",
            "location": "us-central1",
            "model": "gemini-2.0-flash",
            "state_machine": {
                "failure_threshold": 3,
                "cooldown_period": 30
            }
        }
        self.register_provider("vertex-ai", VertexAIProvider("vertex-ai", vertex_config))

    def register_provider(self, provider_id: str, provider: BaseLLMProvider):
        self.providers[provider_id] = provider
        logger.info(f"Provider registered: {provider_id}")

    def get_provider(self, provider_id: str) -> Optional[BaseLLMProvider]:
        return self.providers.get(provider_id)

    def get_available_providers(self) -> List[str]:
        return [pid for pid, p in self.providers.items() if p.state_machine.is_available()]

    def acquire_lease(self, provider_id: str, client_id: str, duration: int = 10) -> bool:
        """Acquire a lease for a provider to prevent concurrent access if needed"""
        key = f"llm_lease:{provider_id}"
        return bool(self.redis.set(key, client_id, ex=duration, nx=True))

    def release_lease(self, provider_id: str, client_id: str):
        key = f"llm_lease:{provider_id}"
        current = self.redis.get(key)
        if current and current.decode() == client_id:
            self.redis.delete(key)

    def get_all_statuses(self) -> Dict[str, Any]:
        return {pid: p.get_status() for pid, p in self.providers.items()}

    def discovery_capabilities(self, provider_id: str) -> Dict[str, Any]:
        provider = self.get_provider(provider_id)
        if not provider:
            return {}
        
        # Capability discovery logic
        return {
            "provider_id": provider_id,
            "supports_streaming": True, # Most do now
            "model": provider.config.get("model"),
            "location": provider.config.get("location")
        }
