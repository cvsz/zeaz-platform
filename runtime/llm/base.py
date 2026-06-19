from abc import ABC, abstractmethod
from typing import AsyncGenerator, Dict, Any, List, Optional
from runtime.llm.provider_state_machine import ProviderStateMachine

class BaseLLMProvider(ABC):
    def __init__(self, provider_id: str, config: Dict[str, Any]):
        self.provider_id = provider_id
        self.config = config
        self.state_machine = ProviderStateMachine(provider_id, config.get("state_machine"))

    @abstractmethod
    async def complete(self, prompt: str, **kwargs) -> Dict[str, Any]:
        """Non-streaming completion"""
        pass

    @abstractmethod
    async def stream(self, prompt: str, **kwargs) -> AsyncGenerator[Dict[str, Any], None]:
        """Streaming completion"""
        pass

    @abstractmethod
    async def get_token_count(self, text: str) -> int:
        """Estimate token count for the given text"""
        pass

    async def health_check(self) -> bool:
        """Perform a basic connectivity and health check"""
        try:
            # Implementation specific health check
            await self.complete("health check", max_tokens=1)
            self.state_machine.report_success()
            return True
        except Exception:
            self.state_machine.report_failure()
            return False

    def get_status(self) -> Dict[str, Any]:
        return self.state_machine.get_status()
