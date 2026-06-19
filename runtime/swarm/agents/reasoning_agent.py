import asyncio
import logging
import json
from runtime.swarm.agent_base import BaseAgent
from runtime.swarm.marketplace import TaskMarketplace
from runtime.llm.langgraph_integration import CognitiveLangGraph
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine
from runtime.llm.router.health_router import HealthRouter

logger = logging.getLogger("ReasoningAgent")

class ReasoningAgent(BaseAgent):
    def __init__(self, redis_url: str = "redis://localhost:6379/0"):
        super().__init__(
            agent_type="reasoning",
            capabilities=["DECOMPOSE_GOAL", "STRATEGIC_PLANNING", "MULTI_STEP_REASONING"],
            redis_url=redis_url
        )
        self.marketplace = TaskMarketplace(redis_url)
        
        # Initialize LangGraph Cognitive Mesh
        registry = ProviderRegistry()
        budget = TokenBudgetEngine()
        router = HealthRouter(registry, budget)
        self.langgraph = CognitiveLangGraph(registry, budget, router)

    async def run(self):
        logger.info(f"Reasoning Agent {self.agent_id} (LangGraph) is active.")
        
        while self.running:
            try:
                # Listen for complex reasoning tasks
                messages = self.redis.xread({"swarm:marketplace": "$"}, block=1000, count=1)
                if messages:
                    for stream, msgs in messages:
                        for msg_id, payload in msgs:
                            task_data = json.loads(payload[b"data"])
                            if "DECOMPOSE_GOAL" in task_data.get("requirements", []):
                                logger.info(f"Reasoning Agent: Decomposing goal for task {task_data['task_id']}")
                                
                                # Run LangGraph reasoning chain
                                lg_result = await self.langgraph.run(task_data["payload"].get("goal", ""))
                                
                                # Store result in shared memory or marketplace
                                logger.info(f"Reasoning complete: {lg_result.get('action')}")
                                self.marketplace.bid_on_task(task_data["task_id"], self.agent_id)
                                
            except Exception as e:
                logger.error(f"Error in Reasoning Agent: {e}")
            await asyncio.sleep(1)
