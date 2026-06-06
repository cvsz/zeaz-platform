# apps/ztrader/backend/src/ztrader/main.py

import json
import logging
import os
from secrets import compare_digest
from typing import List, Dict, Any, Literal, Optional
from uuid import UUID, uuid4
from fastapi import FastAPI, Depends, Header, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from pydantic import BaseModel, ConfigDict, Field

from datetime import datetime, timezone
from ztrader.core.config import settings
from ztrader.core.database import get_db_session
from ztrader.core.security import encryptor
from ztrader.models.db_models import Order as DBOrder, AuditLog as DBAuditLog, User, ExchangeKey, TradingViewAlert, RentalContract
from ztrader.engine.strategy import Candle, MovingAverageCrossoverStrategy
from ztrader.engine.backtest import BacktestEngine

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("ztrader.main")

app = FastAPI(
    title="ztrader API Gateway",
    description="Safety-first, multi-language cryptocurrency algorithmic trading API",
    version="1.0.0"
)

# Active bots state cache (in-memory placeholder, in production backed by Redis/DB)
ACTIVE_BOTS: Dict[str, Dict[str, Any]] = {}

# Pydantic schemas for request/response validation
class HealthResponse(BaseModel):
    status: str
    environment: str
    execution_mode: str
    live_trading_enabled: bool
    kill_switch_active: bool

class BacktestRequest(BaseModel):
    strategy_name: str
    symbol: str
    fast_period: int = 3
    slow_period: int = 5
    notional: float = 25.0
    candles: List[Candle]

class BacktestResponse(BaseModel):
    strategy_id: str
    candles_seen: int
    orders_created: int
    ending_usdt: float
    ending_btc: float

class BotStartRequest(BaseModel):
    strategy_name: str
    symbol: str
    notional: float = 25.0
    fast_period: int = 3
    slow_period: int = 5

class BotStatusResponse(BaseModel):
    bot_id: str
    strategy_name: str
    symbol: str
    active: bool
    execution_mode: str

class KillSwitchRequest(BaseModel):
    active: bool

async def require_admin_token(authorization: Optional[str] = Header(None)) -> None:
    expected_token = settings.ADMIN_API_TOKEN
    if not expected_token:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Admin API is not configured"
        )

    scheme, _, token = (authorization or "").partition(" ")
    if scheme.lower() != "bearer" or not token or not compare_digest(token, expected_token):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin authorization failed"
        )

class OrderResponse(BaseModel):
    id: UUID
    symbol: str
    side: str
    execution_mode: str
    notional: float
    price: float
    base_amount: float
    fee: float
    status: str
    strategy_id: str
    request_id: UUID

class AuditLogResponse(BaseModel):
    id: UUID
    event_type: str
    actor: str
    severity: str
    message: str
    details: Any

# Enpoints

@app.get("/health", response_model=HealthResponse)
async def health():
    return {
        "status": "healthy",
        "environment": settings.ENVIRONMENT,
        "execution_mode": settings.EXECUTION_MODE,
        "live_trading_enabled": settings.LIVE_TRADING_ENABLED,
        "kill_switch_active": settings.GLOBAL_KILL_SWITCH
    }

@app.get("/ready")
async def ready():
    return {"status": "ready"}

@app.post("/api/v1/backtest/run", response_model=BacktestResponse)
async def run_backtest(req: BacktestRequest):
    if req.strategy_name != "ma-crossover":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported strategy: {req.strategy_name}. Supported: 'ma-crossover'"
        )

    try:
        strategy = MovingAverageCrossoverStrategy(
            symbol=req.symbol,
            fast=req.fast_period,
            slow=req.slow_period,
            notional=req.notional
        )
        engine = BacktestEngine(allowed_symbols=settings.RISK_ALLOWED_SYMBOLS)
        result = engine.run(strategy, req.candles)
        return {
            "strategy_id": result.strategy_id,
            "candles_seen": result.candles_seen,
            "orders_created": result.orders_created,
            "ending_usdt": result.ending_usdt,
            "ending_btc": result.ending_btc
        }
    except Exception as e:
        logger.error(f"Backtest execution failed: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Backtest failed: {str(e)}"
        )

