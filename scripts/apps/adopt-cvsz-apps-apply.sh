#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: APPLY=true CONFIRM_CVSZ_APPS_MERGE=yes scripts/apps/adopt-cvsz-apps-apply.sh

Guarded local adoption helper for cvsz apps under apps/*.

Required environment:
  APPLY=true
  CONFIRM_CVSZ_APPS_MERGE=yes

Optional environment:
  CONFIG      Path to merge map JSON. Default: configs/repos/cvsz-apps-merge-map.json
  REPORT_DIR  Report/backup directory. Default comes from the merge map.

What this script may do after both guards are set:
  - write apps/<app>/IMPORT_SOURCE.md before removing nested apps/<app>/.git
  - back up nested .git directories under reports/cvsz-apps-merge/backups/
  - remove broad root .gitignore app-directory ignores for adopt-local apps
  - append managed local-artifact guardrails to app .gitignore files

What this script never does:
  - git add, git commit, git push, or auto-merge
  - run live trading, social posting, Cloudflare mutation, Terraform apply,
    token rotation, external automation, or deployment
EOF
}

if [ "${1:-}" = "--help" ] || [ "${1:-}" = "-h" ]; then
  usage
  exit 0
fi

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

APPLY_VALUE="${APPLY:-false}"
CONFIRM_VALUE="${CONFIRM_CVSZ_APPS_MERGE:-no}"
CONFIG="${CONFIG:-configs/repos/cvsz-apps-merge-map.json}"

if [ "$APPLY_VALUE" != "true" ]; then
  echo "ERROR: APPLY=true required; no files changed" >&2
  exit 2
fi

if [ "$CONFIRM_VALUE" != "yes" ]; then
  echo "ERROR: CONFIRM_CVSZ_APPS_MERGE=yes required; no files changed" >&2
  exit 2
fi

test -f "$CONFIG" || { echo "ERROR: missing $CONFIG" >&2; exit 2; }

tmpdir="$(mktemp -d)"
cleanup() {
  rm -rf "$tmpdir"
}
trap cleanup EXIT

python3 - "$CONFIG" "${REPORT_DIR:-}" <<'PY'
from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tarfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path.cwd()
CONFIG = ROOT / sys.argv[1]
CONFIG_DATA = json.loads(CONFIG.read_text(encoding="utf-8"))
REPORT_DIR = Path(sys.argv[2]) if sys.argv[2] else ROOT / CONFIG_DATA.get("report_dir", "reports/cvsz-apps-merge")
if not REPORT_DIR.is_absolute():
    REPORT_DIR = ROOT / REPORT_DIR
BACKUP_DIR = REPORT_DIR / "backups" / datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
ROOT_GITIGNORE = ROOT / ".gitignore"

MANAGED_BEGIN = "# BEGIN Phase 58 cvsz apps adoption guardrails"
MANAGED_END = "# END Phase 58 cvsz apps adoption guardrails"
APP_GITIGNORE_BLOCK = [
    MANAGED_BEGIN,
    ".env",
    ".env.local",
    ".env.production",
    ".env.cloudflare",
    "*.log",
    "*.sqlite",
    "*.db",
    "node_modules/",
    ".pnpm-store/",
    ".venv/",
    "venv/",
    "env/",
    "dist/",
    "build/",
    ".next/",
    ".nuxt/",
    "coverage/",
    ".turbo/",
    ".cache/",
    "__pycache__/",
    ".pytest_cache/",
    ".mypy_cache/",
    ".ruff_cache/",
    ".terraform/",
    "*.tfstate",
    "*.tfstate.backup",
    "*.tfvars",
    "*.tfplan",
    ".terraform.tfstate.lock.info",
    MANAGED_END,
]
ROOT_GITIGNORE_BLOCK = [
    MANAGED_BEGIN,
    "apps/*/.env",
    "apps/*/.env.local",
    "apps/*/.env.production",
    "apps/*/.env.cloudflare",
    "apps/*/backend/.env",
    "apps/*/frontend/.env.local",
    "apps/*/node_modules/",
    "apps/*/.pnpm-store/",
    "apps/*/.venv/",
    "apps/*/venv/",
    "apps/*/env/",
    "apps/*/dist/",
    "apps/*/build/",
    "apps/*/.next/",
    "apps/*/.nuxt/",
    "apps/*/coverage/",
    "apps/*/.turbo/",
    "apps/*/.cache/",
    "apps/*/__pycache__/",
    "apps/*/.pytest_cache/",
    "apps/*/.mypy_cache/",
    "apps/*/.ruff_cache/",
    "apps/*/.terraform/",
    "apps/**/*.tfstate",
    "apps/**/*.tfstate.backup",
    "apps/**/*.tfvars",
    "apps/**/*.tfplan",
    "apps/**/.terraform.tfstate.lock.info",
    "apps/**/*.sqlite",
    "apps/**/*.db",
    "apps/**/*.log",
    MANAGED_END,
]


def rel(path: Path) -> str:
    try:
        return path.relative_to(ROOT).as_posix()
    except ValueError:
        return path.as_posix()


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


def replace_managed_block(existing: str, block: list[str]) -> str:
    lines = existing.splitlines()
    output: list[str] = []
    index = 0
    replaced = False
    while index < len(lines):
        if lines[index].strip() == MANAGED_BEGIN:
            replaced = True
            while index < len(lines) and lines[index].strip() != MANAGED_END:
                index += 1
            if index < len(lines):
                index += 1
            output.extend(block)
            continue
        output.append(lines[index])
        index += 1
    if not replaced:
        if output and output[-1] != "":
            output.append("")
        output.extend(block)
    return "\n".join(output).rstrip() + "\n"


