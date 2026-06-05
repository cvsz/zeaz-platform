#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

ROOT = Path.cwd()
APPS_DIR = ROOT / "apps"
OUT_JSON = ROOT / "reports/platform/apps-stack-inventory.json"
OUT_MD = ROOT / "reports/platform/apps-stack-inventory.md"

EXCLUDE_DIRS = {
    ".git", "node_modules", ".venv", "venv", "env", ".next", "dist", "build",
    "coverage", ".runtime", ".wrangler", ".terraform", ".pytest_cache",
    ".ruff_cache", ".mypy_cache", "__pycache__", ".agent", ".agents",
    ".claude", ".codex", ".gemini", ".pnpm-store", "vendor"
}

STACK_FILES = {
    "package.json", "pnpm-lock.yaml", "package-lock.json", "yarn.lock", "bun.lockb",
    "pyproject.toml", "requirements.txt", "poetry.lock", "Pipfile",
    "Dockerfile", "docker-compose.yml", "docker-compose.yaml", "compose.yml",
    "Makefile", "wrangler.toml", "next.config.js", "next.config.ts",
    "vite.config.ts", "vite.config.js", "tsconfig.json"
}

PORT_RE = re.compile(
    r"(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(?P<port>\d{3,5})|"
    r"\b(?P<key>[A-Z0-9_]*PORT)\s*[:=]\s*[\"']?(?P<envport>\d{3,5})[\"']?",
    re.I,
)
DOMAIN_RE = re.compile(r"\b(?:[A-Za-z0-9-]+\.)+zeaz\.dev\b")


def run(cmd: list[str], cwd: Path = ROOT) -> str:
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def rel(path: Path) -> str:
    return str(path.relative_to(ROOT))


def should_skip_dir(name: str) -> bool:
    return name in EXCLUDE_DIRS


def iter_files(path: Path):
    for current, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if not should_skip_dir(d)]
        for name in files:
            yield Path(current) / name


def read_text(path: Path, max_bytes: int = 256_000) -> str:
    try:
        if path.stat().st_size > max_bytes:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def detect_stack(app_dir: Path) -> dict[str, Any]:
    files = []
    for p in iter_files(app_dir):
        if p.name in STACK_FILES or p.name.endswith(".Dockerfile"):
            files.append(rel(p))

    stack = set()
    if (app_dir / "package.json").exists():
        stack.add("node")
    if (app_dir / "pnpm-lock.yaml").exists():
        stack.add("pnpm")
    if (app_dir / "package-lock.json").exists():
        stack.add("npm")
    if (app_dir / "pyproject.toml").exists() or list(app_dir.glob("**/requirements*.txt")):
        stack.add("python")
    if any("docker-compose" in f or f.endswith("Dockerfile") for f in files):
        stack.add("docker")
    if any(f.endswith("wrangler.toml") for f in files):
        stack.add("cloudflare-workers")
    if any(f.endswith(".tf") for f in files):
        stack.add("terraform")

    return {
        "stack": sorted(stack) or ["unknown"],
        "stack_files": sorted(files),
    }


def parse_package(app_dir: Path) -> dict[str, Any] | None:
    p = app_dir / "package.json"
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text())
    except Exception:
        return {"parse_error": True}
    return {
        "name": data.get("name"),
        "version": data.get("version"),
        "scripts": sorted((data.get("scripts") or {}).keys()),
        "dependencies_count": len(data.get("dependencies") or {}),
        "dev_dependencies_count": len(data.get("devDependencies") or {}),
    }


def scan_signals(app_dir: Path) -> dict[str, Any]:
    ports: dict[str, set[str]] = defaultdict(set)
    domains: dict[str, set[str]] = defaultdict(set)
    ext = Counter()

    for p in iter_files(app_dir):
        ext[p.suffix.lower() or p.name] += 1
        if p.suffix.lower() not in {".py", ".ts", ".tsx", ".js", ".jsx", ".json", ".yml", ".yaml", ".toml", ".md", ".txt", ".sh", ".env", ".example"} and p.name not in {"Dockerfile", "Makefile"}:
            continue
        text = read_text(p)
        if not text:
            continue
        rp = rel(p)

        for m in PORT_RE.finditer(text):
            port = m.group("port") or m.group("envport")
            if port and 100 <= int(port) <= 65535:
                ports[port].add(rp)

        for d in DOMAIN_RE.findall(text):
            domains[d].add(rp)

    return {
        "ports": {k: sorted(v)[:30] for k, v in sorted(ports.items(), key=lambda x: int(x[0]))},
        "domains": {k: sorted(v)[:30] for k, v in sorted(domains.items())},
        "extension_counts": dict(ext.most_common(20)),
    }


def app_info(app_dir: Path) -> dict[str, Any]:
    stack = detect_stack(app_dir)
    package = parse_package(app_dir)
    signals = scan_signals(app_dir)

    return {
        "app_id": app_dir.name,
        "path": rel(app_dir),
        "nested_git": (app_dir / ".git").exists(),
        "root_tracked_files": len(run(["git", "ls-files", "--", rel(app_dir)]).splitlines()),
        "git_status": run(["git", "status", "--short", "--", rel(app_dir)]).splitlines(),
        **stack,
        "package": package,
        "signals": signals,
    }


def main() -> int:
    if not APPS_DIR.exists():
        raise SystemExit("ERROR: apps directory not found")

    apps = [app_info(p) for p in sorted(APPS_DIR.iterdir()) if p.is_dir() and not p.name.startswith(".")]

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps({"apps": apps}, indent=2, ensure_ascii=False) + "\n")

    lines = [
        "# Apps stack inventory",
        "",
        "| App | Stack | Tracked | Ports detected | Domains detected |",
        "|---|---|---:|---|---|",
    ]

    for app in apps:
        lines.append(
            "| {app_id} | `{stack}` | {tracked} | `{ports}` | `{domains}` |".format(
                app_id=app["app_id"],
                stack=", ".join(app["stack"]),
                tracked=app["root_tracked_files"],
                ports=", ".join(app["signals"]["ports"].keys()) or "-",
                domains=", ".join(app["signals"]["domains"].keys()) or "-",
            )
        )

    for app in apps:
        lines += [
            "",
            f"## {app['app_id']}",
            "",
            f"- Path: `{app['path']}`",
            f"- Stack: `{', '.join(app['stack'])}`",
            f"- Root tracked files: `{app['root_tracked_files']}`",
            "",
            "### Ports",
            "",
        ]
        if app["signals"]["ports"]:
            for port, sources in app["signals"]["ports"].items():
                lines.append(f"- `{port}` from `{', '.join(sources[:10])}`")
        else:
            lines.append("- none detected")

        lines += ["", "### Domains", ""]
        if app["signals"]["domains"]:
            for domain, sources in app["signals"]["domains"].items():
                lines.append(f"- `{domain}` from `{', '.join(sources[:10])}`")
        else:
            lines.append("- none detected")

    OUT_MD.write_text("\n".join(lines) + "\n")

    print(f"PASS: wrote {OUT_JSON}")
    print(f"PASS: wrote {OUT_MD}")
    print(f"Apps scanned: {len(apps)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
