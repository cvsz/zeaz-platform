#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import sys
import urllib.error
import urllib.request


def request_json(url: str, method: str = "GET", data: dict | None = None) -> dict:
    body = None
    headers = {"Accept": "application/json"}
    if data is not None:
        body = json.dumps(data).encode("utf-8")
        headers["Content-Type"] = "application/json"
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    with urllib.request.urlopen(req, timeout=5) as response:
      return json.loads(response.read().decode("utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--base-url", required=True)
    args = parser.parse_args()
    base = args.base_url.rstrip("/")

    health = request_json(f"{base}/api/runtime/zquest/health")
    if not health.get("ok"):
        raise SystemExit("health failed")

    initial = request_json(f"{base}/api/runtime/zquest/database")
    db = initial["database"]
    db["version"] = 1
    db["activeUserId"] = "alpha"
    db["users"] = [{
        "id": "alpha",
        "username": "Alpha",
        "points": 123,
        "bestScore": 1234,
        "lastScore": 1234,
        "totalScore": 1234,
        "runs": 2,
        "wins": 1,
        "vip": True,
        "createdAt": "2026-01-01T00:00:00Z",
        "lastLoginAt": "2026-01-01T00:00:00Z",
        "updatedAt": "2026-01-01T00:00:00Z",
        "runSavedScore": 0,
    }]
    put = request_json(f"{base}/api/runtime/zquest/database", method="PUT", data=db)
    if put.get("database", {}).get("activeUserId") != "alpha":
        raise SystemExit("put failed")

    reset = request_json(f"{base}/api/runtime/zquest/database/reset", method="POST")
    if reset.get("database", {}).get("activeUserId") != "guest":
        raise SystemExit("reset failed")

    roundtrip = request_json(f"{base}/api/runtime/zquest/database")
    if roundtrip.get("database", {}).get("activeUserId") != "guest":
        raise SystemExit("roundtrip failed")

    print("zquest smoke ok")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except urllib.error.HTTPError as exc:
        print(f"HTTP error: {exc.code}", file=sys.stderr)
        raise
