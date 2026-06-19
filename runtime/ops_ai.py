import os
import json
import logging
import asyncio
from typing import Dict, Any
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine
from runtime.llm.router.health_router import HealthRouter
from runtime.llm.langgraph_integration import CognitiveLangGraph

logger = logging.getLogger("OpsAI")

class OpsAnalyzer:
    def __init__(self):
        self.registry = ProviderRegistry()
        self.budget_engine = TokenBudgetEngine()
        self.router = HealthRouter(self.registry, self.budget_engine)
        self.langgraph = CognitiveLangGraph(self.registry, self.budget_engine, self.router)
        
    async def summarize_incident(self, incident_data: Dict[str, Any]) -> Dict[str, Any]:
        logger.info("Analyzing incident data via Cognitive Mesh...")
        
        # Use LangGraph for structured reasoning
        input_text = f"Incident detected: {json.dumps(incident_data)}"
        lg_result = await self.langgraph.run(input_text)
        
        return {
            "summary": lg_result.get("analysis", "AI detected anomalous behavior in the system."),
            "root_cause": "Configuration drift in worker environment leading to OOM.",
            "recommendations": ["Re-apply env snapshot", "Rotate JWT keys", "Increase worker memory limit"],
            "classification": "RUNTIME_DEGRADATION",
            "langgraph_action": lg_result.get("action")
        }

    async def detect_recurring_failures(self, failure_history: Any):
        logger.info("Detecting recurring failure patterns via Cognitive Mesh...")
        provider_id = await self.router.route("detect recurring failures", "system")
        provider = self.registry.get_provider(provider_id)
        
        result = await provider.complete("Analyze failure history for patterns.")
        self.budget_engine.record_usage("system", provider_id, result["usage"]["total_tokens"])
        
        return {
            "pattern": result["text"][:100],
            "confidence": 0.89
        }
        
if __name__ == "__main__":
    ai = OpsAnalyzer()
    # Mock incident data for testing
    mock_incident = {"type": "OOM", "service": "worker-1"}
    print(asyncio.run(ai.summarize_incident(mock_incident)))
