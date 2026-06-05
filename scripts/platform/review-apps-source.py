#!/usr/bin/env python3
from __future__ import annotations

import argparse
import json
import os
import re
import subprocess
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

DEFAULT_EXCLUDE_DIRS = {
    ".git",
    "node_modules",
    ".pnpm-store",
    ".venv",
    "venv",
    "env",
    ".next",
    "dist",
    "build",
    "coverage",
    ".runtime",
    ".wrangler",
    ".terraform",
    ".pytest_cache",
    ".ruff_cache",
    ".mypy_cache",
    "__pycache__",
    ".agent",
    ".agents",
    ".claude",
    ".codex",
    ".gemini",
    ".vendor",
    "vendor",
    "target",
}

TEXT_SUFFIXES = {
    ".py", ".js", ".jsx", ".ts", ".tsx",
    ".json", ".yml", ".yaml", ".toml",
    ".md", ".txt", ".sh", ".bash",
    ".html", ".css", ".scss",
    ".conf", ".ini", ".cfg", ".example",
    ".tf", ".dockerfile",
}

TEXT_NAMES = {
    "Dockerfile",
    "Makefile",
    ".env.example",
    ".env.production.example",
    "requirements.txt",
    "package.json",
    "pnpm-lock.yaml",
    "package-lock.json",
    "yarn.lock",
    "pyproject.toml",
    "docker-compose.yml",
    "docker-compose.yaml",
    "compose.yml",
    "compose.yaml",
    "wrangler.toml",
}

SECRET_PATTERNS = [
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----"),
    re.compile(r"\bghp_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bgithub_pat_[A-Za-z0-9_]{20,}\b"),
    re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    re.compile(r"\bsk_live_[A-Za-z0-9_-]{8,}\b"),
    re.compile(r"\bsk-[A-Za-z0-9_-]{20,}\b"),
    re.compile(r"\b(?:api[_-]?key|token|secret|password|passwd|client_secret|private_key)\s*[:=]\s*[\"'][^\"']{6,}[\"']", re.I),
]

PORT_RE = re.compile(
    r"(?:localhost|127\.0\.0\.1|0\.0\.0\.0):(?P<port>\d{3,5})|"
    r"\b(?P<key>[A-Z0-9_]*PORT)\s*[:=]\s*[\"']?(?P<envport>\d{3,5})[\"']?",
    re.I,
)

DOMAIN_RE = re.compile(r"\b(?:[A-Za-z0-9-]+\.)+zeaz\.dev\b")
TODO_RE = re.compile(r"\b(TODO|FIXME|HACK|XXX|BUG)\b", re.I)

FORBIDDEN_ZDASH_DOMAINS = {
    "api.zdash.zeaz.dev": "api-zdash.zeaz.dev",
    "zdash-api.zeaz.dev": "api-zdash.zeaz.dev",
    "dash.zeaz.dev": "zdash.zeaz.dev",
}


def run(cmd: list[str], cwd: Path) -> str:
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""


def rel(path: Path, root: Path) -> str:
    return str(path.relative_to(root))


def is_text_file(path: Path) -> bool:
    if path.name in TEXT_NAMES:
        return True
    if path.suffix.lower() in TEXT_SUFFIXES:
        return True
    if ".env" in path.name:
        return True
    return False


def read_text(path: Path, max_bytes: int = 512_000) -> str:
    try:
        if path.stat().st_size > max_bytes:
            return ""
        return path.read_text(encoding="utf-8", errors="replace")
    except Exception:
        return ""


def redact(line: str) -> str:
    line = re.sub(
        r"(?i)(api[_-]?key|token|secret|password|passwd|client_secret|private_key)\s*[:=]\s*[\"']?[^\"'\s,}]+[\"']?",
        r"\1=<redacted>",
        line,
    )
    line = re.sub(r"ghp_[A-Za-z0-9_]{8,}", "ghp_<redacted>", line)
    line = re.sub(r"github_pat_[A-Za-z0-9_]{8,}", "github_pat_<redacted>", line)
    line = re.sub(r"sk_live_[A-Za-z0-9_-]{4,}", "sk_live_<redacted>", line)
    line = re.sub(r"sk-[A-Za-z0-9_-]{8,}", "sk-<redacted>", line)
    line = re.sub(r"AKIA[0-9A-Z]{16}", "AKIA<redacted>", line)
    return line[:220]


