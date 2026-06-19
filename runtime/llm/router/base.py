from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine

class BaseRouter(ABC):
    def __init__(self, registry: ProviderRegistry, budget_engine: TokenBudgetEngine):
        self.registry = registry
        self.budget_engine = budget_engine

    @abstractmethod
    async def route(self, prompt: str, tenant_id: str, **kwargs) -> str:
        """Return the provider_id to use for this request"""
        pass
