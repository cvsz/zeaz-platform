#!/usr/bin/env python3
from __future__ import annotations

import argparse
import datetime as dt
import json
import os
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

EXCLUDE_DIRS = {
    ".git",
    ".hg",
    ".svn",
    "node_modules",
    ".venv",
    "venv",
    "env",
    "dist",
    "build",
    ".next",
    ".nuxt",
    "coverage",
    ".turbo",
    ".cache",
    "__pycache__",
    ".pytest_cache",
    ".mypy_cache",
    ".ruff_cache",
    ".terraform",
    ".agent",
    ".agents",
    ".gemini",
    ".claude",
    ".codex",
    "vendor",
    "target",
    ".pnpm-store",
}

TEXT_SUFFIXES = {
    ".py",
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".json",
    ".yaml",
    ".yml",
    ".toml",
    ".ini",
    ".conf",
    ".cfg",
    ".sh",
    ".bash",
    ".zsh",
    ".md",
    ".txt",
    ".env",
    ".example",
    ".dockerfile",
}

TEXT_NAMES = {
    "Dockerfile",
    "dockerfile",
    "Makefile",
    "makefile",
    ".env",
    ".env.example",
    ".env.local",
    ".env.production",
    ".env.production.example",
    "requirements.txt",
    "package.json",
    "pyproject.toml",
    "wrangler.toml",
}

SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_-]{20,}"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\b(?:TOKEN|SECRET|PASSWORD|PASSPHRASE|API_KEY|PRIVATE_KEY)\s*=\s*[^#\s]+", re.I),
]

PORT_PATTERNS = [
    re.compile(r"\blocalhost:(\d{2,5})\b"),
    re.compile(r"\b127\.0\.0\.1:(\d{2,5})\b"),
    re.compile(r"\b(?:PORT|[A-Z0-9_]+_PORT)\s*[:=]\s*[\"']?(\d{3,5})[\"']?", re.I),
    re.compile(r"[\"'](\d{2,5}):(\d{2,5})[\"']"),
]

DOMAIN_RE = re.compile(r"\b(?:[A-Za-z0-9-]+\.)+zeaz\.dev\b")
HEALTH_RE = re.compile(r"(/[A-Za-z0-9_.-]*health[A-Za-z0-9_/.-]*|https?://[^\s\"']+/health[^\s\"']*)", re.I)


def run(cmd: list[str], cwd: Path) -> str:
    try:
        out = subprocess.check_output(cmd, cwd=str(cwd), stderr=subprocess.DEVNULL, text=True)
        return out.strip()
    except Exception:
        return ""


def rel(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)


def is_text_candidate(path: Path) -> bool:
    if path.name in TEXT_NAMES:
        return True
    if path.suffix.lower() in TEXT_SUFFIXES:
        return True
    if ".env" in path.name:
        return True
    return False


def iter_files(app_dir: Path, limit: int = 25000):
    count = 0
    for current, dirs, files in os.walk(app_dir):
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS and not d.endswith(".egg-info")]
        for name in files:
            path = Path(current) / name
            count += 1
            if count > limit:
                return
            yield path


def read_text(path: Path, max_bytes: int = 512_000) -> str:
    try:
        if path.stat().st_size > max_bytes:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def parse_package_json(app_dir: Path) -> dict[str, Any]:
    p = app_dir / "package.json"
    if not p.exists():
        return {}
    try:
        data = json.loads(p.read_text())
    except Exception:
        return {"parse_error": True}

    pm = "npm"
    if (app_dir / "pnpm-lock.yaml").exists():
        pm = "pnpm"
    elif (app_dir / "yarn.lock").exists():
        pm = "yarn"
    elif (app_dir / "bun.lockb").exists() or (app_dir / "bun.lock").exists():
        pm = "bun"

    return {
        "name": data.get("name"),
        "version": data.get("version"),
        "package_manager": pm,
        "scripts": sorted((data.get("scripts") or {}).keys()),
        "dependencies_count": len(data.get("dependencies") or {}),
        "dev_dependencies_count": len(data.get("devDependencies") or {}),
    }


