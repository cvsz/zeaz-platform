import os
import httpx
from fastapi import FastAPI, HTTPException

app = FastAPI()
CF_API_TOKEN = os.getenv("CLOUDFLARE_API_TOKEN")
CF_ACCOUNT_ID = os.getenv("CLOUDFLARE_ACCOUNT_ID")
CF_ZONE_ID = os.getenv("CLOUDFLARE_ZONE_ID")

HEADERS = {"Authorization": f"Bearer {CF_API_TOKEN}"}

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.get("/api/connectivity")
async def connectivity():
    # Simple DNS/HTTP check
    return {"status": "healthy", "domains": ["app.zeaz.dev"]}

@app.get("/api/cloudflare/tunnels")
async def get_tunnels():
    if not CF_API_TOKEN or not CF_ACCOUNT_ID:
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.cloudflare.com/client/v4/accounts/{CF_ACCOUNT_ID}/tunnels",
            headers=HEADERS
        )
        return resp.json()

@app.get("/api/cloudflare/waf")
async def get_waf():
    if not CF_API_TOKEN or not CF_ZONE_ID:
        raise HTTPException(status_code=500, detail="Cloudflare credentials missing")
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://api.cloudflare.com/client/v4/zones/{CF_ZONE_ID}/waf/events",
            headers=HEADERS
        )
        return resp.json()
