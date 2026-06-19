#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: scripts/apps/deep-dive-critical-apps.sh

Generate an offline, redacted deep-dive report for Phase 58 P1 apps:
  - apps/ABTPi18n
  - apps/zkbtrader

Environment:
  CONFIG      Path to merge map JSON. Default: configs/repos/cvsz-apps-merge-map.json
  REPORT_DIR  Report directory. Default comes from the merge map, usually reports/cvsz-apps-merge

This script does not run app servers, trading workflows, posting workflows,
Cloudflare mutation, Terraform apply, token rotation, deployment, or git staging.
EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

CONFIG="${CONFIG:-configs/repos/cvsz-apps-merge-map.json}"
test -f "$CONFIG" || { echo "ERROR: missing $CONFIG" >&2; exit 2; }

python3 - "$CONFIG" "${REPORT_DIR:-}" <<'PY'
from __future__ import annotations

import fnmatch
import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
CONFIG = ROOT / sys.argv[1]
CONFIG_DATA = json.loads(CONFIG.read_text(encoding="utf-8"))
REPORT_DIR = Path(sys.argv[2]) if sys.argv[2] else ROOT / CONFIG_DATA.get("report_dir", "reports/cvsz-apps-merge")
if not REPORT_DIR.is_absolute():
    REPORT_DIR = ROOT / REPORT_DIR
REPORT = REPORT_DIR / "critical-apps-deep-dive.md"
JSON_OUT = REPORT_DIR / "critical-apps-deep-dive.json"
APPS = CONFIG_DATA.get("critical_deep_dive_apps", ["ABTPi18n", "zkbtrader"])
EXCLUDE_DIRS = set(CONFIG_DATA.get("exclude_dirs", []))
EXCLUDE_FILES = list(CONFIG_DATA.get("exclude_files", []))
HINT_TERMS = [
    "paper",
    "live_trading",
    "trading",
    "exchange",
    "ccxt",
    "binance",
    "kucoin",
    "telegram",
    "oauth",
    "promptpay",
    "tradingview",
    "cloudflare",
    "terraform",
    "deploy",
]


def run(cmd: list[str], cwd: Path = ROOT) -> str:
    result = subprocess.run(
        cmd,
        cwd=str(cwd),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.stdout.strip() if result.returncode == 0 else ""


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


def git_check_ignore(path: Path) -> str:
    result = subprocess.run(
        ["git", "check-ignore", "-v", "--no-index", "--", rel(path)],
        cwd=str(ROOT),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.DEVNULL,
        check=False,
    )
    return result.stdout.strip().splitlines()[0] if result.returncode == 0 and result.stdout.strip() else ""


def matches_any(name: str, patterns: list[str]) -> bool:
    return any(fnmatch.fnmatch(name, pattern) for pattern in patterns)


def walk_app(path: Path):
    for current, dirs, files in os.walk(path):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and d != ".git"]
        yield Path(current), dirs, files


def file_inventory(path: Path) -> dict[str, Any]:
    total = 0
    by_ext: dict[str, int] = {}
    stack_files: list[str] = []
    env_files: list[dict[str, Any]] = []
    forbidden_local_files: list[str] = []
    stack_names = {
        "package.json",
        "pnpm-lock.yaml",
        "package-lock.json",
        "pyproject.toml",
        "requirements.txt",
        "Dockerfile",
        "docker-compose.yml",
        "Makefile",
        "wrangler.toml",
    }
    for current, _dirs, files in walk_app(path):
        for filename in files:
            total += 1
            full = current / filename
            ext = full.suffix.lower() or "<none>"
            by_ext[ext] = by_ext.get(ext, 0) + 1
            if filename in stack_names or filename.endswith(".tf"):
                stack_files.append(rel(full))
            if filename.startswith(".env"):
                names: list[str] = []
                for line in full.read_text(encoding="utf-8", errors="replace").splitlines():
                    if "=" in line and line[:1].isalpha():
                        names.append(line.split("=", 1)[0])
                env_files.append({"path": rel(full), "keys": names[:80], "key_count": len(names)})
            if matches_any(filename, EXCLUDE_FILES):
                forbidden_local_files.append(rel(full))
    return {
        "file_count": total,
        "extensions": dict(sorted(by_ext.items(), key=lambda item: (-item[1], item[0]))[:20]),
        "stack_files": sorted(stack_files),
        "env_files": sorted(env_files, key=lambda item: item["path"]),
        "forbidden_local_files": sorted(forbidden_local_files),
    }


def generated_dirs(path: Path) -> list[str]:
    found: list[str] = []
    if not path.exists():
        return found
    for current, dirs, _files in os.walk(path):
        current_path = Path(current)
        keep: list[str] = []
        for dirname in dirs:
            if dirname in EXCLUDE_DIRS and dirname != ".git":
                found.append(rel(current_path / dirname))
            else:
                keep.append(dirname)
        dirs[:] = keep
    return sorted(found)