def iter_files(app_dir: Path, exclude_dirs: set[str]):
    for current, dirs, files in os.walk(app_dir):
        dirs[:] = [d for d in dirs if d not in exclude_dirs]
        for name in files:
            yield Path(current) / name


def load_port_plan(root: Path) -> dict[str, Any]:
    plan_path = root / "configs/platform/apps-port-plan.json"
    if not plan_path.exists():
        return {"routes": []}
    return json.loads(plan_path.read_text())


def build_expected_maps(plan: dict[str, Any]) -> tuple[dict[str, dict[str, Any]], dict[str, dict[str, Any]]]:
    by_path: dict[str, dict[str, Any]] = {}
    by_hostname: dict[str, dict[str, Any]] = {}

    for route in plan.get("routes", []):
        path = route.get("path")
        hostname = route.get("hostname")
        if path:
            by_path.setdefault(path, route)
        if hostname:
            by_hostname[hostname] = route

    return by_path, by_hostname


def detect_stack(app_dir: Path) -> list[str]:
    stack = set()

    if (app_dir / "package.json").exists():
        stack.add("node")
    if (app_dir / "pnpm-lock.yaml").exists():
        stack.add("pnpm")
    if (app_dir / "package-lock.json").exists():
        stack.add("npm")
    if (app_dir / "pyproject.toml").exists() or list(app_dir.glob("**/requirements*.txt")):
        stack.add("python")
    if (app_dir / "docker-compose.yml").exists() or (app_dir / "docker-compose.yaml").exists() or list(app_dir.glob("**/Dockerfile")):
        stack.add("docker")
    if (app_dir / "wrangler.toml").exists():
        stack.add("cloudflare-workers")
    if list(app_dir.glob("**/*.tf")):
        stack.add("terraform")

    return sorted(stack) or ["unknown"]


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



def is_generated_or_legacy_doc_path(path: Path) -> bool:
    s = str(path).replace("\\", "/")
    generated_markers = [
        "/bin/Release/",
        "/obj/Release/",
        "/documentation/",
        "/user_guide/",
        "/tests/platform/artifacts/",
        "/docs/reports/",
        "/assets/global/plugins/",
        "/app/assets/global/plugins/",
        "/app/obj/Release/",
        "/app/bin/Release/",
    ]
    return any(marker in s for marker in generated_markers)


def is_test_fixture_path(path: Path) -> bool:
    s = str(path).replace("\\", "/").lower()
    return (
        "/test/" in s
        or "/tests/" in s
        or s.endswith(".test.ts")
        or s.endswith(".test.tsx")
        or s.endswith(".spec.ts")
        or s.endswith(".spec.tsx")
        or s.endswith("_test.py")
        or s.endswith("test_helpers.ts")
        or s.endswith("/helpers.ts")
    )


def is_secret_fixture_line(line: str) -> bool:
    lowered = line.lower()
    fixture_markers = [
        "payload:",
        "test@",
        "device-",
        "reg-nonce",
        "login-nonce",
        "example",
        "fixture",
        "mock",
    ]
    secret_words = ["password", "token", "api_key", "apikey", "secret"]
    return any(word in lowered for word in secret_words) and any(marker in lowered for marker in fixture_markers)

