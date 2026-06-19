# admin/panel/main.py
# Minimal Admin Control Panel (FastAPI)

from fastapi import FastAPI, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import aioredis

app = FastAPI(title="zWallet Admin Panel")
security = HTTPBearer()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")
_admin_token = os.getenv("ADMIN_TOKEN")
if not _admin_token:
    raise RuntimeError("ADMIN_TOKEN environment variable is required and must not be empty")
ADMIN_TOKEN: str = _admin_token

# Helper to get Redis client
async def get_redis():
    return await aioredis.from_url(REDIS_URL)

def verify_admin(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.credentials != ADMIN_TOKEN:
        raise HTTPException(status_code=403, detail="Forbidden")


@app.get("/admin/health")
def health(_: None = Depends(verify_admin)):
    return {"status": "ok"}


@app.get("/admin/security/metrics")
async def security_metrics(_: None = Depends(verify_admin)):
    # Integrate Redis metrics fetch
    r = await get_redis()
    blocked = await r.get("metrics:blocked") or 0
    return {
        "blocked_requests": int(blocked),
        "rate_limited": 0,
        "shadow_banned": 0
    }


@app.post("/admin/security/unblock")
async def unblock(identity: str, _: None = Depends(verify_admin)):
    # Integrate Redis delete block key
    r = await get_redis()
    await r.delete(f"block:{identity}")
    return {"unblocked": identity}
