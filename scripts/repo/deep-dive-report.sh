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
    -o -type d -print | sort | head -200
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