def scan_app(root: Path, app_dir: Path, exclude_dirs: set[str], expected_by_path: dict[str, dict[str, Any]]) -> dict[str, Any]:
    app_rel = rel(app_dir, root)
    file_count = 0
    source_count = 0
    total_bytes = 0
    extensions = Counter()
    ports: dict[str, set[str]] = defaultdict(set)
    domains: dict[str, set[str]] = defaultdict(set)
    env_files: list[dict[str, Any]] = []
    secret_hits: list[dict[str, str]] = []
    todo_hits: list[dict[str, str]] = []
    large_files: list[dict[str, Any]] = []
    findings: list[dict[str, str]] = []

    nested_git = (app_dir / ".git").exists()
    if nested_git:
        findings.append({
            "severity": "critical",
            "code": "nested_git",
            "message": "Nested .git directory exists under app path",
        })

    for marker in [".vendor", ".agent", ".codex", ".gemini", ".claude"]:
        if (app_dir / marker).exists():
            findings.append({
                "severity": "warn",
                "code": "local_tooling_or_vendor_dir",
                "message": f"{marker} exists; excluded from review and should not be committed",
            })

    for path in iter_files(app_dir, exclude_dirs):
        file_count += 1
        try:
            size = path.stat().st_size
        except Exception:
            size = 0

        total_bytes += size
        extensions[path.suffix.lower() or path.name] += 1

        if size > 1_000_000:
            large_files.append({"path": rel(path, root), "bytes": size})

        if ".env" in path.name:
            text = read_text(path, max_bytes=128_000)
            keys = []
            for line in text.splitlines():
                s = line.strip()
                if not s or s.startswith("#") or "=" not in s:
                    continue
                key = s.split("=", 1)[0].strip()
                if re.match(r"^[A-Za-z_][A-Za-z0-9_]*$", key):
                    keys.append(key)

            is_example = "example" in path.name
            env_files.append({
                "path": rel(path, root),
                "is_example": is_example,
                "key_count": len(set(keys)),
                "keys": sorted(set(keys)),
            })

            if not is_example:
                findings.append({
                    "severity": "warn",
                    "code": "local_env_file",
                    "message": f"Local env file exists: {rel(path, root)}",
                })

        if not is_text_file(path):
            continue

        source_count += 1
        text = read_text(path)
        if not text:
            continue

        rp = rel(path, root)

        for match in PORT_RE.finditer(text):
            port = match.group("port") or match.group("envport")
            if port and 100 <= int(port) <= 65535:
                ports[port].add(rp)

        for domain in DOMAIN_RE.findall(text):
            domains[domain].add(rp)

        # Check forbidden zDash domains as exact domain tokens only.
        # This avoids false positives where "dash.zeaz.dev" is a substring of "zdash.zeaz.dev".
        file_domains = set(DOMAIN_RE.findall(text))
        for old, new in FORBIDDEN_ZDASH_DOMAINS.items():
            if old in file_domains:
                findings.append({
                    "severity": "critical",
                    "code": "stale_zdash_domain",
                    "message": f"{old} found in {rp}; use {new}",
                })

        secret_scan_allowed = True

        # Non-example env files are reported as local_env_file warnings above.
        # Do not parse their values into secret-like hits.
        if ".env" in path.name and "example" not in path.name:
            secret_scan_allowed = False

        # Generated legacy docs and packaged build artifacts often contain examples.
        # Keep them in the report, but do not let them block go-live as critical source secrets.
        if is_generated_or_legacy_doc_path(path):
            secret_scan_allowed = False

        if secret_scan_allowed and len(secret_hits) < 50:
            for line_no, line in enumerate(text.splitlines(), 1):
                if is_test_fixture_path(path) and is_secret_fixture_line(line):
                    continue

                if any(pattern.search(line) for pattern in SECRET_PATTERNS):
                    secret_hits.append({
                        "path": rp,
                        "line": str(line_no),
                        "preview": redact(line),
                    })
                    if len(secret_hits) >= 50:
                        break

        if len(todo_hits) < 100:
            for line_no, line in enumerate(text.splitlines(), 1):
                if TODO_RE.search(line):
                    todo_hits.append({
                        "path": rp,
                        "line": str(line_no),
                        "preview": line.strip()[:180],
                    })
                    if len(todo_hits) >= 100:
                        break

    expected_route = expected_by_path.get(app_rel)
    expected_port = str(expected_route["port"]) if expected_route and expected_route.get("port") else None
    expected_host = expected_route.get("hostname") if expected_route else None

    if expected_port and expected_port not in ports:
        findings.append({
            "severity": "info",
            "code": "expected_port_not_detected",
            "message": f"Expected port {expected_port} from apps-port-plan not detected in source text",
        })

    if expected_host and expected_host not in domains:
        findings.append({
            "severity": "info",
            "code": "expected_hostname_not_detected",
            "message": f"Expected hostname {expected_host} from apps-port-plan not detected in source text",
        })

    if secret_hits:
        findings.append({
            "severity": "critical",
            "code": "secret_like_hits",
            "message": f"{len(secret_hits)} secret-like hit(s) found; review redacted report before commit",
        })

    return {
        "app_id": app_dir.name,
        "path": app_rel,
        "stack": detect_stack(app_dir),
        "package": parse_package(app_dir),
        "nested_git": nested_git,
        "root_tracked_files": len(run(["git", "ls-files", "--", app_rel], root).splitlines()),
        "git_status": run(["git", "status", "--short", "--", app_rel], root).splitlines(),
        "file_count": file_count,
        "source_count": source_count,
        "total_bytes": total_bytes,
        "extensions": dict(extensions.most_common(30)),
        "ports": {k: sorted(v) for k, v in sorted(ports.items(), key=lambda x: int(x[0]))},
        "domains": {k: sorted(v) for k, v in sorted(domains.items())},
        "env_files": sorted(env_files, key=lambda x: x["path"]),
        "secret_hits": secret_hits,
        "todo_hits": todo_hits,
        "large_files": sorted(large_files, key=lambda x: x["bytes"], reverse=True)[:50],
        "findings": findings,
    }


