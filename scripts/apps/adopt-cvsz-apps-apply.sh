#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

APPLY="${APPLY:-false}"
CONFIRM="${CONFIRM_CVSZ_APPS_MERGE:-no}"
CONFIG="${CONFIG:-configs/repos/cvsz-apps-merge-map.json}"

test "$APPLY" = "true" || { echo "ERROR: APPLY=true required"; exit 1; }
test "$CONFIRM" = "yes" || { echo "ERROR: CONFIRM_CVSZ_APPS_MERGE=yes required"; exit 1; }
test -f "$CONFIG" || { echo "ERROR: missing $CONFIG"; exit 1; }

if git status --short | grep -E '(^|/)(\.env|\.env\.production|\.env\.cloudflare|terraform.tfstate|.*\.tfvars|.*\.tfplan)' >/dev/null; then
  echo "ERROR: unsafe local env/state files visible in git status"
  git status --short
  exit 1
fi

BACKUP_DIR=".backups/apps-adopt/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$BACKUP_DIR"

python3 - "$CONFIG" <<'PY' > /tmp/cvsz-apps-adopt.tsv
import json
import sys
from pathlib import Path

data = json.loads(Path(sys.argv[1]).read_text())
for app in data["apps"]:
    if app["mode"] == "already-integrated":
        continue
    print(app["app_id"], app["repo"], app["target_path"], sep="\t")
PY

while IFS=$'\t' read -r app_id repo target_path; do
  [ -n "$app_id" ] || continue

  echo "=== adopting $app_id ==="

  if [ ! -d "$target_path" ]; then
    echo "WARN: missing $target_path; skip"
    continue
  fi

  if [ -d "$target_path/.git" ]; then
    origin="$(git -C "$target_path" remote get-url origin 2>/dev/null || true)"
    branch="$(git -C "$target_path" branch --show-current 2>/dev/null || true)"
    head="$(git -C "$target_path" rev-parse HEAD 2>/dev/null || true)"

    cat > "$target_path/IMPORT_SOURCE.md" <<EOF_IMPORT
# Import Source

App: $app_id
Source repository: $repo
Nested origin before adoption: ${origin:-unknown}
Nested branch before adoption: ${branch:-unknown}
Nested HEAD before adoption: ${head:-unknown}
Adopted into: cvsz/zeaz-platform
Adopted path: $target_path
Adopted at: $(date -u +%Y-%m-%dT%H:%M:%SZ)

This app is now managed by the zeaz-platform operator monorepo.
Do not reintroduce nested .git directories.
EOF_IMPORT

    tar -C "$target_path" -czf "$BACKUP_DIR/${app_id}.git.tgz" .git
    rm -rf "$target_path/.git"
    echo "removed nested git for $app_id; backup at $BACKUP_DIR/${app_id}.git.tgz"
  else
    [ -f "$target_path/IMPORT_SOURCE.md" ] || cat > "$target_path/IMPORT_SOURCE.md" <<EOF_IMPORT
# Import Source

App: $app_id
Source repository: $repo
Adopted into: cvsz/zeaz-platform
Adopted path: $target_path
Adopted at: $(date -u +%Y-%m-%dT%H:%M:%SZ)

No nested .git directory was present at adoption time.
EOF_IMPORT
  fi

  cat > "$target_path/.gitignore" <<'EOF_IGNORE'
# Local runtime and dependency artifacts
.env
.env.local
.env.production
.env.cloudflare
*.log
*.sqlite
*.db

node_modules/
.pnpm-store/
.venv/
venv/
env/

dist/
build/
.next/
.nuxt/
coverage/
.turbo/
.cache/
.pytest_cache/
.mypy_cache/
.ruff_cache/
__pycache__/

.terraform/
*.tfstate
*.tfstate.backup
*.tfvars
*.tfplan
.terraform.tfstate.lock.info

.agent/
.agents/
.gemini/
.claude/
.codex/
EOF_IGNORE

done < /tmp/cvsz-apps-adopt.tsv

rm -f /tmp/cvsz-apps-adopt.tsv

echo "PASS: adoption completed without git commit"
echo "Next:"
echo "  git status --short --untracked-files=all"
echo "  make cvsz-apps-merge-validate"
