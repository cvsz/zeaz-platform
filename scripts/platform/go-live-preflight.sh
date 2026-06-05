#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="reports/platform/go-live-preflight.md"
mkdir -p "$(dirname "$REPORT")"

fail=0
warn=0

cat > "$REPORT" <<REPORT_EOF
# Go live preflight report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)

Read-only gate. No deploy, no Terraform apply, no Cloudflare mutation, no token rotation, no live trading/social automation.

REPORT_EOF

section() {
  echo >> "$REPORT"
  echo "## $1" >> "$REPORT"
  echo >> "$REPORT"
}

run_required() {
  local name="$1"
  shift
  section "$name"
  echo '```text' >> "$REPORT"

  set +e
  "$@" >> "$REPORT" 2>&1
  local rc=$?
  set -e

  echo '```' >> "$REPORT"

  if [ "$rc" -eq 0 ]; then
    echo "PASS: $name"
  else
    echo "FAIL: $name rc=$rc"
    fail=1
  fi
}

run_optional() {
  local name="$1"
  shift
  section "$name"
  echo '```text' >> "$REPORT"

  set +e
  "$@" >> "$REPORT" 2>&1
  local rc=$?
  set -e

  echo '```' >> "$REPORT"

  if [ "$rc" -eq 0 ]; then
    echo "PASS: $name"
  else
    echo "WARN: $name rc=$rc"
    warn=1
  fi
}

run_required "git diff check" git diff --check
run_required "apps source review strict" make apps-source-review-strict
run_required "apps port refactor generate" make apps-port-refactor-generate
run_required "terraform cloudflare apps validate" make tf-cloudflare-apps-validate

run_optional "build all stacks safe" make build-all-stacks
run_optional "apps port origin check" make apps-port-origin-check

section "forbidden tracked files"
echo '```text' >> "$REPORT"
forbidden="$(git ls-files | grep -E '(^|/)(\.env|\.env\.local|\.env\.production|\.env\.cloudflare|.*\.tfstate|.*\.tfvars|.*\.tfplan|.*\.sqlite|.*\.db|.*\.log)$' || true)"
if [ -n "$forbidden" ]; then
  echo "$forbidden" >> "$REPORT"
  echo "FAIL: forbidden tracked files" >> "$REPORT"
  fail=1
else
  echo "PASS: no forbidden tracked files" >> "$REPORT"
fi
echo '```' >> "$REPORT"

section "git status"
echo '```text' >> "$REPORT"
git status --short >> "$REPORT" 2>&1 || true
echo '```' >> "$REPORT"

echo "PASS: wrote $REPORT"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: go-live preflight failed"
  exit 1
fi

if [ "$warn" -ne 0 ]; then
  echo "WARN: go-live preflight passed required checks with warnings"
  exit 0
fi

echo "PASS: go-live preflight clean"