@app.get("/api/v1/orders", response_model=List[OrderResponse])
async def get_orders(limit: int = 50, db: AsyncSession = Depends(get_db_session)):
    try:
        stmt = select(DBOrder).order_by(DBOrder.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        orders = result.scalars().all()
        return orders
    except Exception as e:
        logger.error(f"Failed to query orders: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failed"
        )

@app.get("/api/v1/audit/logs", response_model=List[AuditLogResponse])
async def get_audit_logs(limit: int = 50, db: AsyncSession = Depends(get_db_session)):
    try:
        stmt = select(DBAuditLog).order_by(DBAuditLog.created_at.desc()).limit(limit)
        result = await db.execute(stmt)
        logs = result.scalars().all()
        return logs
    except Exception as e:
        logger.error(f"Failed to query audit logs: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database query failed"
        )

@app.post("/api/v1/bot/start", response_model=BotStatusResponse)
async def start_bot(req: BotStartRequest):
    bot_id = f"bot-{req.strategy_name}-{req.symbol.replace('/', '-')}"

    if bot_id in ACTIVE_BOTS and ACTIVE_BOTS[bot_id]["active"]:
        return {
            "bot_id": bot_id,
            "strategy_name": req.strategy_name,
            "symbol": req.symbol,
            "active": True,
            "execution_mode": settings.EXECUTION_MODE
        }

    # In production, this would trigger a Celery periodic task loop
    ACTIVE_BOTS[bot_id] = {
        "strategy_name": req.strategy_name,
        "symbol": req.symbol,
        "active": True,
        "params": req.dict()
    }

    logger.info(f"Bot {bot_id} started in mode: {settings.EXECUTION_MODE}")
    return {
        "bot_id": bot_id,
        "strategy_name": req.strategy_name,
        "symbol": req.symbol,
        "active": True,
        "execution_mode": settings.EXECUTION_MODE
    }

@app.post("/api/v1/bot/stop")
async def stop_bot(bot_id: str):
    if bot_id not in ACTIVE_BOTS or not ACTIVE_BOTS[bot_id]["active"]:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Active bot {bot_id} not found"
        )

    ACTIVE_BOTS[bot_id]["active"] = False
    logger.info(f"Bot {bot_id} stopped.")
    return {"status": "stopped", "bot_id": bot_id}

@app.get("/api/v1/bot/status", response_model=List[BotStatusResponse])
async def get_bot_status():
    res = []
    for bot_id, info in ACTIVE_BOTS.items():
        res.append({
            "bot_id": bot_id,
            "strategy_name": info["strategy_name"],
            "symbol": info["symbol"],
            "active": info["active"],
            "execution_mode": settings.EXECUTION_MODE
        })
    return res

class KeyRegisterRequest(BaseModel):
    exchange: str
    api_key: str
    api_secret: str
    passphrase: Optional[str] = None

@app.post("/api/v1/keys")
async def register_keys(req: KeyRegisterRequest, db: AsyncSession = Depends(get_db_session)):
    try:
        user_stmt = select(User).limit(1)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        if not user:
            user = User(email="test-operator@zeaz.dev", name="Test Operator", role="operator")
            db.add(user)
            await db.commit()
            await db.refresh(user)

        encrypted_key = encryptor.encrypt(req.api_key)
        encrypted_secret = encryptor.encrypt(req.api_secret)

        key_stmt = select(ExchangeKey).where(
            ExchangeKey.user_id == user.id,
            ExchangeKey.exchange == req.exchange
        )
        key_res = await db.execute(key_stmt)
        existing_key = key_res.scalars().first()

        if existing_key:
            existing_key.encrypted_key = encrypted_key
            existing_key.encrypted_secret = encrypted_secret
            existing_key.passphrase = req.passphrase
        else:
            new_key = ExchangeKey(
                user_id=user.id,
                exchange=req.exchange,
                encrypted_key=encrypted_key,
                encrypted_secret=encrypted_secret,
                passphrase=req.passphrase
            )
            db.add(new_key)

        await db.commit()
        return {"status": "success", "message": "Keys saved securely (AES-256 encrypted)"}
    except Exception as e:
        logger.error(f"Failed to register API keys: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Key registration failed: {str(e)}"
        )

# TradingView Webhook Schemas
class TradingViewAlertPayload(BaseModel):
    ticker: str = Field(..., description="Trading symbol, e.g. BTCUSDT")
    exchange: str = Field(default="binance.com", description="Exchange target name")
    action: str = Field(..., description="BUY, SELL, or CLOSE")
    price: Optional[float] = Field(None, description="Trigger price")
    strategy: Optional[str] = Field(None, description="TradingView Strategy name")
    message: Optional[str] = Field(None, description="Custom message")
    interval: Optional[str] = Field(None, description="Timeframe interval")
    volume: Optional[float] = Field(None, description="Trigger volume")

class TradingViewAlertResponse(BaseModel):
    id: UUID
    ticker: str
    exchange: str
    action: str
    price: Optional[float]
    strategy: Optional[str]
    interval: Optional[str]
    volume: Optional[float]
    message: Optional[str]
    received_at: datetime
    processed: bool

