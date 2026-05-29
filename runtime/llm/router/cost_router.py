import logging
from typing import List, Dict, Any
from runtime.llm.router.base import BaseRouter

logger = logging.getLogger("CostRouter")

class CostRouter(BaseRouter):
    def __init__(self, registry, budget_engine):
        super().__init__(registry, budget_engine)
        # Model pricing (tokens per $1) - dummy values
        self.pricing = {
            "vertex-ai": 100_000,
            "openai": 50_000,
            "anthropic": 40_000
        }

    async def route(self, prompt: str, tenant_id: str, **kwargs) -> str:
        available_providers = self.registry.get_available_providers()
        if not available_providers:
            raise Exception("No healthy LLM providers available.")

        # Sort by pricing (highest tokens per $1 first)
        sorted_providers = sorted(
            available_providers,
            key=lambda p: self.pricing.get(p, 1),
            reverse=True
        )

        for p in sorted_providers:
            if self.budget_engine.check_budget(tenant_id, p, kwargs.get("estimated_tokens", 1000)):
                return p

        raise Exception("No providers available within budget.")
