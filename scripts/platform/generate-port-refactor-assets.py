#!/usr/bin/env python3
from __future__ import annotations

import json
import re
from collections import defaultdict
from pathlib import Path
from typing import Any

ROOT = Path.cwd()
PLAN = ROOT / "configs/platform/apps-port-plan.json"
OVERLAY_GLOB = "configs/platform/*-route-overlay.json"
OUT_MD = ROOT / "reports/platform/apps-port-refactor.md"
OUT_TF = ROOT / "terraform/cloudflare-apps/apps.auto.tfvars.json"
OUT_INGRESS = ROOT / "reports/platform/cloudflare-tunnel-ingress.generated.yml"


def load_plan() -> dict[str, Any]:
    data = json.loads(PLAN.read_text())
    routes = list(data.get("routes", []))
    overlays: list[str] = []

    for overlay_path in sorted(ROOT.glob(OVERLAY_GLOB)):
        overlay = json.loads(overlay_path.read_text())
        overlay_routes = overlay.get("routes", [])
        if not isinstance(overlay_routes, list):
            raise SystemExit(f"ERROR: overlay routes must be a list: {overlay_path}")
        routes.extend(overlay_routes)
        overlays.append(str(overlay_path.relative_to(ROOT)))

    data["routes"] = routes
    data["overlays"] = overlays
    return data


def is_alias_share(route: dict[str, Any], peer: dict[str, Any]) -> bool:
    return (
        route.get("alias_for") == peer.get("app_id")
        or peer.get("alias_for") == route.get("app_id")
        or (
            route.get("path") == peer.get("path")
            and route.get("origin") == peer.get("origin")
            and route.get("role") == peer.get("role")
        )
    )


def validate_routes(data: dict[str, Any]) -> tuple[list[str], dict[str, list[dict[str, Any]]]]:
    errors: list[str] = []
    host_seen: dict[str, str] = {}
    port_seen: dict[str, list[dict[str, Any]]] = defaultdict(list)

    for route in data["routes"]:
        host = route["hostname"]
        port = str(route["port"])
        origin = route["origin"]

        if host in host_seen:
            errors.append(f"duplicate hostname: {host}")
        host_seen[host] = route["app_id"]

        port_seen[port].append(route)

        if not (host == data["zone"] or host.endswith("." + data["zone"])):
            errors.append(f"hostname outside zone: {host}")

        if not re.match(r"^(http|https|ssh)://127\.0\.0\.1:\d{3,5}$", origin):
            errors.append(f"origin must bind to 127.0.0.1: {route['app_id']} {origin}")

    for port, routes in port_seen.items():
        if len(routes) <= 1:
            continue
        app_ids = [r["app_id"] for r in routes]
        all_alias_compatible = all(
            is_alias_share(a, b)
            for i, a in enumerate(routes)
            for b in routes[i + 1 :]
        )
        if not all_alias_compatible:
            errors.append(f"port collision: {port} used by {', '.join(app_ids)}")

    return errors, port_seen


def main() -> int:
    data = load_plan()
    routes = data["routes"]
    errors, port_seen = validate_routes(data)

    OUT_MD.parent.mkdir(parents=True, exist_ok=True)
    lines = [
        "# Apps port refactor plan",
        "",
        f"Base plan: `{PLAN.relative_to(ROOT)}`",
        f"Route overlays: `{', '.join(data.get('overlays') or []) or '-'}`",
        "",
        "| App | Role | Path | Hostname | Port | Origin | Status | Alias | API Gateway |",
        "|---|---|---|---|---:|---|---|---|---|",
    ]
    for r in routes:
        lines.append(
            f"| {r['app_id']} | {r['role']} | `{r['path']}` | `{r['hostname']}` | {r['port']} | `{r['origin']}` | {r['status']} | `{r.get('alias_for', '')}` | `{r.get('api_gateway_prefix', '')}` |"
        )

    lines += ["", "## Port usage", "", "| Port | Apps |", "|---:|---|"]
    for port, route_list in sorted(port_seen.items(), key=lambda x: int(x[0])):
        lines.append(f"| {port} | {', '.join(r['app_id'] for r in route_list)} |")

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
            "alias_for": r.get("alias_for"),
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
        return 1

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
