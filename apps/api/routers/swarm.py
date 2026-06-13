from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Depends
from typing import Dict, Any, List
import json
import redis.asyncio as aioredis
import asyncio
import os
from .auth import require_auth

router = APIRouter()
REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379/0")
redis_client = aioredis.from_url(REDIS_URL)

@router.get("/agents")
async def get_active_agents():
    agent_ids = await redis_client.smembers("swarm:active_agents")
    agents = []
    for aid in agent_ids:
        try:
            decoded_aid = aid.decode()
            data = await redis_client.get(f"swarm:agent:{decoded_aid}")
            if data:
                agents.append(json.loads(data.decode()))
        except Exception:
            continue
    return agents

@router.get("/marketplace")
async def get_marketplace_status():
    # In a real system, would use xread for streams
    return {"status": "ACTIVE", "task_count": 0}

@router.get("/topology")
async def get_swarm_topology():
    agents = await get_active_agents()
    nodes = [{"id": "orchestrator", "type": "ORCHESTRATOR", "status": "active"}]
    edges = []
    
    for agent in agents:
        nodes.append({
            "id": agent["agent_id"],
            "type": agent["agent_type"].upper(),
            "status": agent["status"]
        })
        edges.append({"source": "orchestrator", "target": agent["agent_id"]})
        
    return {"nodes": nodes, "edges": edges}

@router.websocket("/ws/swarm")
async def swarm_ws(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            # Broadcast swarm events and status
            topology = await get_swarm_topology()
            await websocket.send_json({"type": "SWARM_UPDATE", "data": topology})
            await asyncio.sleep(2)
    except WebSocketDisconnect:
        pass
