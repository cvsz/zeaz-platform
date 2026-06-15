#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import sqlite3
from json import JSONDecodeError
from datetime import datetime, timezone
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(os.getenv("ZQUEST_DOCROOT") or "/home/zeazdev/zeaz-platform/apps/zquest")
DB = Path(os.getenv("ZQUEST_DATABASE_PATH") or "/home/zeazdev/zeaz-platform/apps/api/data/zquest.sqlite3")
HOST = os.getenv("ZQUEST_HOST", "127.0.0.1")
PORT = int(os.getenv("ZQUEST_PORT", "8080"))

DB.parent.mkdir(parents=True, exist_ok=True)


def now() -> str:
    return datetime.now(timezone.utc).isoformat()


def slug(value: str) -> str:
    text = re.sub(r"[^a-z0-9]+", "-", str(value).strip().lower()).strip("-")
    return text or "player"


def default_user(name: str = "Guest") -> dict[str, object]:
    stamp = now()
    safe_name = " ".join(str(name).split()).strip()[:24] or "Player"
    return {
        "id": slug(safe_name),
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


def default_db() -> dict[str, object]:
    user = default_user()
    return {
        "version": 1,
        "activeUserId": user["id"],
        "users": [user],
        "updatedAt": user["updatedAt"],
    }


def as_int(value: object) -> int:
    try:
        return max(0, int(float(value)))
    except Exception:
        return 0


def norm_user(user: object) -> dict[str, object] | None:
    if not isinstance(user, dict):
        return None

    name = " ".join(str(user.get("username", "Player")).split()).strip()[:24] or "Player"
    created = user.get("createdAt") if isinstance(user.get("createdAt"), str) else now()
    last_login = user.get("lastLoginAt") if isinstance(user.get("lastLoginAt"), str) else created
    updated = user.get("updatedAt") if isinstance(user.get("updatedAt"), str) else last_login

    return {
        "id": str(user.get("id") or slug(name)).strip() or slug(name),
        "username": name,
        "points": as_int(user.get("points")),
        "bestScore": as_int(user.get("bestScore")),
        "lastScore": as_int(user.get("lastScore")),
        "totalScore": as_int(user.get("totalScore")),
        "runs": as_int(user.get("runs")),
        "wins": as_int(user.get("wins")),
        "vip": bool(user.get("vip")),
        "createdAt": created,
        "lastLoginAt": last_login,
        "updatedAt": updated,
        "runSavedScore": as_int(user.get("runSavedScore")),
    }


def norm_db(raw: object) -> dict[str, object]:
    if not isinstance(raw, dict):
        return default_db()

    users: list[dict[str, object]] = []
    seen: set[str] = set()
    for user in raw.get("users", []):
        normalized = norm_user(user)
        if not normalized:
            continue
        if normalized["id"] in seen:
            continue
        seen.add(normalized["id"])
        users.append(normalized)

    if not users:
        return default_db()

    active_id = str(raw.get("activeUserId") or "").strip()
    active = next((user for user in users if user["id"] == active_id), users[0])
    updated_at = raw.get("updatedAt") if isinstance(raw.get("updatedAt"), str) else now()
    return {
        "version": 1,
        "activeUserId": active["id"],
        "users": users,
        "updatedAt": updated_at,
    }


def ensure_schema() -> None:
    with sqlite3.connect(DB) as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS zquest_state (
                id INTEGER PRIMARY KEY CHECK (id = 1),
                snapshot TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
            """
        )


def load_db() -> tuple[dict[str, object], bool]:
    ensure_schema()
    with sqlite3.connect(DB) as conn:
        conn.row_factory = sqlite3.Row
        row = conn.execute("SELECT snapshot FROM zquest_state WHERE id = 1").fetchone()
    if not row:
        return default_db(), False
    try:
        return norm_db(json.loads(row["snapshot"])), True
    except Exception:
        return default_db(), False


def save_db(db: object) -> dict[str, object]:
    snapshot = norm_db(db)
    ensure_schema()
    with sqlite3.connect(DB) as conn:
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


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def log_message(self, format: str, *args: object) -> None:
        print(f"[zquest] {format % args}")

    def _json(self, status: int, payload: dict[str, object]) -> None:
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin") or "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self) -> None:
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", self.headers.get("Origin") or "*")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Accept")
        self.send_header("Access-Control-Allow-Methods", "GET, PUT, POST, OPTIONS")
        self.end_headers()

    def do_GET(self) -> None:
        if self.path == "/api/runtime/zquest/health":
            self._json(200, {"ok": True, "backend": "sqlite", "databasePath": str(DB)})
            return
        if self.path == "/api/runtime/zquest/database":
            database, initialized = load_db()
            self._json(200, {"ok": True, "backend": "sqlite", "initialized": initialized, "database": database})
            return
        super().do_GET()

    def do_PUT(self) -> None:
        if self.path != "/api/runtime/zquest/database":
            self.send_error(404)
            return
        length = int(self.headers.get("Content-Length") or 0)
        raw = self.rfile.read(length) if length else b"{}"
        try:
            payload = json.loads(raw.decode("utf-8") or "{}")
        except JSONDecodeError:
            self._json(400, {"ok": False, "error": "invalid JSON"})
            return
        self._json(200, {"ok": True, "backend": "sqlite", "database": save_db(payload)})

    def do_POST(self) -> None:
        if self.path != "/api/runtime/zquest/database/reset":
            self.send_error(404)
            return
        self._json(200, {"ok": True, "backend": "sqlite", "database": save_db(default_db())})


def main() -> None:
    print(f"Serving zQuest on http://{HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()


if __name__ == "__main__":
    main()
