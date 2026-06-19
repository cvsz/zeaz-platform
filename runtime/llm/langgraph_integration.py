import logging
from typing import Dict, Any, List, Annotated
from typing_extensions import TypedDict
from langgraph.graph import StateGraph, END
from runtime.llm.router.health_router import HealthRouter
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine

logger = logging.getLogger("LangGraphIntegration")

class AgentState(TypedDict):
    input: str
    history: List[str]
    analysis: str
    action: str
    next_step: str

class CognitiveLangGraph:
    def __init__(
        self, 
        registry: ProviderRegistry, 
        budget_engine: TokenBudgetEngine,
        router: HealthRouter
    ):
        self.registry = registry
        self.budget_engine = budget_engine
        self.router = router
        self.graph = self._build_graph()

    def _build_graph(self):
        workflow = StateGraph(AgentState)

        workflow.add_node("analyze", self._analyze_node)
        workflow.add_node("plan", self._plan_node)
        workflow.add_node("execute", self._execute_node)

        workflow.set_entry_point("analyze")
        workflow.add_edge("analyze", "plan")
        workflow.add_edge("plan", "execute")
        workflow.add_edge("execute", END)

        return workflow.compile()

    async def _analyze_node(self, state: AgentState):
        logger.info("LangGraph: Analyzing input via Cognitive Mesh")
        provider_id = await self.router.route(state["input"], "system")
        provider = self.registry.get_provider(provider_id)
        
        # In a real system, we'd use a specific prompt template
        result = await provider.complete(f"Analyze: {state['input']}")
        self.budget_engine.record_usage("system", provider_id, result["usage"]["total_tokens"])
        
        return {"analysis": result["text"]}

    async def _plan_node(self, state: AgentState):
        logger.info("LangGraph: Planning next action")
        return {"action": "scale_worker_pool"}

    async def _execute_node(self, state: AgentState):
        logger.info(f"LangGraph: Executing action: {state['action']}")
        return {"next_step": "verification"}

    async def run(self, input_text: str):
        initial_state = {
            "input": input_text,
            "history": [],
            "analysis": "",
            "action": "",
            "next_step": ""
        }
        return await self.graph.ainvoke(initial_state)