def update_root_gitignore(apps: list[dict[str, Any]]) -> list[str]:
    adopt_paths = {f"{app['target_path'].rstrip('/')}/" for app in apps if app.get("mode") == "adopt-local"}
    adopt_paths |= {app["target_path"].rstrip("/") for app in apps if app.get("mode") == "adopt-local"}
    adopt_paths |= {f"{app['target_path'].rstrip('/')}/*" for app in apps if app.get("mode") == "adopt-local"}
    existing = ROOT_GITIGNORE.read_text(encoding="utf-8") if ROOT_GITIGNORE.exists() else ""
    kept: list[str] = []
    removed: list[str] = []
    for line in existing.splitlines():
        if line.strip() in adopt_paths:
            removed.append(line.strip())
            continue
        kept.append(line)
    ROOT_GITIGNORE.write_text(replace_managed_block("\n".join(kept), ROOT_GITIGNORE_BLOCK), encoding="utf-8")
    return removed


def append_app_gitignore(app_path: Path) -> None:
    gitignore = app_path / ".gitignore"
    existing = gitignore.read_text(encoding="utf-8") if gitignore.exists() else ""
    gitignore.write_text(replace_managed_block(existing, APP_GITIGNORE_BLOCK), encoding="utf-8")


def nested_git_metadata(app_path: Path) -> dict[str, str]:
    return {
        "origin": run(["git", "-C", str(app_path), "remote", "get-url", "origin"]),
        "branch": run(["git", "-C", str(app_path), "branch", "--show-current"]),
        "head": run(["git", "-C", str(app_path), "rev-parse", "HEAD"]),
        "status": run(["git", "-C", str(app_path), "status", "--short"]),
    }


def write_import_source(app: dict[str, Any], app_path: Path, metadata: dict[str, str], nested_present: bool) -> None:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    if nested_present:
        content = f"""# Import Source

App: {app['app_id']}
Source repository: {app['repo']}
Nested origin before adoption: {metadata.get('origin') or 'unknown'}
Nested branch before adoption: {metadata.get('branch') or 'unknown'}
Nested HEAD before adoption: {metadata.get('head') or 'unknown'}
Nested status before adoption: clean
Adopted into: {CONFIG_DATA.get('operator_repo', 'cvsz/zeaz-platform')}
Adopted path: {app['target_path']}
Adopted at: {now}

This app is now managed by the zeaz-platform operator monorepo.
Do not reintroduce nested .git directories.
"""
    else:
        content = f"""# Import Source

App: {app['app_id']}
Source repository: {app['repo']}
Nested origin before adoption: unknown
Nested branch before adoption: unknown
Nested HEAD before adoption: unknown
Adopted into: {CONFIG_DATA.get('operator_repo', 'cvsz/zeaz-platform')}
Adopted path: {app['target_path']}
Adopted at: {now}

No nested .git directory was present when this adoption helper ran.
This app is managed by the zeaz-platform operator monorepo.
"""
    (app_path / "IMPORT_SOURCE.md").write_text(content, encoding="utf-8")


def backup_and_remove_git(app: dict[str, Any], app_path: Path) -> None:
    nested_git = app_path / ".git"
    if not nested_git.exists():
        return
    metadata = nested_git_metadata(app_path)
    if metadata["status"]:
        raise SystemExit(f"ERROR: {app['app_id']} nested repo has uncommitted changes; refusing to remove .git")
    write_import_source(app, app_path, metadata, nested_present=True)
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    backup_path = BACKUP_DIR / f"{app['app_id']}.git.tar.gz"
    with tarfile.open(backup_path, "w:gz") as archive:
        archive.add(nested_git, arcname=".git")
    shutil.rmtree(nested_git)
    print(f"PASS: removed nested .git for {app['app_id']} after writing IMPORT_SOURCE.md")
    print(f"PASS: backup written to {rel(backup_path)}")


def main() -> int:
    apps = CONFIG_DATA.get("apps", [])
    removed_ignores = update_root_gitignore(apps)
    if removed_ignores:
        print("PASS: removed broad root .gitignore entries for adopt-local apps:")
        for item in removed_ignores:
            print(f"  - {item}")
    else:
        print("PASS: no broad adopt-local app ignores needed removal")

    for app in apps:
        if app.get("mode") != "adopt-local":
            print(f"INFO: skip {app['app_id']} mode={app.get('mode')}")
            continue
        app_path = ROOT / app["target_path"]
        if not app_path.exists():
            print(f"WARN: missing {app['target_path']}; skipped")
            continue
        if (app_path / ".git").exists():
            backup_and_remove_git(app, app_path)
        elif not (app_path / "IMPORT_SOURCE.md").exists():
            write_import_source(app, app_path, {}, nested_present=False)
            print(f"PASS: wrote {rel(app_path / 'IMPORT_SOURCE.md')}")
        append_app_gitignore(app_path)
        print(f"PASS: ensured local-artifact guardrails in {rel(app_path / '.gitignore')}")

    print("PASS: adoption preparation complete")
    print("INFO: no git add, git commit, git push, deployment, token rotation, Cloudflare mutation, or Terraform apply was run")
    print("INFO: next safe checks: make cvsz-apps-merge-plan && make cvsz-apps-merge-validate")
    return 0


raise SystemExit(main())
PY
