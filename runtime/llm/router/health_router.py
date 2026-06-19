import logging
from typing import List, Dict, Any
from runtime.llm.router.base import BaseRouter

logger = logging.getLogger("HealthRouter")

class HealthRouter(BaseRouter):
    async def route(self, prompt: str, tenant_id: str, **kwargs) -> str:
        available_providers = self.registry.get_available_providers()
        if not available_providers:
            raise Exception("No healthy LLM providers available.")
        
        # Simple health-aware selection: pick the first healthy one
        # In a real system, this might involve more logic or randomization
        selected = available_providers[0]
        
        # Check budget before finalizing
        if not self.budget_engine.check_budget(tenant_id, selected, kwargs.get("estimated_tokens", 1000)):
            # If the best one is over budget, try others or fail
            for p in available_providers[1:]:
                if self.budget_engine.check_budget(tenant_id, p, kwargs.get("estimated_tokens", 1000)):
                    return p
            raise Exception("No providers available within budget.")
            
        return selected
