from fastapi import APIRouter, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

router = APIRouter()
security = HTTPBearer()

def require_auth(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    if token != os.getenv("API_SECRET_TOKEN", "dev-token"):
        raise HTTPException(status_code=401, detail="Invalid token")
    return {"user": "authenticated_user"}

@router.get("/sessions")
def get_sessions(user: dict = Depends(require_auth)):
    # Placeholder for Authentik integration
    return [{"user": user["user"], "active_since": "2026-05-29T00:00:00Z"}]
