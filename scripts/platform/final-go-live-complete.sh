#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="reports/platform/final-go-live-complete.md"
mkdir -p "$(dirname "$REPORT")"

fail=0
warn=0

run_block() {
  local mode="$1"
  local title="$2"
  shift 2

  echo "## ${title}" >> "$REPORT"
  echo >> "$REPORT"
  echo '```text' >> "$REPORT"
  set +e
  "$@" >> "$REPORT" 2>&1
  local rc=$?
  set -e
  echo '```' >> "$REPORT"
  echo >> "$REPORT"

  if [ "$rc" -eq 0 ]; then
    echo "PASS: ${title}"
    echo "Result: PASS" >> "$REPORT"
  elif [ "$mode" = "required" ]; then
    echo "FAIL: ${title} rc=${rc}"
    echo "Result: FAIL rc=${rc}" >> "$REPORT"
    fail=1
  else
    echo "WARN: ${title} rc=${rc}"
    echo "Result: WARN rc=${rc}" >> "$REPORT"
    warn=1
  fi
  echo >> "$REPORT"
}

write_header() {
  cat > "$REPORT" <<EOF_REPORT
# ZeaZ Platform final go-live completion report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Repository: cvsz/zeaz-platform
Mode: read-only final-release verifier

This verifier does not deploy, mutate Cloudflare, rotate tokens, run live trading, run social automation, or apply Terraform.
It is designed to prove whether the repository is ready for final release and to leave a complete audit artifact.

## Required release gates

- Git diff whitespace check
- Makefile audit
- Apps source review report generation
- Apps port and routing asset generation
- Cloudflare apps Terraform formatting/validation when local Terraform and credentials are available
- Safe stack build/check pass when dependencies are installed
- Forbidden tracked secrets/state artifact check
- Final release evidence summary

EOF_REPORT
}

write_forbidden_files_check() {
  echo "## Forbidden tracked files" >> "$REPORT"
  echo >> "$REPORT"
  echo '```text' >> "$REPORT"
  local forbidden
  forbidden="$(git ls-files | grep -E '(^|/)(\.env|\.env\.local|\.env\.production|\.env\.cloudflare|.*\.tfstate|.*\.tfstate\.backup|.*\.tfvars|.*\.tfplan|.*\.sqlite|.*\.db|.*\.log|id_rsa|id_ed25519)$' || true)"
  if [ -n "$forbidden" ]; then
    echo "$forbidden" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: FAIL - forbidden tracked release files exist" >> "$REPORT"
    fail=1
  else
    echo "PASS: no forbidden tracked release files" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: PASS" >> "$REPORT"
  fi
  echo >> "$REPORT"
}

write_source_review_summary() {
  echo "## Apps source review summary" >> "$REPORT"
  echo >> "$REPORT"
  if [ -f reports/platform/apps-source-review.json ]; then
    python3 - <<'PY' >> "$REPORT" 2>&1 || true
import json
from pathlib import Path
p = Path('reports/platform/apps-source-review.json')
data = json.loads(p.read_text())
print(f"Generated: {data.get('generated_at')}")
print(f"Apps scanned: {data.get('app_count')}")
print(f"Critical count: {data.get('critical_count')}")
print()
print('| App | Critical | Warnings | Notes |')
print('|---|---:|---:|---|')
for app in data.get('apps', []):
    findings = app.get('findings', [])
    critical = sum(1 for f in findings if f.get('severity') == 'critical')
    warnings = sum(1 for f in findings if f.get('severity') == 'warn')
    notes = ', '.join(f"{f.get('severity')}:{f.get('code')}" for f in findings[:6]) or '-'
    print(f"| `{app.get('app_id')}` | {critical} | {warnings} | {notes} |")
PY
  else
    echo "No reports/platform/apps-source-review.json generated yet." >> "$REPORT"
    warn=1
  fi
  echo >> "$REPORT"
}

write_final_decision() {
  echo "## Final release decision" >> "$REPORT"
  echo >> "$REPORT"
  if [ "$fail" -eq 0 ]; then
    echo "Status: GO-LIVE GATES PASSED" >> "$REPORT"
    echo >> "$REPORT"
    echo "The repository passed required read-only release gates in this verifier. Review warnings before production DNS cutover." >> "$REPORT"
  else
    echo "Status: GO-LIVE BLOCKED" >> "$REPORT"
    echo >> "$REPORT"
    echo "One or more required gates failed. Do not perform production DNS cutover or Terraform apply until failures are resolved." >> "$REPORT"
  fi
  echo >> "$REPORT"
  if [ "$warn" -ne 0 ]; then
    echo "Warnings were recorded. They do not block this verifier unless promoted to required checks by the release owner." >> "$REPORT"
    echo >> "$REPORT"
  fi
  echo "Report path: $REPORT" >> "$REPORT"
}

write_header

run_block required "git diff whitespace check" git diff --check
run_block required "Makefile audit" python3 scripts/make/audit-makefile.py Makefile
run_block required "apps source review" python3 scripts/platform/review-apps-source.py
run_block required "apps port refactor assets" python3 scripts/platform/generate-port-refactor-assets.py
run_block optional "apps routing assets" python3 scripts/platform/generate-apps-routing-assets.py
run_block optional "Cloudflare apps Terraform format check" bash -lc 'cd terraform/cloudflare-apps && terraform fmt -check'
run_block optional "Cloudflare apps Terraform validate" bash -lc 'cd terraform/cloudflare-apps && terraform init -backend=false && terraform validate'
run_block optional "safe build all stacks" bash scripts/platform/build-all-stacks.sh
run_block optional "active local origin check" bash scripts/platform/check-port-origins.sh
write_forbidden_files_check
write_source_review_summary
write_final_decision

echo "PASS: wrote $REPORT"
if [ "$fail" -ne 0 ]; then
  echo "ERROR: final go-live verifier blocked release"
  exit 1
fi

echo "PASS: final go-live verifier completed"