def detect_python(app_dir: Path) -> dict[str, Any]:
    result: dict[str, Any] = {
        "pyproject": (app_dir / "pyproject.toml").exists(),
        "requirements": sorted(rel(p, app_dir) for p in app_dir.glob("**/requirements*.txt") if not any(x in p.parts for x in EXCLUDE_DIRS)),
        "venv_present": (app_dir / ".venv").exists() or (app_dir / "venv").exists(),
    }
    return result


def detect_docker(app_dir: Path) -> dict[str, Any]:
    compose_files = []
    dockerfiles = []
    for p in iter_files(app_dir):
        rp = rel(p, app_dir)
        if p.name in {"docker-compose.yml", "docker-compose.yaml", "compose.yml", "compose.yaml"}:
            compose_files.append(rp)
        if p.name == "Dockerfile" or p.name.endswith(".Dockerfile"):
            dockerfiles.append(rp)
    return {
        "compose_files": sorted(compose_files),
        "dockerfiles": sorted(dockerfiles),
    }


def make_targets(app_dir: Path) -> list[str]:
    p = app_dir / "Makefile"
    if not p.exists():
        return []
    targets = []
    for line in p.read_text(errors="replace").splitlines():
        if line.startswith("\t") or ":=" in line or "?=" in line or "+=" in line:
            continue
        m = re.match(r"^([A-Za-z0-9_.-]+)\s*:", line)
        if m and not m.group(1).startswith("."):
            targets.append(m.group(1))
    return sorted(set(targets))


def env_inventory(app_dir: Path, root: Path) -> list[dict[str, Any]]:
    envs = []
    for p in iter_files(app_dir):
        if ".env" not in p.name:
            continue
        keys = []
        text = read_text(p, max_bytes=128_000)
        for line in text.splitlines():
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            key = s.split("=", 1)[0].strip()
            if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", key):
                keys.append(key)
        envs.append({
            "path": rel(p, root),
            "keys": sorted(set(keys)),
            "key_count": len(set(keys)),
            "is_example": "example" in p.name,
            "is_local_secret_file": "example" not in p.name,
        })
    return sorted(envs, key=lambda x: x["path"])


def scan_text_signals(app_dir: Path, root: Path) -> dict[str, Any]:
    ports: dict[str, set[str]] = defaultdict(set)
    domains: dict[str, set[str]] = defaultdict(set)
    health: dict[str, set[str]] = defaultdict(set)
    secret_hits: list[dict[str, str]] = []
    ext_counts = Counter()
    file_count = 0

    for p in iter_files(app_dir):
        file_count += 1
        ext_counts[p.suffix.lower() or p.name] += 1

        if not is_text_candidate(p):
            continue

        text = read_text(p)
        if not text:
            continue

        rp = rel(p, root)

        for m in PORT_PATTERNS:
            for hit in m.findall(text):
                if isinstance(hit, tuple):
                    for h in hit:
                        if h.isdigit() and 100 <= int(h) <= 65535:
                            ports[h].add(rp)
                else:
                    if hit.isdigit() and 100 <= int(hit) <= 65535:
                        ports[hit].add(rp)

        for d in DOMAIN_RE.findall(text):
            domains[d].add(rp)

        for h in HEALTH_RE.findall(text):
            health[h].add(rp)

        lower_name = p.name.lower()
        secret_scan_allowed = (
            ".env" not in lower_name
            and "example" not in lower_name
            and "lock" not in lower_name
            and "report" not in rp.lower()
            and "docs/" not in rp.lower()
        )
        if secret_scan_allowed:
            for line_no, line in enumerate(text.splitlines(), 1):
                if any(pattern.search(line) for pattern in SECRET_PATTERNS):
                    redacted = re.sub(
                        r"(TOKEN|SECRET|PASSWORD|PASSPHRASE|API_KEY|PRIVATE_KEY)\s*=\s*[^#\s]+",
                        r"\1=<redacted>",
                        line,
                        flags=re.I,
                    )
                    secret_hits.append({
                        "path": rp,
                        "line": str(line_no),
                        "preview": redacted[:180],
                    })
                    if len(secret_hits) >= 25:
                        break

    return {
        "file_count": file_count,
        "extension_counts": dict(ext_counts.most_common(20)),
        "ports": {k: sorted(v)[:20] for k, v in sorted(ports.items(), key=lambda x: int(x[0]))},
        "domains": {k: sorted(v)[:20] for k, v in sorted(domains.items())},
        "health_endpoints": {k: sorted(v)[:20] for k, v in sorted(health.items())},
        "secret_like_hits": secret_hits,
    }