def source_metadata(path: Path) -> dict[str, Any]:
    nested_git = path / ".git"
    source_file = path / "IMPORT_SOURCE.md"
    parsed: dict[str, str] = {}
    if source_file.exists():
        for line in source_file.read_text(encoding="utf-8", errors="replace").splitlines():
            if ":" in line:
                key, value = line.split(":", 1)
                parsed[key.strip().lower().replace(" ", "_")] = value.strip()
    return {
        "nested_git": nested_git.exists(),
        "nested_origin": run(["git", "-C", str(path), "remote", "get-url", "origin"]) if nested_git.exists() else "",
        "nested_branch": run(["git", "-C", str(path), "branch", "--show-current"]) if nested_git.exists() else "",
        "nested_head": run(["git", "-C", str(path), "rev-parse", "HEAD"]) if nested_git.exists() else "",
        "import_source_exists": source_file.exists(),
        "import_source": parsed,
    }


def package_summary(path: Path) -> dict[str, Any]:
    summaries: list[dict[str, Any]] = []
    packages: list[Path] = []
    for current, _dirs, files in walk_app(path):
        for filename in files:
            if filename == "package.json":
                packages.append(current / filename)
    for package in sorted(packages):
        try:
            data = json.loads(package.read_text(encoding="utf-8"))
        except Exception as exc:
            summaries.append({"path": rel(package), "error": str(exc)})
            continue
        summaries.append(
            {
                "path": rel(package),
                "name": data.get("name", ""),
                "version": data.get("version", ""),
                "script_names": sorted((data.get("scripts") or {}).keys()),
                "dependencies": len(data.get("dependencies") or {}),
                "dev_dependencies": len(data.get("devDependencies") or {}),
            }
        )
    return {"packages": summaries}


def pyproject_summary(path: Path) -> dict[str, Any]:
    summaries: list[dict[str, str]] = []
    pyprojects: list[Path] = []
    for current, _dirs, files in walk_app(path):
        for filename in files:
            if filename == "pyproject.toml":
                pyprojects.append(current / filename)
    for pyproject in sorted(pyprojects):
        name = ""
        version = ""
        in_project = False
        for raw in pyproject.read_text(encoding="utf-8", errors="replace").splitlines():
            line = raw.strip()
            if line == "[project]":
                in_project = True
                continue
            if line.startswith("[") and line != "[project]":
                in_project = False
            if in_project and line.startswith("name"):
                name = line.split("=", 1)[1].strip().strip('"')
            if in_project and line.startswith("version"):
                version = line.split("=", 1)[1].strip().strip('"')
        summaries.append({"path": rel(pyproject), "name": name, "version": version})
    return {"pyprojects": summaries}


def hint_summary(path: Path) -> dict[str, Any]:
    hints: dict[str, set[str]] = {term: set() for term in HINT_TERMS}
    text_suffixes = {".py", ".js", ".ts", ".tsx", ".jsx", ".md", ".toml", ".yaml", ".yml", ".json", ".sh", ".txt"}
    for current, _dirs, files in walk_app(path):
        for filename in files:
            full = current / filename
            if full.suffix.lower() not in text_suffixes and filename not in {"Makefile", "Dockerfile"}:
                continue
            try:
                content = full.read_text(encoding="utf-8", errors="ignore").lower()
            except OSError:
                continue
            for term in HINT_TERMS:
                if term in content:
                    hints[term].add(rel(full))
    return {term: sorted(paths)[:25] for term, paths in hints.items() if paths}


def app_summary(app: str) -> dict[str, Any]:
    path = ROOT / "apps" / app
    if not path.exists():
        return {"app_id": app, "path": rel(path), "exists": False}
    top_level_dirs = sorted(p.name for p in path.iterdir() if p.is_dir() and p.name != ".git")
    return {
        "app_id": app,
        "path": rel(path),
        "exists": True,
        "size": run(["du", "-sh", rel(path)]).split("\t", 1)[0],
        "root_tracked_file_count": len(run(["git", "ls-files", "--", rel(path)]).splitlines()),
        "root_status": run(["git", "status", "--short", "--untracked-files=all", "--", rel(path)]).splitlines(),
        "root_ignore_reason": git_check_ignore(path),
        "top_level_dirs": top_level_dirs,
        "source": source_metadata(path),
        "inventory": file_inventory(path),
        "generated_dirs": generated_dirs(path),
        "packages": package_summary(path)["packages"],
        "pyprojects": pyproject_summary(path)["pyprojects"],
        "hints": hint_summary(path),
    }


