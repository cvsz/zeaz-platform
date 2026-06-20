from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, HTTPException
from pydantic import BaseModel
from typing import Dict, Any, List, Optional
import json
import asyncio
import uuid
from .auth import require_auth
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

class CompletionRequest(BaseModel):
    tenant_id: str = "default"
    prompt: str
    options: dict = {}

@router.post("/completion", dependencies=[Depends(require_auth)])
async def completion(data: CompletionRequest):
    try:
        provider_id = await llm_router.route(data.prompt, data.tenant_id, **data.model_dump())
        provider = registry.get_provider(provider_id)
        
        result = await provider.complete(data.prompt, **data.options)
        budget_engine.record_usage(data.tenant_id, provider_id, result.get("usage", {}).get("total_tokens", 0))
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail={"error": "Completion failed", "message": str(e)})

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
                "timestamp": asyncio.get_running_loop().time()
            }
            
            # Use delta encoding to reduce traffic
            encoded = delta_encoder.encode(client_id, state)
            if encoded:
                await websocket.send_json(encoded)
            
            await asyncio.sleep(1) # 1Hz topology updates
    except WebSocketDisconnect:
        delta_encoder.reset(client_id)