def app_git_info(root: Path, app_dir: Path) -> dict[str, Any]:
    app_rel = rel(app_dir, root)
    return {
        "nested_git": (app_dir / ".git").exists(),
        "tracked_files": len(run(["git", "ls-files", "--", app_rel], root).splitlines()),
        "status": run(["git", "status", "--short", "--", app_rel], root).splitlines(),
    }


def detect_runtime(package: dict[str, Any], py: dict[str, Any], docker: dict[str, Any], app_dir: Path) -> list[str]:
    runtime = []
    if package:
        runtime.append("node")
    if py["pyproject"] or py["requirements"] or list(app_dir.glob("**/*.py")):
        runtime.append("python")
    if docker["compose_files"] or docker["dockerfiles"]:
        runtime.append("docker")
    if (app_dir / "wrangler.toml").exists():
        runtime.append("cloudflare-workers")
    if (app_dir / "terraform").exists():
        runtime.append("terraform")
    if not runtime:
        runtime.append("unknown")
    return runtime


def analyze_app(root: Path, app_dir: Path) -> dict[str, Any]:
    package = parse_package_json(app_dir)
    py = detect_python(app_dir)
    docker = detect_docker(app_dir)
    signals = scan_text_signals(app_dir, root)
    envs = env_inventory(app_dir, root)

    warnings = []
    if (app_dir / ".git").exists():
        warnings.append("nested .git directory found")
    if any(e["is_local_secret_file"] for e in envs):
        warnings.append("local env file exists; values were not printed")
    if signals["secret_like_hits"]:
        warnings.append("secret-like text found in non-env tracked/source files")
    if "api-zzdash.zeaz.dev" in signals["domains"]:
        warnings.append("stale domain found: api-zzdash.zeaz.dev; use api-zzdash.zeaz.dev")

    return {
        "app_id": app_dir.name,
        "path": rel(app_dir, root),
        "runtime": detect_runtime(package, py, docker, app_dir),
        "package": package,
        "python": py,
        "docker": docker,
        "make_targets": make_targets(app_dir),
        "env_files": envs,
        "signals": signals,
        "git": app_git_info(root, app_dir),
        "warnings": warnings,
    }


def md_table_row(values: list[str]) -> str:
    return "| " + " | ".join(v.replace("\n", "<br>") for v in values) + " |"


