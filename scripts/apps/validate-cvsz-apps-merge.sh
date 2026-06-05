#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: scripts/apps/validate-cvsz-apps-merge.sh

Validate Phase 58 cvsz apps adoption hygiene.

The validator is intentionally local and offline. It reports blockers for:
  - missing Phase 58 deliverables
  - nested .git directories after adoption
  - tracked or staged env/state/cache/build/runtime files
  - adopt-local app paths still hidden by broad root .gitignore entries
  - missing IMPORT_SOURCE.md after nested .git removal

It does not stage, commit, push, deploy, rotate tokens, mutate Cloudflare, run
Terraform apply, run app servers, or run trading/posting automation.
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

REPORT_DIR="$(python3 - "$CONFIG" <<'PY'
import json
import sys
from pathlib import Path
data = json.loads(Path(sys.argv[1]).read_text())
print(data.get("report_dir", "reports/cvsz-apps-merge"))
PY
)"
PLAN_JSON="$REPORT_DIR/cvsz-apps-merge-plan.json"
PLAN_MD="$REPORT_DIR/cvsz-apps-merge-plan.md"

echo "=== Phase 58 cvsz apps merge validation ==="
echo
echo "--- refreshing offline merge plan ---"
python3 scripts/apps/plan-cvsz-apps-merge.py --json-out "$PLAN_JSON" --report-out "$PLAN_MD"
echo

python3 - "$CONFIG" "$PLAN_JSON" <<'PY'
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Iterable


ROOT = Path.cwd()
CONFIG = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
PLAN = json.loads(Path(sys.argv[2]).read_text(encoding="utf-8"))
failures: list[str] = []
warnings: list[str] = []


def run(cmd: list[str]) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        cmd,
        cwd=str(ROOT),
        text=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )


def lines(cmd: list[str]) -> list[str]:
    result = run(cmd)
    return result.stdout.splitlines() if result.returncode == 0 and result.stdout else []


def check_file(path: str, executable: bool = False) -> None:
    full = ROOT / path
    if not full.is_file():
        failures.append(f"missing required file: {path}")
        return
    if executable and not full.stat().st_mode & 0o111:
        failures.append(f"required script is not executable: {path}")


def print_section(title: str) -> None:
    print(f"--- {title} ---")


def report_items(prefix: str, items: Iterable[str]) -> None:
    for item in items:
        print(f"{prefix}: {item}")


print_section("required deliverables")
check_file("configs/repos/cvsz-apps-merge-map.json")
check_file("scripts/apps/deep-dive-critical-apps.sh", executable=True)
check_file("scripts/apps/plan-cvsz-apps-merge.py", executable=True)
check_file("scripts/apps/adopt-cvsz-apps-apply.sh", executable=True)
check_file("scripts/apps/validate-cvsz-apps-merge.sh", executable=True)
check_file("docs/runbooks/CVSZ_APPS_MERGE_ADOPTION.md")
for target in [
    "critical-apps-deep-dive",
    "cvsz-apps-merge-plan",
    "cvsz-apps-merge-apply",
    "cvsz-apps-merge-validate",
    "phase58-validate",
]:
    if not re.search(rf"^{re.escape(target)}:", (ROOT / "Makefile").read_text(encoding="utf-8"), re.MULTILINE):
        failures.append(f"missing Makefile target: {target}")
if failures:
    report_items("BLOCKER", failures)
else:
    print("PASS: required Phase 58 files and Makefile targets are present")
print()

print_section("map hygiene")
apps = CONFIG.get("apps", [])
app_ids = [app.get("app_id") for app in apps]
duplicates = sorted({app for app in app_ids if app_ids.count(app) > 1})
if duplicates:
    failures.append(f"duplicate app_id entries: {', '.join(duplicates)}")
for internal in CONFIG.get("internal_apps", []):
    if internal in app_ids:
        failures.append(f"internal app must not be listed as cvsz import by default: {internal}")
if "zdash" not in CONFIG.get("protected_apps", []):
    failures.append("apps/zdash must be listed in protected_apps")
for app in apps:
    if app.get("app_id") == "zdash" and app.get("mode") != "already-integrated":
        failures.append("apps/zdash must remain mode=already-integrated")
if PLAN.get("unmapped_app_dirs"):
    failures.append(f"unmapped app dirs: {', '.join(PLAN['unmapped_app_dirs'])}")
if not any(app.get("app_id") == "ABTPi18n" and app.get("deep_dive") for app in apps):
    failures.append("ABTPi18n must be a P1 deep-dive app")
if not any(app.get("app_id") == "zkbtrader" and app.get("deep_dive") for app in apps):
    failures.append("zkbtrader must be a P1 deep-dive app")
if not failures:
    print("PASS: merge map marks internal, protected, and P1 deep-dive apps correctly")
else:
    for failure in failures:
        if "merge map" in failure or "app" in failure or "zdash" in failure or "ABTPi18n" in failure or "zkbtrader" in failure:
            print(f"BLOCKER: {failure}")
print()

print_section("nested git and import source")
nested_git = lines(["find", "apps", "-mindepth", "2", "-maxdepth", "2", "-type", "d", "-name", ".git", "-print"])
if nested_git:
    failures.append("nested .git directories remain under apps/*")
    report_items("BLOCKER", nested_git)
else:
    print("PASS: no nested .git directories found under apps/*")
