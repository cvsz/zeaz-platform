#!/usr/bin/env python3
from __future__ import annotations

import json
import sys
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "generated/integration/apps-inventory.json")
data = json.loads(path.read_text())

fail = 0

canonical_forbidden_domains = {
    "zdash-api.zeaz.dev": "api-zdash.zeaz.dev",
    "api.zdash.zeaz.dev": "api-zdash.zeaz.dev",
    "dash.zeaz.dev": "zdash.zeaz.dev",
}

print("Apps inventory validation")
print(f"- apps: {data.get('app_count')}")

for app in data.get("apps", []):
    app_id = app["app_id"]
    nested_git = app.get("git", {}).get("nested_git", False)
    tracked = app.get("git", {}).get("tracked_files", 0)
    env_local = [e["path"] for e in app.get("env_files", []) if e.get("is_local_secret_file")]
    domains = set(app.get("signals", {}).get("domains", {}).keys())

    if nested_git and tracked > 0:
        print(f"ERROR: {app_id}: nested .git but also tracked by root")
        fail = 1

    for env in env_local:
        print(f"WARN: {app_id}: local env file exists: {env}")

    for old, new in canonical_forbidden_domains.items():
        if old in domains:
            print(f"ERROR: {app_id}: stale domain {old}; use {new}")
            fail = 1

    if app_id == "zdash" and tracked == 0:
        print("ERROR: zdash must be tracked under apps/zdash")
        fail = 1

if fail:
    raise SystemExit(1)

print("PASS: apps inventory validation clean")
