import asyncio
import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
<<<<<<< HEAD
from routers import runtime, agents, healing, observability, auth, llm, scheduler, swarm
=======
from routers import runtime, agents, healing, observability, auth, llm, scheduler
>>>>>>> f2f2392 (Codex/final cleanup docs env backups (#122))
import docker

app = FastAPI(title="Zeaz Meta OS API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(runtime.router, prefix="/api/runtime")
app.include_router(agents.router, prefix="/api/runtime/agents")
app.include_router(healing.router, prefix="/api/runtime/healing")
app.include_router(observability.router, prefix="/api/runtime/observability")
app.include_router(auth.router, prefix="/api/runtime/auth")
app.include_router(llm.router, prefix="/api/runtime/llm")
app.include_router(scheduler.router, prefix="/api/runtime/scheduler")
<<<<<<< HEAD
app.include_router(swarm.router, prefix="/api/runtime/swarm")
=======
>>>>>>> f2f2392 (Codex/final cleanup docs env backups (#122))

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

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
            print(f"Error streaming stats: {e}")
        await asyncio.sleep(2)

@app.on_event("startup")
async def startup_event():
    asyncio.create_task(stream_docker_stats())