def write_markdown(root: Path, report: Path, inventory: dict[str, Any]) -> None:
    lines: list[str] = []
    lines.append("# Local apps deep-dive report")
    lines.append("")
    lines.append(f"Generated: {inventory['generated_at']}")
    lines.append(f"Root: `{inventory['root']}`")
    lines.append(f"Apps dir: `{inventory['apps_dir']}`")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append(md_table_row(["App", "Runtime", "Ports", "Domains", "Warnings"]))
    lines.append(md_table_row(["---", "---", "---", "---", "---"]))

    for app in inventory["apps"]:
        ports = ", ".join(app["signals"]["ports"].keys()) or "-"
        domains = ", ".join(app["signals"]["domains"].keys()) or "-"
        warnings = "; ".join(app["warnings"]) or "-"
        lines.append(md_table_row([
            app["app_id"],
            ", ".join(app["runtime"]),
            ports,
            domains,
            warnings,
        ]))

    for app in inventory["apps"]:
        lines.append("")
        lines.append(f"## `{app['app_id']}`")
        lines.append("")
        lines.append(f"- Path: `{app['path']}`")
        lines.append(f"- Runtime: `{', '.join(app['runtime'])}`")
        lines.append(f"- Tracked files: `{app['git']['tracked_files']}`")
        lines.append(f"- Nested git: `{app['git']['nested_git']}`")
        lines.append(f"- File count scanned: `{app['signals']['file_count']}`")

        if app["package"]:
            lines.append("")
            lines.append("### Node package")
            lines.append("")
            lines.append(f"- Name: `{app['package'].get('name')}`")
            lines.append(f"- Version: `{app['package'].get('version')}`")
            lines.append(f"- Package manager: `{app['package'].get('package_manager')}`")
            lines.append(f"- Scripts: `{', '.join(app['package'].get('scripts') or []) or '-'}`")

        if app["python"]["pyproject"] or app["python"]["requirements"]:
            lines.append("")
            lines.append("### Python")
            lines.append("")
            lines.append(f"- pyproject.toml: `{app['python']['pyproject']}`")
            lines.append(f"- venv present: `{app['python']['venv_present']}`")
            lines.append(f"- requirements: `{', '.join(app['python']['requirements']) or '-'}`")

        if app["docker"]["compose_files"] or app["docker"]["dockerfiles"]:
            lines.append("")
            lines.append("### Docker")
            lines.append("")
            lines.append(f"- Compose files: `{', '.join(app['docker']['compose_files']) or '-'}`")
            lines.append(f"- Dockerfiles: `{', '.join(app['docker']['dockerfiles']) or '-'}`")

        if app["make_targets"]:
            lines.append("")
            lines.append("### Make targets")
            lines.append("")
            lines.append("```text")
            lines.extend(app["make_targets"][:120])
            lines.append("```")

        lines.append("")
        lines.append("### Ports")
        lines.append("")
        if app["signals"]["ports"]:
            for port, sources in app["signals"]["ports"].items():
                lines.append(f"- `{port}` from `{', '.join(sources[:8])}`")
        else:
            lines.append("- none detected")

        lines.append("")
        lines.append("### Domains")
        lines.append("")
        if app["signals"]["domains"]:
            for domain, sources in app["signals"]["domains"].items():
                lines.append(f"- `{domain}` from `{', '.join(sources[:8])}`")
        else:
            lines.append("- none detected")

        lines.append("")
        lines.append("### Health endpoints")
        lines.append("")
        if app["signals"]["health_endpoints"]:
            for endpoint, sources in app["signals"]["health_endpoints"].items():
                lines.append(f"- `{endpoint}` from `{', '.join(sources[:8])}`")
        else:
            lines.append("- none detected")

        lines.append("")
        lines.append("### Env files")
        lines.append("")
        if app["env_files"]:
            for env in app["env_files"]:
                label = "example" if env["is_example"] else "local-only"
                lines.append(f"- `{env['path']}` `{label}` keys={env['key_count']}: `{', '.join(env['keys'][:40])}`")
        else:
            lines.append("- none detected")

        if app["signals"]["secret_like_hits"]:
            lines.append("")
            lines.append("### Secret-like hits")
            lines.append("")
            lines.append("Values are redacted. Review manually before commit.")
            for hit in app["signals"]["secret_like_hits"]:
                lines.append(f"- `{hit['path']}:{hit['line']}` `{hit['preview']}`")

        if app["git"]["status"]:
            lines.append("")
            lines.append("### Git status for app path")
            lines.append("")
            lines.append("```text")
            lines.extend(app["git"]["status"][:120])
            lines.append("```")

        if app["warnings"]:
            lines.append("")
            lines.append("### Warnings")
            lines.append("")
            for warning in app["warnings"]:
                lines.append(f"- {warning}")

    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text("\n".join(lines) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser(description="Deep-dive local zeaz-platform/apps/*")
    parser.add_argument("--root", default=".", help="Repo root")
    parser.add_argument("--apps-dir", default="apps", help="Apps directory relative to root")
    parser.add_argument("--report", default="docs/reports/generated/apps-deep-dive.md")
    parser.add_argument("--json", default="generated/integration/apps-inventory.json")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    apps_dir = (root / args.apps_dir).resolve()
    report = (root / args.report).resolve()
    json_path = (root / args.json).resolve()

    if not apps_dir.exists():
        raise SystemExit(f"ERROR: apps dir not found: {apps_dir}")

    apps = [
        analyze_app(root, p)
        for p in sorted(apps_dir.iterdir())
        if p.is_dir() and not p.name.startswith(".")
    ]

    inventory = {
        "generated_at": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "root": str(root),
        "apps_dir": str(apps_dir),
        "app_count": len(apps),
        "apps": apps,
    }

    json_path.parent.mkdir(parents=True, exist_ok=True)
    json_path.write_text(json.dumps(inventory, indent=2, ensure_ascii=False) + "\n")

    write_markdown(root, report, inventory)

    print(f"PASS: wrote {report.relative_to(root)}")
    print(f"PASS: wrote {json_path.relative_to(root)}")
    print(f"Apps scanned: {len(apps)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