def write_markdown(root: Path, output: Path, data: dict[str, Any]) -> None:
    lines: list[str] = []
    lines.append("# Apps source review")
    lines.append("")
    lines.append(f"Generated: `{data['generated_at']}`")
    lines.append(f"Apps scanned: `{data['app_count']}`")
    lines.append("")
    lines.append("This report is read-only. It excludes dependency, cache, build, runtime, vendor, and local tooling directories.")
    lines.append("")
    lines.append("## Summary")
    lines.append("")
    lines.append("| App | Stack | Files | Source | Ports | Domains | Critical | Warnings |")
    lines.append("|---|---|---:|---:|---|---|---:|---:|")

    for app in data["apps"]:
        critical = sum(1 for f in app["findings"] if f["severity"] == "critical")
        warnings = sum(1 for f in app["findings"] if f["severity"] == "warn")
        lines.append(
            "| {app_id} | `{stack}` | {files} | {source} | `{ports}` | `{domains}` | {critical} | {warnings} |".format(
                app_id=app["app_id"],
                stack=", ".join(app["stack"]),
                files=app["file_count"],
                source=app["source_count"],
                ports=", ".join(app["ports"].keys()) or "-",
                domains=", ".join(app["domains"].keys()) or "-",
                critical=critical,
                warnings=warnings,
            )
        )

    for app in data["apps"]:
        lines.append("")
        lines.append(f"## `{app['app_id']}`")
        lines.append("")
        lines.append(f"- Path: `{app['path']}`")
        lines.append(f"- Stack: `{', '.join(app['stack'])}`")
        lines.append(f"- Root tracked files: `{app['root_tracked_files']}`")
        lines.append(f"- Nested git: `{app['nested_git']}`")
        lines.append(f"- Files scanned: `{app['file_count']}`")
        lines.append(f"- Source-like files scanned: `{app['source_count']}`")

        if app["package"]:
            lines.append("")
            lines.append("### Package")
            lines.append("")
            lines.append(f"- Name: `{app['package'].get('name')}`")
            lines.append(f"- Version: `{app['package'].get('version')}`")
            lines.append(f"- Scripts: `{', '.join(app['package'].get('scripts') or []) or '-'}`")

        lines.append("")
        lines.append("### Ports")
        lines.append("")
        if app["ports"]:
            for port, sources in app["ports"].items():
                lines.append(f"- `{port}` from `{', '.join(sources[:12])}`")
        else:
            lines.append("- none detected")

        lines.append("")
        lines.append("### Domains")
        lines.append("")
        if app["domains"]:
            for domain, sources in app["domains"].items():
                lines.append(f"- `{domain}` from `{', '.join(sources[:12])}`")
        else:
            lines.append("- none detected")

        lines.append("")
        lines.append("### Env files")
        lines.append("")
        if app["env_files"]:
            for env in app["env_files"]:
                label = "example" if env["is_example"] else "local-only"
                lines.append(f"- `{env['path']}` `{label}` keys={env['key_count']}: `{', '.join(env['keys'][:50])}`")
        else:
            lines.append("- none detected")

        if app["findings"]:
            lines.append("")
            lines.append("### Findings")
            lines.append("")
            for finding in app["findings"]:
                lines.append(f"- `{finding['severity']}` `{finding['code']}`: {finding['message']}")

        if app["secret_hits"]:
            lines.append("")
            lines.append("### Secret-like hits")
            lines.append("")
            lines.append("Values are redacted. Review source before commit.")
            for hit in app["secret_hits"][:50]:
                lines.append(f"- `{hit['path']}:{hit['line']}` `{hit['preview']}`")

        if app["todo_hits"]:
            lines.append("")
            lines.append("### TODO/FIXME/HACK hits")
            lines.append("")
            for hit in app["todo_hits"][:50]:
                lines.append(f"- `{hit['path']}:{hit['line']}` `{hit['preview']}`")

        if app["large_files"]:
            lines.append("")
            lines.append("### Large files")
            lines.append("")
            for item in app["large_files"][:25]:
                lines.append(f"- `{item['path']}` `{item['bytes']}` bytes")

        if app["git_status"]:
            lines.append("")
            lines.append("### Git status")
            lines.append("")
            lines.append("```text")
            lines.extend(app["git_status"][:120])
            lines.append("```")

    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text("\n".join(lines) + "\n")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--root", default=".")
    parser.add_argument("--apps-dir", default="apps")
    parser.add_argument("--json", default="reports/platform/apps-source-review.json")
    parser.add_argument("--markdown", default="reports/platform/apps-source-review.md")
    parser.add_argument("--fail-on-critical", action="store_true")
    parser.add_argument("--include-vendor", action="store_true")
    args = parser.parse_args()

    root = Path(args.root).resolve()
    apps_dir = (root / args.apps_dir).resolve()

    exclude_dirs = set(DEFAULT_EXCLUDE_DIRS)
    if args.include_vendor:
        exclude_dirs.discard(".vendor")
        exclude_dirs.discard("vendor")

    plan = load_port_plan(root)
    expected_by_path, _ = build_expected_maps(plan)

    apps = [
        scan_app(root, p, exclude_dirs, expected_by_path)
        for p in sorted(apps_dir.iterdir())
        if p.is_dir() and not p.name.startswith(".")
    ]

    critical_count = sum(
        1
        for app in apps
        for finding in app["findings"]
        if finding["severity"] == "critical"
    )

    data = {
        "generated_at": run(["date", "-u", "+%Y-%m-%dT%H:%M:%SZ"], root),
        "root": str(root),
        "apps_dir": str(apps_dir),
        "app_count": len(apps),
        "critical_count": critical_count,
        "apps": apps,
    }

    json_out = (root / args.json).resolve()
    md_out = (root / args.markdown).resolve()

    json_out.parent.mkdir(parents=True, exist_ok=True)
    json_out.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    write_markdown(root, md_out, data)

    print(f"PASS: wrote {json_out.relative_to(root)}")
    print(f"PASS: wrote {md_out.relative_to(root)}")
    print(f"Apps scanned: {len(apps)}")
    print(f"Critical findings: {critical_count}")

    if args.fail_on_critical and critical_count:
        raise SystemExit(1)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
