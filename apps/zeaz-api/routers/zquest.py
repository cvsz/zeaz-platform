from __future__ import annotations

import json
import os
import re
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from fastapi import APIRouter
from pydantic import BaseModel, Field


router = APIRouter()

BASE_DIR = Path(__file__).resolve().parents[1]
DB_PATH = Path(os.getenv("ZQUEST_DATABASE_PATH") or (BASE_DIR / "data" / "zquest.sqlite3"))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


class ZQuestDatabasePayload(BaseModel):
    version: int = 1
    activeUserId: str = ""
    users: list[dict[str, Any]] = Field(default_factory=list)
    updatedAt: str | None = None


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def slugify(value: str) -> str:
    slug = re.sub(r"[^a-z0-9]+", "-", value.strip().lower()).strip("-")
    return slug or "player"


def default_user(username: str = "Guest") -> dict[str, Any]:
    stamp = now_iso()
    safe_name = " ".join(username.split()).strip()[:24] or "Player"
    return {
        "id": slugify(safe_name),
        "username": safe_name,
        "points": 0,
        "bestScore": 0,
        "lastScore": 0,
        "totalScore": 0,
        "runs": 0,
        "wins": 0,
        "vip": False,
        "createdAt": stamp,
        "lastLoginAt": stamp,
        "updatedAt": stamp,
        "runSavedScore": 0,
    }


def default_database() -> dict[str, Any]:
    guest = default_user("Guest")
    stamp = guest["updatedAt"]
    return {
        "version": 1,
        "activeUserId": guest["id"],
        "users": [guest],
        "updatedAt": stamp,
    }


def normalize_user(user: Any) -> dict[str, Any] | None:
    if not isinstance(user, dict):
        return None

    username = " ".join(str(user.get("username", "Player")).split()).strip()[:24] or "Player"
    created_at = user.get("createdAt") if isinstance(user.get("createdAt"), str) else now_iso()
    last_login_at = user.get("lastLoginAt") if isinstance(user.get("lastLoginAt"), str) else created_at
    updated_at = user.get("updatedAt") if isinstance(user.get("updatedAt"), str) else last_login_at

    def as_int(value: Any) -> int:
        try:
            return max(0, int(float(value)))
        except Exception:
            return 0

    return {
        "id": str(user.get("id") or slugify(username)).strip() or slugify(username),
        "username": username,
        "points": as_int(user.get("points")),
        "bestScore": as_int(user.get("bestScore")),
        "lastScore": as_int(user.get("lastScore")),
        "totalScore": as_int(user.get("totalScore")),
        "runs": as_int(user.get("runs")),
        "wins": as_int(user.get("wins")),
        "vip": bool(user.get("vip")),
        "createdAt": created_at,
        "lastLoginAt": last_login_at,
        "updatedAt": updated_at,
        "runSavedScore": as_int(user.get("runSavedScore")),
    }


def normalize_database(raw: Any) -> dict[str, Any]:
    if not isinstance(raw, dict):
        return default_database()

    users = []
    seen: set[str] = set()
    for user in raw.get("users", []):
        normalized = normalize_user(user)
        if not normalized:
            continue
        if normalized["id"] in seen:
            continue
        seen.add(normalized["id"])
        users.append(normalized)

    if not users:
        return default_database()

    active_id = str(raw.get("activeUserId") or "").strip()
    active = next((user for user in users if user["id"] == active_id), users[0])
    updated_at = raw.get("updatedAt") if isinstance(raw.get("updatedAt"), str) else now_iso()
    version = raw.get("version")

    return {
        "version": int(version) if isinstance(version, int) and version > 0 else 1,
        "activeUserId": active["id"],
        "users": users,
        "updatedAt": updated_at,
    }


def connect() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute(
        """
        CREATE TABLE IF NOT EXISTS zquest_state (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            snapshot TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """
    )
    return conn


def load_state() -> tuple[dict[str, Any], bool]:
    with connect() as conn:
        row = conn.execute("SELECT snapshot FROM zquest_state WHERE id = 1").fetchone()
    if not row:
        return default_database(), False
    try:
        return normalize_database(json.loads(row["snapshot"])), True
    except Exception:
        return default_database(), False


def save_state(database: ZQuestDatabasePayload | dict[str, Any]) -> dict[str, Any]:
    snapshot = normalize_database(database.model_dump() if isinstance(database, ZQuestDatabasePayload) else database)
    with connect() as conn:
        conn.execute(
            """
            INSERT INTO zquest_state (id, snapshot, updated_at)
            VALUES (1, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                snapshot = excluded.snapshot,
                updated_at = excluded.updated_at
            """,
            (json.dumps(snapshot, separators=(",", ":"), sort_keys=True), snapshot["updatedAt"]),
        )
    return snapshot


@router.get("/health")
def health() -> dict[str, Any]:
    return {"ok": True, "backend": "sqlite", "databasePath": str(DB_PATH)}


@router.get("/database")
def get_database() -> dict[str, Any]:
    database, initialized = load_state()
    return {
        "ok": True,
        "backend": "sqlite",
        "initialized": initialized,
        "database": database,
    }


@router.put("/database")
def put_database(payload: ZQuestDatabasePayload) -> dict[str, Any]:
    database = save_state(payload)
    return {
        "ok": True,
        "backend": "sqlite",
        "database": database,
    }


@router.post("/database/reset")
def reset_database() -> dict[str, Any]:
    database = save_state(default_database())
    return {
        "ok": True,
        "backend": "sqlite",
        "database": database,
    }
