#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path.cwd()
PLAN = ROOT / "configs/platform/apps-port-plan.json"
OUT_MD = ROOT / "reports/platform/apps-port-refactor.md"
OUT_TF = ROOT / "terraform/cloudflare-apps/apps.auto.tfvars.json"
OUT_INGRESS = ROOT / "reports/platform/cloudflare-tunnel-ingress.generated.yml"

data = json.loads(PLAN.read_text())
routes = data["routes"]

errors = []
host_seen = {}
port_seen = defaultdict(list)

for route in routes:
    host = route["hostname"]
    port = route["port"]
    origin = route["origin"]

    if host in host_seen:
        errors.append(f"duplicate hostname: {host}")
    host_seen[host] = route["app_id"]

    port_seen[str(port)].append(route["app_id"])

    if not (host == data["zone"] or host.endswith("." + data["zone"])):
        errors.append(f"hostname outside zone: {host}")

    if not re.match(r"^(http|https|ssh)://127\.0\.0\.1:\d{3,5}$", origin):
        errors.append(f"origin must bind to 127.0.0.1: {route['app_id']} {origin}")

# allow intentional shared ports only for explicit pairs
allowed_shared_ports = {
    "8787": {"root", "root-www"}
}

for port, app_ids in port_seen.items():
    ids = set(app_ids)
    if len(ids) > 1 and ids != allowed_shared_ports.get(port, set()):
        errors.append(f"port collision: {port} used by {', '.join(app_ids)}")

OUT_MD.parent.mkdir(parents=True, exist_ok=True)
lines = [
    "# Apps port refactor plan",
    "",
    "| App | Role | Path | Hostname | Port | Origin | Status | API Gateway |",
    "|---|---|---|---|---:|---|---|---|",
]
for r in routes:
    lines.append(
        f"| {r['app_id']} | {r['role']} | `{r['path']}` | `{r['hostname']}` | {r['port']} | `{r['origin']}` | {r['status']} | `{r.get('api_gateway_prefix', '')}` |"
    )

lines += ["", "## Port usage", "", "| Port | Apps |", "|---:|---|"]
for port, ids in sorted(port_seen.items(), key=lambda x: int(x[0])):
    lines.append(f"| {port} | {', '.join(ids)} |")

if errors:
    lines += ["", "## Errors", ""]
    lines += [f"- {e}" for e in errors]

OUT_MD.write_text("\n".join(lines) + "\n")

OUT_TF.parent.mkdir(parents=True, exist_ok=True)
app_routes = {}
for r in routes:
    if r["status"] == "reserved":
        continue
    app_routes[r["hostname"]] = {
        "app_id": r["app_id"],
        "hostname": r["hostname"],
        "origin": r["origin"],
        "port": r["port"],
        "role": r["role"],
        "status": r["status"],
        "api_gateway_prefix": r.get("api_gateway_prefix"),
    }
OUT_TF.write_text(json.dumps({"app_routes": app_routes}, indent=2) + "\n")

ingress = ["ingress:"]
for r in routes:
    if r["status"] == "reserved":
        continue
    ingress.append(f"  - hostname: {r['hostname']}")
    ingress.append(f"    service: {r['origin']}")
ingress.append("  - service: http_status:404")
OUT_INGRESS.write_text("\n".join(ingress) + "\n")

print(f"PASS: wrote {OUT_MD}")
print(f"PASS: wrote {OUT_TF}")
print(f"PASS: wrote {OUT_INGRESS}")

if errors:
    print("ERROR: port plan validation failed")
    for e in errors:
        print(f"- {e}")
    raise SystemExit(1)
