#!/usr/bin/env bash
set -Eeuo pipefail

mkdir -p scripts/make scripts/repo docs/reports/generated .backups/makefile

cat > scripts/make/audit-makefile.py <<'PY'
#!/usr/bin/env python3
from __future__ import annotations

import re
import sys
from collections import defaultdict
from pathlib import Path

path = Path(sys.argv[1] if len(sys.argv) > 1 else "Makefile")
text = path.read_text()
lines = text.splitlines()

target_re = re.compile(r"^([A-Za-z0-9_.-]+(?:\s+[A-Za-z0-9_.-]+)*)\s*:(?![=])")
targets: dict[str, list[int]] = defaultdict(list)

for i, line in enumerate(lines, 1):
    if line.startswith("\t") or ":=" in line or "?=" in line or "+=" in line or "=" in line.split(":", 1)[0]:
        continue
    m = target_re.match(line)
    if not m:
        continue
    for target in m.group(1).split():
        targets[target].append(i)

duplicates = {k: v for k, v in targets.items() if len(v) > 1}

issues: list[str] = []

for target, locs in sorted(duplicates.items()):
    issues.append(f"duplicate target {target}: lines {', '.join(map(str, locs))}")

if text.count("sync-cloudflare-env-files.sh") > 1:
    issues.append("token/env sync helper appears more than once; check token-rotate recipe")

if text.count("# zDash Cloudflare Terraform Integration") > 1:
    issues.append("duplicate zDash Cloudflare Terraform Integration header")

if re.search(r"^\.PHONY: .{500,}$", text, re.M):
    issues.append("very large global .PHONY line; prefer grouped .PHONY declarations near sections")

print("Makefile audit")
print(f"- file: {path}")
print(f"- targets: {len(targets)}")
print(f"- duplicate targets: {len(duplicates)}")
print(f"- issues: {len(issues)}")

if issues:
    print()
    for issue in issues:
        print(f"ISSUE: {issue}")
    raise SystemExit(1)

print("PASS: Makefile audit clean")
PY
chmod +x scripts/make/audit-makefile.py

cat > scripts/make/refactor-root-makefile.py <<'PY'
#!/usr/bin/env python3
from __future__ import annotations

import re
import shutil
from datetime import datetime, timezone
from pathlib import Path

root = Path.cwd()
makefile = root / "Makefile"
backup_dir = root / ".backups" / "makefile"
backup_dir.mkdir(parents=True, exist_ok=True)

stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
backup = backup_dir / f"Makefile.{stamp}.bak"
shutil.copy2(makefile, backup)

text = makefile.read_text()

# Remove duplicate token rotate env sync call.
duplicate_sync = (
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
)
single_sync = (
    '\t@bash scripts/cloudflare/sync-cloudflare-env-files.sh "$${TOKEN_ROTATE_OUT:-$(TOKEN_ROTATE_OUT)}" "$${TOKEN_ROTATE_SYNC_ENV:-$(TOKEN_ROTATE_SYNC_ENV)}"\n'
)
text = text.replace(duplicate_sync, single_sync)

# Remove duplicate adjacent zDash Terraform section header.
text = re.sub(
    r"(# =============================================================================\n# zDash Cloudflare Terraform Integration\n# =============================================================================\n\n)"
    r"# =============================================================================\n# zDash Cloudflare Terraform Integration\n# =============================================================================\n\n",
    r"\1",
    text,
    count=1,
)

# Normalize excessive blank lines around late Cloudflare targets.
text = re.sub(r"\n{3,}(\.PHONY: cf-zdash-token-diagnose)", r"\n\n\1", text)
text = re.sub(r"\n{3,}(\.PHONY: cf-zdash-sync-env)", r"\n\n\1", text)

