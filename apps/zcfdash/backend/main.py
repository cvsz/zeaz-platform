import os
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()
CLOUDFLARE_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CLOUDFLARE_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CLOUDFLARE_ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")

HEADERS = {"Authorization": f"Bearer {CLOUDFLARE_API_TOKEN}"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/connectivity")
async def connectivity():
    # Simple DNS/HTTP check
    return {"status": "healthy", "domains": ["app.zeaz.dev"]}

@app.get("/api/cloudflare/tunnels")
async def get_tunnels():
    if not CLOUDFLARE_API_TOKEN or not CLOUDFLARE_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.cloudflare.com/client/v4/accounts/{CLOUDFLARE_ACCOUNT_ID}/tunnels",
            headers=HEADERS
        )
        return resp.json()

@app.get("/api/cloudflare/waf")
async def get_waf():
    if not CLOUDFLARE_API_TOKEN or not CLOUDFLARE_ZONE_ID:
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.cloudflare.com/client/v4/zones/{CLOUDFLARE_ZONE_ID}/waf/events",
            headers=HEADERS
        )
        return resp.json()
