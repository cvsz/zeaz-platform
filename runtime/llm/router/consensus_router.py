import logging
from typing import List, Dict, Any, Union
from runtime.llm.router.base import BaseRouter

logger = logging.getLogger("ConsensusRouter")

class ConsensusRouter(BaseRouter):
    async def route(self, prompt: str, tenant_id: str, **kwargs) -> List[str]:
        available_providers = self.registry.get_available_providers()
        
        # Consensus requires at least 2 or 3 providers
        required_count = kwargs.get("consensus_count", 3)
        
        selected = []
        for p in available_providers:
            if self.budget_engine.check_budget(tenant_id, p, kwargs.get("estimated_tokens", 1000)):
                selected.append(p)
                if len(selected) >= required_count:
                    break
        
        if len(selected) < 2:
            logger.warning("Consensus requested but insufficient providers/budget available.")
            # Fallback to single provider or raise
            return selected or [available_providers[0]] if available_providers else []

        return selected