for app in PLAN["apps"]:
    if app.get("mode") == "adopt-local" and app.get("exists") and not app.get("nested_git") and not app.get("import_source_exists"):
        failures.append(f"{app['app_id']} missing IMPORT_SOURCE.md")
        print(f"BLOCKER: {app['app_id']} missing IMPORT_SOURCE.md")
    if app.get("mode") == "already-integrated" and app.get("app_id") == "zdash":
        if not app.get("exists"):
            failures.append("apps/zdash missing")
            print("BLOCKER: apps/zdash missing")
        elif app.get("nested_git"):
            failures.append("apps/zdash contains nested .git")
            print("BLOCKER: apps/zdash contains nested .git")
        elif app.get("root_tracked_file_count", 0) == 0:
            failures.append("apps/zdash has no root tracked files")
            print("BLOCKER: apps/zdash has no root tracked files")
        else:
            print("PASS: apps/zdash remains integrated and root tracked")
print()

print_section("plan blockers")
for blocker in PLAN.get("plan_blockers", []):
    failures.append(blocker)
    print(f"BLOCKER: {blocker}")
for app in PLAN["apps"]:
    for blocker in app.get("blockers", []):
        failures.append(f"{app['app_id']}: {blocker}")
        print(f"BLOCKER: {app['app_id']}: {blocker}")
    for warning in app.get("warnings", []):
        warnings.append(f"{app['app_id']}: {warning}")
        print(f"WARN: {app['app_id']}: {warning}")
if not PLAN.get("plan_blockers") and all(not app.get("blockers") for app in PLAN["apps"]):
    print("PASS: no plan blockers")
print()

print_section("tracked and staged forbidden files")
forbidden_re = re.compile(
    r"(^|/)(\.env|\.env\.local|\.env\.production|\.env\.cloudflare|terraform\.tfstate|terraform\.tfstate\.backup|\.terraform\.tfstate\.lock\.info|.*\.tfstate|.*\.tfvars|.*\.tfplan|.*\.sqlite|.*\.db|.*\.log)$"
)
generated_re = re.compile(
    r"(^|/)(node_modules|\.pnpm-store|\.venv|venv|env|dist|build|\.next|\.nuxt|coverage|\.turbo|\.cache|__pycache__|\.pytest_cache|\.mypy_cache|\.ruff_cache|\.terraform)(/|$)"
)
tracked_forbidden = [path for path in lines(["git", "ls-files"]) if forbidden_re.search(path)]
tracked_generated = [path for path in lines(["git", "ls-files"]) if generated_re.search(path)]
staged = lines(["git", "diff", "--cached", "--name-only"])
staged_forbidden = [path for path in staged if forbidden_re.search(path)]
staged_generated = [path for path in staged if generated_re.search(path)]
staged_reports = [path for path in staged if path.startswith("reports/") or path.startswith("generated/") or path.startswith("docs/reports/generated/")]
if tracked_forbidden:
    failures.append("forbidden runtime/env/state files are tracked")
    report_items("BLOCKER", tracked_forbidden)
else:
    print("PASS: no forbidden runtime/env/state files are tracked")
if tracked_generated:
    failures.append("dependency/cache/build artifacts are tracked")
    report_items("BLOCKER", tracked_generated[:80])
else:
    print("PASS: no dependency/cache/build artifacts are tracked")
if staged_forbidden:
    failures.append("forbidden runtime/env/state files are staged")
    report_items("BLOCKER", staged_forbidden)
else:
    print("PASS: no forbidden runtime/env/state files are staged")
if staged_generated:
    failures.append("dependency/cache/build artifacts are staged")
    report_items("BLOCKER", staged_generated[:80])
else:
    print("PASS: no dependency/cache/build artifacts are staged")
if staged_reports:
    failures.append("generated reports are staged")
    report_items("BLOCKER", staged_reports)
else:
    print("PASS: no generated reports are staged")
print()

print_section("local forbidden and generated files")
local_forbidden_count = 0
generated_count = 0
for app in PLAN["apps"]:
    local_forbidden = app.get("forbidden_local_files", [])
    generated_dirs = app.get("generated_dirs", [])
    local_forbidden_count += len(local_forbidden)
    generated_count += len(generated_dirs)
    for path in local_forbidden[:20]:
        ignored = run(["git", "check-ignore", "-q", "--no-index", "--", path]).returncode == 0
        state = "ignored" if ignored else "NOT IGNORED"
        if not ignored:
            failures.append(f"local forbidden file is not ignored: {path}")
        print(f"INFO: {path} ({state})")
    for path in generated_dirs[:20]:
        ignored = run(["git", "check-ignore", "-q", "--no-index", "--", path]).returncode == 0
        state = "ignored" if ignored else "NOT IGNORED"
        if not ignored:
            failures.append(f"local generated/cache dir is not ignored: {path}")
        print(f"INFO: {path} ({state})")
if local_forbidden_count == 0:
    print("PASS: no local forbidden runtime files found under mapped apps")
if generated_count == 0:
    print("PASS: no local generated/dependency/cache dirs found under mapped apps")
print()

print_section("apply guard")
guard = run(["bash", "scripts/apps/adopt-cvsz-apps-apply.sh"])
if guard.returncode == 2 and "APPLY=true required" in guard.stderr:
    print("PASS: apply script refuses to run without APPLY=true")
else:
    failures.append("apply script did not enforce APPLY=true guard")
    print("BLOCKER: apply script did not enforce APPLY=true guard")
print()

if failures:
    print("cvsz apps merge validation found blockers:")
    for failure in failures:
        print(f"- {failure}")
    if warnings:
        print("warnings:")
        for warning in warnings:
            print(f"- {warning}")
    raise SystemExit(1)

if warnings:
    print("cvsz apps merge validation completed with warnings:")
    for warning in warnings:
        print(f"- {warning}")
else:
    print("PASS: cvsz apps merge validation clean")
PY
