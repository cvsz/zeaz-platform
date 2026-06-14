import asyncio
import json
import docker
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from routers import runtime, agents, healing, observability, auth, llm, scheduler, swarm, cloudflare_control, zquest

import os
import logging
from contextlib import asynccontextmanager

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Background task reference
bg_tasks = set()

@asynccontextmanager
async def lifespan(app: FastAPI):
    task = asyncio.create_task(stream_docker_stats())
    bg_tasks.add(task)
    task.add_done_callback(bg_tasks.discard)
    yield
    task.cancel()
    try:
        await task
    except asyncio.CancelledError:
        pass

app = FastAPI(title="Zeaz Meta OS API", version="1.0.0", lifespan=lifespan)

origins = os.getenv("ALLOWED_ORIGINS", "")
allowed_origins = origins.split(",") if origins else []

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins or ["http://localhost"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runtime.router, prefix="/api/runtime", tags=["runtime"])
app.include_router(agents.router, prefix="/api/runtime/agents", tags=["agents"])
app.include_router(healing.router, prefix="/api/runtime/healing", tags=["healing"])
app.include_router(observability.router, prefix="/api/runtime/observability", tags=["observability"])
app.include_router(auth.router, prefix="/api/runtime/auth", tags=["auth"])
app.include_router(llm.router, prefix="/api/runtime/llm", tags=["llm"])
app.include_router(scheduler.router, prefix="/api/runtime/scheduler", tags=["scheduler"])
app.include_router(swarm.router, prefix="/api/runtime/swarm", tags=["swarm"])
app.include_router(cloudflare_control.router, prefix="/api/runtime/cloudflare", tags=["cloudflare"])
app.include_router(zquest.router, prefix="/api/runtime/zquest", tags=["zquest"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in list(self.active_connections):
            try:
                await connection.send_text(message)
            except Exception as e:
                logger.error("Error broadcasting to connection", exc_info=True)
                self.disconnect(connection)

manager = ConnectionManager()

@app.websocket("/ws/events")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming WebSocket commands if needed
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# Background task to stream Docker stats
async def stream_docker_stats():
    client = docker.from_env()
    while True:
        try:
            stats = []
            for container in client.containers.list():
                stats.append({
                    "id": container.short_id,
                    "name": container.name,
                    "status": container.status
                })
            await manager.broadcast(json.dumps({"type": "docker_stats", "data": stats}))
        except Exception as e:
            logger.error("Error streaming stats", exc_info=True)
        await asyncio.sleep(2)
