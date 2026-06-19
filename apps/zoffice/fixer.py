#!/usr/bin/env python3
"""Portable zOffice gateway presence fixer.

This utility rewrites the known gateway_presence.py presence-state block using paths
relative to this file instead of an absolute deployment path.
"""
from __future__ import annotations

import re
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent / "app"
TARGET = APP_DIR / "gateway_presence.py"

if not TARGET.exists():
    raise SystemExit(f"Missing target file: {TARGET}")

content = TARGET.read_text(encoding="utf-8")

fixed = """def _note_event(event_type):
    with _state_lock:
        _debug["lastEventAt"] = int(time.time())
        counts = _debug.setdefault("events", {})
        counts[event_type] = counts.get(event_type, 0) + 1


def _is_manual_override_active(agent_id, now=None):
    with _state_lock:
        now = now or time.time()
        override = _manual_overrides.get(agent_id)
        if override and override["expires"] > now:
            return True
        if override and override["expires"] <= now:
            del _manual_overrides[agent_id]
        if agent_id in _state and _state[agent_id].get("source") == "manual":
            _state[agent_id]["source"] = "manual-expired"
        return False


def _ensure_agent(agent_id, source="discovered"):
    with _state_lock:
        if not agent_id:
            return
        if agent_id not in _state:
            _state[agent_id] = {"state": "idle", "task": "", "updated": 0, "source": source}


def _set_idle(agent_id, source="gateway-idle"):
    with _state_lock:
        if not agent_id or _is_manual_override_active(agent_id):
            return
        now = time.time()
        _ensure_agent(agent_id)
        _finish_idle_at.pop(agent_id, None)
        _state[agent_id].update({
            "state": "idle",
            "task": "",
            "updated": int(now),
            "source": source,
        })"""

content = re.sub(
    r"def _note_event\(event_type\):.*?def _format_tool_task",
    fixed + "\n\n\ndef _format_tool_task",
    content,
    flags=re.DOTALL,
)

TARGET.write_text(content, encoding="utf-8")
print(f"Updated: {TARGET}")
