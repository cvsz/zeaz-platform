#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path.cwd()
CONFIG = ROOT / "configs/platform/apps-routing.json"
REPORT = ROOT / "reports/platform/apps-routing.md"
TFVARS_JSON = ROOT / "terraform/cloudflare-apps/apps.auto.tfvars.json"
TUNNEL_MD = ROOT / "reports/platform/cloudflare-tunnel-ingress.md"

data = json.loads(CONFIG.read_text())
apps = data["apps"]

seen_hosts = {}
seen_ports = {}
errors = []

for app in apps:
    for host in app.get("hostnames", []):
        if host in seen_hosts:
            errors.append(f"duplicate hostname {host}: {seen_hosts[host]} and {app['app_id']}")
        seen_hosts[host] = app["app_id"]
        if not (host == data["zone"] or host.endswith("." + data["zone"])):
            errors.append(f"hostname outside zone: {host}")
    port = app.get("port")
    if port:
        if not isinstance(port, int) or not (1 <= port <= 65535):
            errors.append(f"invalid port for {app['app_id']}: {port}")
        seen_ports.setdefault(str(port), []).append(app["app_id"])

for app in apps:
    origin = app.get("origin")
    if origin and not re.match(r"^(http|https|ssh)://127\.0\.0\.1:[0-9]{2,5}$", origin):
        errors.append(f"origin must be localhost service for {app['app_id']}: {origin}")

REPORT.parent.mkdir(parents=True, exist_ok=True)
lines = [
    "# zeaz.dev apps routing inventory",
    "",
    "| App | Path | Type | Hostname(s) | Origin | Port | Status | API Prefix |",
    "|---|---|---|---|---|---:|---|---|",
]
for app in apps:
    lines.append(
        "| {app_id} | `{path}` | {type} | `{hosts}` | `{origin}` | `{port}` | {status} | `{prefix}` |".format(
            app_id=app["app_id"],
            path=app["path"],
            type=app["type"],
            hosts=", ".join(app["hostnames"]),
            origin=app.get("origin") or "",
            port=app.get("port") or "",
            status=app.get("status", ""),
            prefix=app.get("gateway_prefix", ""),
        )
    )

lines += [
    "",
    "## Port usage",
    "",
    "| Port | Apps |",
    "|---:|---|",
]
for port, ids in sorted(seen_ports.items(), key=lambda x: int(x[0])):
    lines.append(f"| {port} | {', '.join(ids)} |")

if errors:
    lines += ["", "## Errors", ""]
    lines += [f"- {e}" for e in errors]

REPORT.write_text("\n".join(lines) + "\n")

TFVARS_JSON.parent.mkdir(parents=True, exist_ok=True)
routes = {}
for app in apps:
    for host in app.get("hostnames", []):
        routes[host] = {
            "app_id": app["app_id"],
            "hostname": host,
            "origin": app.get("origin"),
            "port": app.get("port"),
            "type": app.get("type"),
            "status": app.get("status"),
            "gateway_prefix": app.get("gateway_prefix"),
        }

TFVARS_JSON.write_text(json.dumps({"app_routes": routes}, indent=2) + "\n")

TUNNEL_MD.parent.mkdir(parents=True, exist_ok=True)
tunnel_lines = ["# Cloudflare Tunnel ingress intent", ""]
for app in apps:
    for host in app["hostnames"]:
        tunnel_lines.append(f"- `{host}` -> `{app.get('origin') or 'reserved'}`")
TUNNEL_MD.write_text("\n".join(tunnel_lines) + "\n")

print(f"PASS: wrote {REPORT}")
print(f"PASS: wrote {TFVARS_JSON}")
print(f"PASS: wrote {TUNNEL_MD}")

if errors:
    print("ERRORS:")
    for e in errors:
        print(f"- {e}")
    raise SystemExit(1)