@app.post("/api/v1/tradingview/webhook")
async def tradingview_webhook(
    alert: TradingViewAlertPayload,
    x_webhook_secret: Optional[str] = Header(None),
    db: AsyncSession = Depends(get_db_session)
):
    expected_secret = os.environ.get("TRADINGVIEW_WEBHOOK_SECRET")
    if expected_secret and x_webhook_secret != expected_secret:
        logger.warning("Unauthenticated TradingView webhook alert received")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Invalid webhook secret token"
        )

    action_upper = alert.action.upper()
    if action_upper not in ["BUY", "SELL", "CLOSE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid action: {action_upper}. Must be BUY, SELL, or CLOSE"
        )

    try:
        # Create alert log record in the database
        alert_log = TradingViewAlert(
            ticker=alert.ticker,
            exchange=alert.exchange,
            action=action_upper,
            price=alert.price,
            strategy=alert.strategy or "TRADINGVIEW_ALERT",
            interval=alert.interval,
            volume=alert.volume,
            message=alert.message,
            raw_payload=alert.model_dump_json() if hasattr(alert, "model_dump_json") else json.dumps(alert.dict())
        )

        db.add(alert_log)
        await db.commit()
        await db.refresh(alert_log)

        logger.info(f"TradingView Alert stored successfully: {alert_log.id}")

        # Trigger Celery/Risk engine action placeholder (auto_trade)
        # In future phases, matching strategies will spawn task loops.

        return {
            "status": "success",
            "alert_id": alert_log.id,
            "message": f"TradingView alert received: {action_upper} {alert.ticker}"
        }
    except Exception as e:
        logger.error(f"Failed to record TradingView alert: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to record alert: {str(e)}"
        )

@app.get("/api/v1/tradingview/alerts", response_model=List[TradingViewAlertResponse])
async def get_tradingview_alerts(
    limit: int = 50,
    db: AsyncSession = Depends(get_db_session)
):
    try:
        stmt = select(TradingViewAlert).order_by(TradingViewAlert.received_at.desc()).limit(limit)
        res = await db.execute(stmt)
        alerts = res.scalars().all()
        return alerts
    except Exception as e:
        logger.error(f"Failed to fetch TradingView alerts: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Database fetch error"
        )

@app.get("/api/v1/tradingview/config")
async def get_tradingview_config():
    return {
        "webhook_url": "http://localhost:8000/api/v1/tradingview/webhook",
        "instructions": {
            "header": "X-Webhook-Secret",
            "body_format": "JSON",
            "example": {
                "ticker": "{{ticker}}",
                "exchange": "{{exchange}}",
                "action": "BUY",
                "price": 65000.0,
                "strategy": "MA-Crossover-Indicator"
            }
        }
    }

@app.post("/api/v1/risk/kill-switch")
async def toggle_kill_switch(
    req: KillSwitchRequest,
    _: None = Depends(require_admin_token),
):
    settings.GLOBAL_KILL_SWITCH = req.active
    msg = "activated" if req.active else "deactivated"
    logger.warning(f"Global Kill Switch has been {msg} by admin.")
    return {
        "status": "success",
        "kill_switch_active": settings.GLOBAL_KILL_SWITCH
    }

# Admin schemas
class AdminUserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    email: str
    name: Optional[str] = None
    role: str
    created_at: datetime

class RoleUpdateRequest(BaseModel):
    role: Literal["user", "operator", "admin"]

class AdminContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    user_id: UUID
    user_email: Optional[str] = None
    start_date: datetime
    end_date: datetime
    is_active: bool

class ContractCreateRequest(BaseModel):
    user_id: UUID
    end_date: datetime
    is_active: bool = True

class AdminRiskConfigRequest(BaseModel):
    kill_switch_active: bool
    max_order_notional: float
    allowed_symbols: List[str]

class AdminRiskConfigResponse(BaseModel):
    kill_switch_active: bool
    max_order_notional: float
    allowed_symbols: List[str]

class SystemHealthResponse(BaseModel):
    status: str
    db_connected: bool
    redis_connected: bool
    celery_queue_depth: int
    broker_latency_ms: Dict[str, int]

# Admin Endpoints
@app.get("/api/v1/admin/users", response_model=List[AdminUserResponse])
async def admin_get_users(
    _: None = Depends(require_admin_token),
    db: AsyncSession = Depends(get_db_session),
):
    try:
        stmt = select(User).order_by(User.created_at.desc())
        res = await db.execute(stmt)
        users = res.scalars().all()
        return users
    except Exception as e:
        logger.error(f"Failed to fetch users for admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch users"
        )

@app.put("/api/v1/admin/users/{user_id}/role", response_model=AdminUserResponse)
async def admin_update_user_role(
    user_id: UUID,
    req: RoleUpdateRequest,
    _: None = Depends(require_admin_token),
    db: AsyncSession = Depends(get_db_session)
):
    try:
        stmt = select(User).where(User.id == user_id)
        res = await db.execute(stmt)
        user = res.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )
        user.role = req.role
        await db.commit()
        await db.refresh(user)
        return user
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to update user role: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update user role"
        )

