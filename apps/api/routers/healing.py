from fastapi import APIRouter
import json

router = APIRouter()

@router.get("/")
def get_healing_events():
    return [{"event_id": "h-123", "service": "redis", "action": "restarted", "status": "resolved"}]

@router.post("/trigger")
def trigger_healing(service_name: str):
    return {"status": "triggered", "service": service_name}
