#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="docs/reports/generated/critical-apps-deep-dive.md"
JSON_OUT="generated/integration/critical-apps-deep-dive.json"

mkdir -p "$(dirname "$REPORT")" "$(dirname "$JSON_OUT")"

APPS=("ABTPi18n" "zkbtrader")

redact() {
  sed -E 's/(TOKEN|SECRET|PASSWORD|PASSPHRASE|API_KEY|PRIVATE_KEY|DATABASE_URL)=([^[:space:]#]+)/\1=<redacted>/g'
}

{
  echo "# Critical apps deep-dive"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "Scope:"
  echo "- apps/ABTPi18n"
  echo "- apps/zkbtrader"
  echo

  for app in "${APPS[@]}"; do
    path="apps/$app"
    echo "## $app"
    echo
    if [ ! -d "$path" ]; then
      echo "- Status: missing"
      echo
      continue
    fi

    echo "- Path: \`$path\`"
    echo "- Nested git: \`$([ -d "$path/.git" ] && echo true || echo false)\`"
    echo "- Root tracked files: \`$(git ls-files -- "$path" | wc -l | tr -d ' ')\`"
    echo "- Git status:"
    echo
    echo '```text'
    git status --short -- "$path" || true
    echo '```'
    echo

    echo "### Source metadata"
    echo
    echo '```text'
    if [ -d "$path/.git" ]; then
      git -C "$path" remote -v || true
      git -C "$path" branch --show-current || true
      git -C "$path" rev-parse --short HEAD || true
    else
      echo "no nested git"
    fi
    echo '```'
    echo

    echo "### Stack files"
    echo
    echo '```text'
    find "$path" -maxdepth 3 \
      \( -path "*/.git" -o -path "*/node_modules" -o -path "*/.venv" -o -path "*/.agent" -o -path "*/.codex" \) -prune \
      -o \( -name package.json -o -name pnpm-lock.yaml -o -name package-lock.json -o -name pyproject.toml -o -name requirements.txt -o -name Dockerfile -o -name docker-compose.yml -o -name Makefile -o -name wrangler.toml -o -name "*.tf" \) \
      -type f -print | sort
    echo '```'
    echo

    echo "### Port/domain hints"
    echo
    echo '```text'
    grep -RInE 'localhost:[0-9]{3,5}|127\.0\.0\.1:[0-9]{3,5}|[A-Za-z0-9_.-]+\.zeaz\.dev|PORT[=:]' "$path" \
      --exclude-dir=.git \
      --exclude-dir=node_modules \
      --exclude-dir=.venv \
      --exclude-dir=.agent \
      --exclude-dir=.codex \
      --exclude='*.png' \
      --exclude='*.jpg' \
      --exclude='*.gif' \
      2>/dev/null | head -160 | redact || true
    echo '```'
    echo

    echo "### Env files"
    echo
    echo '```text'
    find "$path" -type f -name '.env*' \
      -not -path '*/.git/*' \
      -not -path '*/node_modules/*' \
      -print | sort | while read -r envfile; do
        echo "$envfile"
        grep -E '^[A-Za-z_][A-Za-z0-9_]*=' "$envfile" 2>/dev/null | sed 's/=.*$/=<redacted>/' | head -80 || true
      done
    echo '```'
    echo

    echo "### Large/generated candidates"
    echo
    echo '```text'
    find "$path" \
      \( -path "*/.git" -o -path "*/node_modules" -o -path "*/.venv" -o -path "*/dist" -o -path "*/build" -o -path "*/.next" -o -path "*/coverage" \) \
      -prune -print | sort | head -120 || true
    echo '```'
    echo
  done
} > "$REPORT"

python3 - <<'PY' > "$JSON_OUT"
from pathlib import Path
import json
import subprocess

root = Path.cwd()
apps = ["ABTPi18n", "zkbtrader"]

def run(cmd, cwd=root):
    try:
        return subprocess.check_output(cmd, cwd=str(cwd), text=True, stderr=subprocess.DEVNULL).strip()
    except Exception:
        return ""

out = {"apps": []}
for app in apps:
    p = root / "apps" / app
    item = {
        "app_id": app,
        "path": f"apps/{app}",
        "exists": p.exists(),
        "nested_git": (p / ".git").exists(),
        "root_tracked_files": len(run(["git", "ls-files", "--", f"apps/{app}"]).splitlines()),
        "status": run(["git", "status", "--short", "--", f"apps/{app}"]).splitlines(),
        "remote": run(["git", "-C", str(p), "remote", "get-url", "origin"]) if (p / ".git").exists() else "",
        "branch": run(["git", "-C", str(p), "branch", "--show-current"]) if (p / ".git").exists() else "",
        "head": run(["git", "-C", str(p), "rev-parse", "--short", "HEAD"]) if (p / ".git").exists() else "",
    }
    out["apps"].append(item)

print(json.dumps(out, indent=2))
PY

echo "PASS: wrote $REPORT"
echo "PASS: wrote $JSON_OUT"