block = r'''

# =============================================================================
# Phase 55 — Repository deep-dive and Makefile hygiene
# =============================================================================

.PHONY: repo-deep-dive makefile-audit makefile-refactor
repo-deep-dive: ## Generate full repository deep-dive report
	@bash scripts/repo/deep-dive-report.sh

makefile-audit: ## Audit root Makefile for duplicate targets and risky patterns
	@$(PYTHON) scripts/make/audit-makefile.py Makefile

makefile-refactor: ## Re-run safe root Makefile cleanup
	@$(PYTHON) scripts/make/refactor-root-makefile.py
	@$(PYTHON) scripts/make/audit-makefile.py Makefile
'''

if "repo-deep-dive:" not in text:
    text = text.rstrip() + block + "\n"

makefile.write_text(text)
print(f"PASS: refactored Makefile")
print(f"Backup: {backup}")
PY
chmod +x scripts/make/refactor-root-makefile.py

cat > scripts/repo/deep-dive-report.sh <<'EOF_REPORT'
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="docs/reports/generated/repo-deep-dive-report.md"
mkdir -p "$(dirname "$REPORT")"

redact() {
  sed -E 's/(TOKEN|SECRET|PASSWORD|KEY|PASSPHRASE|DATABASE_URL)=([^[:space:]]+)/\1=<redacted>/g'
}

{
  echo "# zeaz-platform repository deep-dive report"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "## Git"
  echo
  echo '```text'
  git status -sb || true
  echo '```'
  echo
  echo "## Top-level layout"
  echo
  echo '```text'
  find . -maxdepth 2 \
    \( -path './.git' -o -path './node_modules' -o -path './apps/zdash/frontend/node_modules' -o -path './apps/zdash/backend/.venv' \) -prune \
    -o -maxdepth 2 -type d -print | sort | head -200
  echo '```'
  echo
  echo "## Makefile audit"
  echo
  echo '```text'
  python3 scripts/make/audit-makefile.py Makefile 2>&1 || true
  echo '```'
  echo
  echo "## Make targets"
  echo
  echo '```text'
  grep -nE '^[A-Za-z0-9_.-]+([[:space:]]+[A-Za-z0-9_.-]+)*:' Makefile | head -260
  echo '```'
  echo
  echo "## zDash integration"
  echo
  echo '```text'
  test -d apps/zdash && echo "apps/zdash: present" || echo "apps/zdash: missing"
  test -f apps/zdash/docker-compose.prod.yml && echo "apps/zdash/docker-compose.prod.yml: present" || true
  test -f apps/zdash/Makefile && echo "apps/zdash/Makefile: present" || true
  echo '```'
  echo
  echo "## Cloudflare/Terraform files"
  echo
  echo '```text'
  find terraform configs/cloudflare generated/cloudflare scripts/cloudflare -maxdepth 3 -type f 2>/dev/null | sort | head -300
  echo '```'
  echo
  echo "## Stale references"
  echo
  echo '```text'
  git grep -nE 'zdash-api\.zeaz\.dev|/opt/zdash|localhost:8000|REPLACE_WITH_ZEAZ_DEV_ZONE_ID|REPLACE_WITH_TUNNEL_UUID' -- . 2>/dev/null | redact || true
  echo '```'
  echo
  echo "## Forbidden tracked runtime files"
  echo
  echo '```text'
  git ls-files | grep -E '(^|/)(\.env|\.env\.production|\.env\.cloudflare|terraform\.tfstate|.*\.tfvars|.*\.tfplan)$' || true
  echo '```'
  echo
  echo "## Docker compose inventory"
  echo
  echo '```text'
  find . -name 'docker-compose*.yml' -o -name 'compose.yml' | sort
  echo '```'
  echo
  echo "## Workflow inventory"
  echo
  echo '```text'
  find .github/workflows -maxdepth 1 -type f -name '*.yml' -o -name '*.yaml' 2>/dev/null | sort || true
  echo '```'
} > "$REPORT"

echo "PASS: wrote $REPORT"
EOF_REPORT
chmod +x scripts/repo/deep-dive-report.sh

python3 scripts/make/refactor-root-makefile.py || true
