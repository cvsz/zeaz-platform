from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def get_agents():
    # Placeholder for LangGraph agent integrations
    return [{"id": "agent-1", "status": "idle", "tasks_completed": 42}]

@router.get("/{agent_id}/history")
def get_agent_history(agent_id: str):
    return {"history": []}
