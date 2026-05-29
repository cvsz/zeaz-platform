from fastapi import APIRouter
import docker

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
            "state": c.attrs["State"]
        }
        for c in containers
    ]

@router.post("/services/{container_id}/restart")
def restart_service(container_id: str):
    container = client.containers.get(container_id)
    container.restart()
    return {"status": "restarted", "container": container_id}

@router.get("/containers")
def get_containers():
    return get_services()