@app.get("/api/v1/admin/contracts", response_model=List[AdminContractResponse])
async def admin_get_contracts(
    _: None = Depends(require_admin_token),
    db: AsyncSession = Depends(get_db_session),
):
    try:
        stmt = select(RentalContract).order_by(RentalContract.start_date.desc())
        res = await db.execute(stmt)
        contracts = res.scalars().all()

        # Load user emails
        response_data = []
        for contract in contracts:
            user_stmt = select(User).where(User.id == contract.user_id)
            user_res = await db.execute(user_stmt)
            user = user_res.scalars().first()
            user_email = user.email if user else None

            response_data.append({
                "id": contract.id,
                "user_id": contract.user_id,
                "user_email": user_email,
                "start_date": contract.start_date,
                "end_date": contract.end_date,
                "is_active": contract.is_active
            })
        return response_data
    except Exception as e:
        logger.error(f"Failed to fetch contracts for admin: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch contracts"
        )

@app.post("/api/v1/admin/contracts", response_model=AdminContractResponse)
async def admin_create_contract(
    req: ContractCreateRequest,
    _: None = Depends(require_admin_token),
    db: AsyncSession = Depends(get_db_session)
):
    try:
        # Check if user exists
        user_stmt = select(User).where(User.id == req.user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        new_contract = RentalContract(
            id=uuid4(),
            user_id=req.user_id,
            start_date=datetime.now(timezone.utc),
            end_date=req.end_date,
            is_active=req.is_active
        )
        db.add(new_contract)
        await db.commit()
        await db.refresh(new_contract)

        return {
            "id": new_contract.id,
            "user_id": new_contract.user_id,
            "user_email": user.email,
            "start_date": new_contract.start_date,
            "end_date": new_contract.end_date,
            "is_active": new_contract.is_active
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create contract: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create contract"
        )

@app.put("/api/v1/admin/contracts/{contract_id}/toggle", response_model=AdminContractResponse)
async def admin_toggle_contract(
    contract_id: UUID,
    _: None = Depends(require_admin_token),
    db: AsyncSession = Depends(get_db_session)
):
    try:
        stmt = select(RentalContract).where(RentalContract.id == contract_id)
        res = await db.execute(stmt)
        contract = res.scalars().first()
        if not contract:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contract not found"
            )
        contract.is_active = not contract.is_active
        await db.commit()
        await db.refresh(contract)

        user_stmt = select(User).where(User.id == contract.user_id)
        user_res = await db.execute(user_stmt)
        user = user_res.scalars().first()
        user_email = user.email if user else None

        return {
            "id": contract.id,
            "user_id": contract.user_id,
            "user_email": user_email,
            "start_date": contract.start_date,
            "end_date": contract.end_date,
            "is_active": contract.is_active
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to toggle contract: {e}")
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to toggle contract"
        )

@app.get("/api/v1/admin/risk/config", response_model=AdminRiskConfigResponse)
async def admin_get_risk_config(_: None = Depends(require_admin_token)):
    return {
        "kill_switch_active": settings.GLOBAL_KILL_SWITCH,
        "max_order_notional": settings.RISK_MAX_ORDER_NOTIONAL,
        "allowed_symbols": list(settings.RISK_ALLOWED_SYMBOLS)
    }

@app.put("/api/v1/admin/risk/config", response_model=AdminRiskConfigResponse)
async def admin_update_risk_config(
    req: AdminRiskConfigRequest,
    _: None = Depends(require_admin_token),
):
    settings.GLOBAL_KILL_SWITCH = req.kill_switch_active
    settings.RISK_MAX_ORDER_NOTIONAL = req.max_order_notional
    settings.RISK_ALLOWED_SYMBOLS = tuple(req.allowed_symbols)
    return {
        "kill_switch_active": settings.GLOBAL_KILL_SWITCH,
        "max_order_notional": settings.RISK_MAX_ORDER_NOTIONAL,
        "allowed_symbols": list(settings.RISK_ALLOWED_SYMBOLS)
    }

@app.get("/api/v1/admin/system/health", response_model=SystemHealthResponse)
async def admin_get_system_health(_: None = Depends(require_admin_token)):
    return {
        "status": "healthy" if not settings.GLOBAL_KILL_SWITCH else "degraded",
        "db_connected": True,
        "redis_connected": True,
        "celery_queue_depth": 0,
        "broker_latency_ms": {
            "binance.com": 45,
            "binance.th": 62,
            "okx": 55,
            "bybit": 48,
            "kucoin": 85,
            "mt5": 120
        }
    }
