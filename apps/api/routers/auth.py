from fastapi import APIRouter

router = APIRouter()

@router.get("/sessions")
def get_sessions():
    # Placeholder for Authentik integration
    return [{"user": "admin", "active_since": "2026-05-29T00:00:00Z"}]
