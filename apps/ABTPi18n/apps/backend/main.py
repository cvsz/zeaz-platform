"""FastAPI entrypoint for Auto Bot Trader Pro i18n."""

import os
from datetime import datetime
from logging import getLogger
from typing import Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from prometheus_fastapi_instrumentator import Instrumentator
from pydantic import BaseModel
from sqlalchemy import select, func

from src.api.audit_endpoints import router as audit_router
from src.api.auth_endpoints import router as auth_router
from src.api.backtest_endpoints import router as backtest_router
from src.api.bot_endpoints import router as bot_router
from src.api.ml_endpoints import router as ml_router
from src.api.payment_endpoints import router as payment_router
from src.api.plugin_endpoints import router as plugin_router
from src.api.portfolio_endpoints import router as portfolio_router
from src.api.preferences_endpoints import router as preferences_router
from src.api.rental_endpoints import router as rental_router
from src.api.secret_rotation_endpoints import router as secrets_router
from src.api.telegram_endpoints import router as telegram_router
from src.api.tradingview_endpoints import router as tradingview_router
from src.models import TradeLog, BotRun
from src.security.crypto_service import encrypt_data
from src.services.audit_middleware import AuditMiddleware
from src.trading.strategy_interface import StrategyRegistry
from src.utils.database import engine, get_db

DATABASE_URL = os.getenv("DATABASE_URL")
ENCRYPTION_KEY = os.getenv("ENCRYPTION_KEY")

logger = getLogger(__name__)

app = FastAPI(title="ZeaZDev-ABTPro-i18n Backend", version="1.0.1")

origins = {
    "http://localhost:3000",
    os.getenv("FRONTEND_URL", "http://localhost:3000"),
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=[o.rstrip("/") for o in origins],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

if os.getenv("ENABLE_AUDIT_LOGGING", "true").lower() == "true":
    app.add_middleware(AuditMiddleware)

Instrumentator().instrument(app).expose(
    app,
    endpoint="/metrics",
    include_in_schema=False,
)


class ExchangeKeyInput(BaseModel):
    exchange: str
    api_key: str
    api_secret: str


class LoginInput(BaseModel):
    email: str
    google_token: Optional[str] = None


@app.on_event("startup")
async def startup():
    pass


@app.on_event("shutdown")
async def shutdown():
    await engine.dispose()


@app.get("/health", tags=["Health & Monitoring"])
async def health():
    try:
        async with get_db() as db:
            await db.execute(select(func.now()))
        return {"status": "ok"}
    except Exception:
        return {"status": "degraded", "component": "database", "code": "DB_CONNECT_FAILED"}


@app.post("/auth/login")
async def login(data: LoginInput):
    from src.models import User
    async with get_db() as db:
        result = await db.execute(select(User).where(User.email == data.email))
        user = result.scalar_one_or_none()
        if not user:
            user = User(email=data.email)
            db.add(user)
            await db.flush()
        return {"user_id": user.id, "email": user.email, "status": "LOGIN_OK"}


@app.post("/exchange/keys")
async def save_exchange_keys(payload: ExchangeKeyInput):
    from src.models import ExchangeKey
    if payload.exchange not in ["binance", "bybit"]:
        raise HTTPException(status_code=400, detail="Unsupported exchange")
    enc_key, iv_key = encrypt_data(payload.api_key)
    enc_secret, iv_secret = encrypt_data(payload.api_secret)
    async with get_db() as db:
        record = ExchangeKey(
            exchange=payload.exchange,
            encrypted_key=enc_key,
            iv_key=iv_key,
            encrypted_secret=enc_secret,
            iv_secret=iv_secret,
        )
        db.add(record)
        await db.flush()
        return {"status": "STORED_SECURE", "id": record.id}


@app.get("/strategies")
async def list_strategies():
    return {"strategies": StrategyRegistry.list_names()}


@app.get("/dashboard/pnl")
async def dashboard_pnl():
    async with get_db() as db:
        result = await db.execute(select(TradeLog))
        trades = result.scalars().all()
        pnl = sum(t.pnl for t in trades)
        count_result = await db.execute(
            select(func.count()).where(BotRun.status == "RUNNING")
        )
        open_bots = count_result.scalar()
        return {
            "total_pnl": round(pnl, 4),
            "currency": "USDT",
            "open_bots": open_bots,
            "last_update": datetime.utcnow().isoformat(),
        }


app.include_router(bot_router, prefix="/bot", tags=["Bot Control"])
app.include_router(auth_router, prefix="/auth", tags=["Authentication"])
app.include_router(telegram_router, prefix="/telegram", tags=["Telegram"])
app.include_router(preferences_router, prefix="/user", tags=["User Preferences"])
app.include_router(payment_router, prefix="/payment", tags=["Payment & Wallet"])
app.include_router(rental_router, prefix="/rental", tags=["Rental Contracts"])
app.include_router(plugin_router, prefix="/plugins", tags=["Plugin System"])
app.include_router(portfolio_router, prefix="/portfolio", tags=["Portfolio Management"])
app.include_router(backtest_router, prefix="/backtest", tags=["Backtesting & Paper Trading"])
app.include_router(audit_router, prefix="/audit", tags=["Audit Trail"])
app.include_router(secrets_router, prefix="/secrets", tags=["Secret Rotation"])
app.include_router(ml_router, tags=["ML & Intelligence"])
app.include_router(tradingview_router, prefix="/tradingview", tags=["TradingView"])