def render(data: dict[str, Any]) -> str:
    lines = [
        "# Critical Apps Deep-Dive",
        "",
        f"Generated: `{data['generated_at']}`",
        "",
        "Scope: `apps/ABTPi18n` and `apps/zkbtrader`.",
        "",
        "This report is metadata-only. Environment values are never printed.",
        "",
        "## Summary",
        "",
        "| App | Exists | Size | Tracked Files | Nested Git | Import Source | Root Ignore | Local Forbidden Files | Generated Dirs |",
        "| --- | ---: | ---: | ---: | ---: | ---: | --- | ---: | ---: |",
    ]
    for app in data["apps"]:
        if not app.get("exists"):
            lines.append(f"| {app['app_id']} | False | - | 0 | - | - | - | 0 | 0 |")
            continue
        lines.append(
            "| {app_id} | True | {size} | {tracked} | {nested} | {source} | {ignore} | {forbidden} | {generated} |".format(
                app_id=app["app_id"],
                size=app["size"],
                tracked=app["root_tracked_file_count"],
                nested=str(app["source"]["nested_git"]),
                source=str(app["source"]["import_source_exists"]),
                ignore=app["root_ignore_reason"] or "-",
                forbidden=len(app["inventory"]["forbidden_local_files"]),
                generated=len(app["generated_dirs"]),
            )
        )
    for app in data["apps"]:
        lines.extend(["", f"## {app['app_id']}", ""])
        if not app.get("exists"):
            lines.append("- Status: missing")
            continue
        lines.extend(
            [
                f"- Path: `{app['path']}`",
                f"- Size: `{app['size']}`",
                f"- Root tracked files: `{app['root_tracked_file_count']}`",
                f"- Root ignore reason: `{app['root_ignore_reason'] or '-'}`",
                f"- Top-level dirs: `{', '.join(app['top_level_dirs']) or '-'}`",
                "",
                "### Source Metadata",
                "",
                f"- Nested git: `{app['source']['nested_git']}`",
                f"- Nested origin: `{app['source']['nested_origin'] or '-'}`",
                f"- Nested branch: `{app['source']['nested_branch'] or '-'}`",
                f"- Nested HEAD: `{app['source']['nested_head'] or '-'}`",
                f"- IMPORT_SOURCE.md: `{app['source']['import_source_exists']}`",
                "",
                "### Stack Files",
                "",
            ]
        )
        if app["inventory"]["stack_files"]:
            lines.extend(f"- `{path}`" for path in app["inventory"]["stack_files"])
        else:
            lines.append("- None found")
        lines.extend(["", "### Package Metadata", ""])
        if app["packages"]:
            for package in app["packages"]:
                lines.append(
                    "- `{path}` name=`{name}` version=`{version}` scripts=`{scripts}` deps=`{deps}` devDeps=`{dev}`".format(
                        path=package["path"],
                        name=package.get("name", ""),
                        version=package.get("version", ""),
                        scripts=",".join(package.get("script_names", [])) or "-",
                        deps=package.get("dependencies", 0),
                        dev=package.get("dev_dependencies", 0),
                    )
                )
        else:
            lines.append("- None found")
        if app["pyprojects"]:
            for pyproject in app["pyprojects"]:
                lines.append(f"- `{pyproject['path']}` name=`{pyproject['name'] or '-'}` version=`{pyproject['version'] or '-'}`")
        lines.extend(["", "### Environment Files", ""])
        if app["inventory"]["env_files"]:
            for env in app["inventory"]["env_files"]:
                keys = ", ".join(env["keys"]) if env["keys"] else "-"
                lines.append(f"- `{env['path']}` keys=`{keys}`")
        else:
            lines.append("- None found")
        lines.extend(["", "### Local Files That Must Not Be Committed", ""])
        if app["inventory"]["forbidden_local_files"]:
            lines.extend(f"- `{path}`" for path in app["inventory"]["forbidden_local_files"])
        else:
            lines.append("- None found")
        lines.extend(["", "### Local Generated/Dependency/Cache Dirs", ""])
        if app["generated_dirs"]:
            lines.extend(f"- `{path}`" for path in app["generated_dirs"][:80])
            if len(app["generated_dirs"]) > 80:
                lines.append(f"- ... {len(app['generated_dirs']) - 80} more")
        else:
            lines.append("- None found")
        lines.extend(["", "### Safety Hints", ""])
        if app["hints"]:
            for term, files in app["hints"].items():
                lines.append(f"- `{term}`: {len(files)} file(s), examples: `{', '.join(files[:5])}`")
        else:
            lines.append("- No configured hints found")
    return "\n".join(lines).rstrip() + "\n"


REPORT_DIR.mkdir(parents=True, exist_ok=True)
data = {
    "generated_at": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "apps": [app_summary(app) for app in APPS],
}
REPORT.write_text(render(data), encoding="utf-8")
JSON_OUT.write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(f"PASS: wrote {rel(REPORT)}")
print(f"PASS: wrote {rel(JSON_OUT)}")
PY
