from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Any, List
import json
import asyncio
import uuid
from runtime.llm.provider_registry import ProviderRegistry
from runtime.llm.token_budget_engine import TokenBudgetEngine
from runtime.llm.router.health_router import HealthRouter
from runtime.streaming.stream_backpressure import StreamBackpressure
from runtime.streaming.delta_encoder import DeltaEncoder

router = APIRouter()

# Dependency providers (in a real app, use dependency injection properly)
registry = ProviderRegistry()
budget_engine = TokenBudgetEngine()
llm_router = HealthRouter(registry, budget_engine)
backpressure = StreamBackpressure()
delta_encoder = DeltaEncoder()

@router.post("/completion")
async def completion(data: Dict[str, Any]):
    tenant_id = data.get("tenant_id", "default")
    prompt = data.get("prompt", "")
    
    provider_id = await llm_router.route(prompt, tenant_id, **data)
    provider = registry.get_provider(provider_id)
    
    result = await provider.complete(prompt, **data.get("options", {}))
    budget_engine.record_usage(tenant_id, provider_id, result["usage"]["total_tokens"])
    
    return result

@router.get("/health")
async def health():
    return registry.get_all_statuses()

@router.get("/metrics")
async def metrics():
    return budget_engine.get_metrics()

@router.websocket("/ws/topology")
async def topology_ws(websocket: WebSocket):
    client_id = str(uuid.uuid4())
    await websocket.accept()
    
    try:
        while True:
            # Broadcast current topology state periodically
            statuses = registry.get_all_statuses()
            metrics = budget_engine.get_metrics()
            
            state = {
                "topology": statuses,
                "metrics": metrics,
                "timestamp": asyncio.get_event_loop().time()
            }
            
            # Use delta encoding to reduce traffic
            encoded = delta_encoder.encode(client_id, state)
            if encoded:
                await websocket.send_json(encoded)
            
            await asyncio.sleep(1) # 1Hz topology updates
    except WebSocketDisconnect:
        delta_encoder.reset(client_id)
