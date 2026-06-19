import os
import json
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
import redis
from psycopg2 import pool
from langgraph.graph import StateGraph, END

app = FastAPI(title="Zeaz AI Runtime API")

# Environment
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
DB_URL = os.getenv("DATABASE_URL")

# Connections
redis_client = redis.from_url(REDIS_URL)

class ExecuteRequest(BaseModel):
    graph_id: str
    input_data: dict

@app.post("/execute")
async def execute_graph(req: ExecuteRequest, request: Request):
    # Enforce identity/trace headers
    service_id = request.headers.get("X-Service-ID", "unknown")
    user = request.headers.get("X-User", "anonymous")
    
    task_id = os.urandom(16).hex()
    payload = {
        "task_id": task_id,
        "graph_id": req.graph_id,
        "input_data": req.input_data,
        "user": user,
        "service_id": service_id
    }
    
    # Push to Redis Queue
    redis_client.lpush("ai_task_queue", json.dumps(payload))
    
    return {"status": "queued", "task_id": task_id}

@app.get("/health")
def health():
    return {"status": "healthy"}
