# apps/ztrader/backend/src/ztrader/core/config.py

from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional, Tuple

class Settings(BaseSettings):
    # Base Config
    ENVIRONMENT: str = "production"
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/ztrader"
    REDIS_URL: str = "redis://localhost:6379/0"

    # Security (No default values to force configuration via environment)
    ENCRYPTION_KEY: str
    JWT_SECRET: str
    ADMIN_API_TOKEN: Optional[str] = None

    # Trading Defaults
    EXECUTION_MODE: str = "paper" # paper or live
    LIVE_TRADING_ENABLED: bool = False
    GLOBAL_KILL_SWITCH: bool = False

    # Risk Limits
    RISK_MAX_ORDER_NOTIONAL: float = 100.0
    RISK_ALLOWED_SYMBOLS: Tuple[str, ...] = ("BTC/USDT", "ETH/USDT")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
