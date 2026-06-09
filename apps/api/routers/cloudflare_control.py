from __future__ import annotations

import json
import os
from pathlib import Path
from typing import Any

from fastapi import APIRouter

router = APIRouter(tags=["cloudflare-control"])

ROOT = Path(os.getenv("ZEAZ_PLATFORM_ROOT", "/home/zeazdev/zeaz-platform"))
if not ROOT.exists():
    ROOT = Path.cwd()

PLAN_PATH = ROOT / "configs/platform/apps-port-plan.json"
OVERLAY_PATH = ROOT / "configs/platform/zcfdash-route-overlay.json"
TFVARS_PATH = ROOT / "terraform/cloudflare-apps/apps.auto.tfvars.json"
INGRESS_PATH = ROOT / "reports/platform/cloudflare-tunnel-ingress.generated.yml"
PORT_REPORT_PATH = ROOT / "reports/platform/apps-port-refactor.md"
GO_LIVE_REPORT_PATH = ROOT / "reports/platform/final-go-live-complete.md"
AUDIT_REPORT_PATH = ROOT / "docs/reports/generated/full-repo-audit-report.md"


def _read_json(path: Path, default: Any) -> Any:
    try:
        if not path.exists():
            return default
        return json.loads(path.read_text(encoding="utf-8"))
    except Exception as exc:  # pragma: no cover - endpoint returns diagnostics
        return {"error": str(exc), "path": str(path)}


def _read_text_tail(path: Path, limit: int = 12000) -> str:
    try:
        if not path.exists():
            return ""
        text = path.read_text(encoding="utf-8", errors="replace")
        return text[-limit:]
    except Exception as exc:  # pragma: no cover
        return f"ERROR reading {path}: {exc}"


def _combined_routes() -> list[dict[str, Any]]:
    plan = _read_json(PLAN_PATH, {"routes": []})
    routes = list(plan.get("routes", [])) if isinstance(plan, dict) else []
    overlay = _read_json(OVERLAY_PATH, {"routes": []})
    if isinstance(overlay, dict):
        routes.extend(overlay.get("routes", []))
    return routes


def _zcfdash_routes() -> list[dict[str, Any]]:
    return [
        route
        for route in _combined_routes()
        if route.get("hostname") in {"zcfdash.zeaz.dev", "api-zcfdash.zeaz.dev"}
        or route.get("app_id") in {"zcfdash", "zcfdash-api"}
    ]


@router.get("/health")
def health() -> dict[str, Any]:
    routes = _zcfdash_routes()
    return {
        "status": "ok",
        "service": "api-zcfdash.zeaz.dev",
        "mode": "read-only",
        "root": str(ROOT),
        "route_count": len(routes),
        "required_files": {
            "base_plan": PLAN_PATH.exists(),
            "zcfdash_overlay": OVERLAY_PATH.exists(),
            "terraform_apps_tfvars": TFVARS_PATH.exists(),
            "tunnel_ingress_report": INGRESS_PATH.exists(),
            "port_report": PORT_REPORT_PATH.exists(),
        },
    }


@router.get("/routes")
def routes() -> dict[str, Any]:
    return {
        "zone": "zeaz.dev",
        "control_panel": "zcfdash.zeaz.dev",
        "api": "api-zcfdash.zeaz.dev",
        "routes": _zcfdash_routes(),
    }


@router.get("/terraform")
def terraform_assets() -> dict[str, Any]:
    tfvars = _read_json(TFVARS_PATH, {"app_routes": {}})
    app_routes = tfvars.get("app_routes", {}) if isinstance(tfvars, dict) else {}
    selected = {
        host: config
        for host, config in app_routes.items()
        if host in {"zcfdash.zeaz.dev", "api-zcfdash.zeaz.dev"}
    }
    return {
        "path": str(TFVARS_PATH),
        "exists": TFVARS_PATH.exists(),
        "routes": selected,
    }


@router.get("/ingress")
def ingress() -> dict[str, Any]:
    text = _read_text_tail(INGRESS_PATH)
    lines = [line for line in text.splitlines() if "zcfdash.zeaz.dev" in line or "api-zcfdash.zeaz.dev" in line]
    return {
        "path": str(INGRESS_PATH),
        "exists": INGRESS_PATH.exists(),
        "matching_lines": lines,
    }


@router.get("/reports")
def reports() -> dict[str, Any]:
    return {
        "port_report": {
            "path": str(PORT_REPORT_PATH),
            "exists": PORT_REPORT_PATH.exists(),
            "tail": _read_text_tail(PORT_REPORT_PATH, 8000),
        },
        "go_live_report": {
            "path": str(GO_LIVE_REPORT_PATH),
            "exists": GO_LIVE_REPORT_PATH.exists(),
            "tail": _read_text_tail(GO_LIVE_REPORT_PATH, 8000),
        },
        "audit_report": {
            "path": str(AUDIT_REPORT_PATH),
            "exists": AUDIT_REPORT_PATH.exists(),
            "tail": _read_text_tail(AUDIT_REPORT_PATH, 8000),
        },
    }


@router.get("/summary")
def summary() -> dict[str, Any]:
    return {
        "title": "ZeaZ Cloudflare Control Panel",
        "ui_hostname": "zcfdash.zeaz.dev",
        "api_hostname": "api-zcfdash.zeaz.dev",
        "mode": "read-only control and evidence API",
        "routes": _zcfdash_routes(),
        "health": health(),
        "next_local_commands": [
            "python3 scripts/platform/generate-port-refactor-assets.py",
            "make -f Makefile -f Makefile.app-servers apps-server-status",
            "bash scripts/platform/final-go-live-complete.sh",
        ],
    }
