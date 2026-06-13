from fastapi import APIRouter, Depends, Path
import docker
from .auth import require_auth

router = APIRouter()
client = docker.from_env()

@router.get("/services")
def get_services():
    containers = client.containers.list(all=True)
    return [
        {
            "id": c.short_id,
            "name": c.name,
            "status": c.status,
            "image": c.image.tags[0] if c.image.tags else "unknown",
            "state": c.attrs.get("State", {})
        }
        for c in containers
    ]

@router.post("/services/{container_id}/restart", dependencies=[Depends(require_auth)])
def restart_service(container_id: str = Path(..., pattern=r"^[a-zA-Z0-9_.-]+$")):
    container = client.containers.get(container_id)
    container.restart()
    return {"status": "restarted", "container": container_id}

@router.get("/containers")
def get_containers():
    return get_services()
