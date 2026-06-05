from fastapi import FastAPI, Response
from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
import os
from src.utils.logger import get_logger
from src.utils.metrics import last_run_timestamp, pending_tasks_count
from src.utils.config import Config
from src.core.sheets import GoogleSheetsAPI

from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware

logger = get_logger(__name__)
app = FastAPI(title="zsticker API")

ALLOWED_HOSTS = ["192.168.74.182", "0.0.0.0", "127.0.0.1", "zsticker.zeaz.dev", "localhost"]

app.add_middleware(
    TrustedHostMiddleware, allowed_hosts=ALLOWED_HOSTS
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://" + h for h in ALLOWED_HOSTS] + ["https://" + h for h in ALLOWED_HOSTS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health_check():
    config = Config()
    try:
        sheets_api = GoogleSheetsAPI(config)
        pending = len(sheets_api.get_pending_rows())
        pending_tasks_count.set(pending)
        
        # Estimate errors in the last 24h by reading error.log
        error_count = 0
        if os.path.exists("logs/error.log"):
            with open("logs/error.log", "r", encoding="utf-8") as f:
                error_count = sum(1 for _ in f)
                
        status = "healthy"
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        status = "unhealthy"
        pending = 0
        error_count = -1

    return {
        "status": status,
        "last_run": last_run_timestamp._value.get(),
        "pending_count": pending,
        "errors_24h": error_count
    }

@app.get("/metrics")
def metrics():
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)
