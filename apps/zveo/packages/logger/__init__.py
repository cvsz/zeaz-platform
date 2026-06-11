"""Structured JSON logging for zVEO services."""

from __future__ import annotations

import json
import logging
import os
import sys
from datetime import UTC, datetime
from typing import Any


class JsonFormatter(logging.Formatter):
    """Emit log records as single-line JSON with trace-friendly fields."""

    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(UTC).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "service": os.getenv("SERVICE_NAME", "zveo"),
        }
        for key in ("job_id", "workflow_id", "scene_id", "asset_id", "attempt", "queue"):
            value = getattr(record, key, None)
            if value is not None:
                payload[key] = value
        if record.exc_info:
            payload["exception"] = self.formatException(record.exc_info)
        return json.dumps(payload, separators=(",", ":"), default=str)


def configure_logging(level: str | None = None) -> None:
    """Configure root logging for containers and tests."""

    root = logging.getLogger()
    root.handlers.clear()
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    root.addHandler(handler)
    root.setLevel((level or os.getenv("LOG_LEVEL", "INFO")).upper())


def get_logger(name: str) -> logging.Logger:
    """Return a named logger with JSON formatting installed once."""

    if not logging.getLogger().handlers:
        configure_logging()
    return logging.getLogger(name)
