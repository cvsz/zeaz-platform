#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

REPORT="docs/reports/generated/full-repo-audit-report.md"
JSON_REPORT="reports/platform/full-repo-audit.json"
mkdir -p "$(dirname "$REPORT")" "$(dirname "$JSON_REPORT")"

fail=0
warn=0

section() {
  echo >> "$REPORT"
  echo "## $1" >> "$REPORT"
  echo >> "$REPORT"
}

run_required() {
  local title="$1"
  shift
  section "$title"
  echo '```text' >> "$REPORT"
  set +e
  "$@" >> "$REPORT" 2>&1
  local rc=$?
  set -e
  echo '```' >> "$REPORT"
  echo >> "$REPORT"
  if [ "$rc" -eq 0 ]; then
    echo "Result: PASS" >> "$REPORT"
  else
    echo "Result: FAIL rc=$rc" >> "$REPORT"
    fail=1
  fi
}

run_optional() {
  local title="$1"
  shift
  section "$title"
  echo '```text' >> "$REPORT"
  set +e
  "$@" >> "$REPORT" 2>&1
  local rc=$?
  set -e
  echo '```' >> "$REPORT"
  echo >> "$REPORT"
  if [ "$rc" -eq 0 ]; then
    echo "Result: PASS" >> "$REPORT"
  else
    echo "Result: WARN rc=$rc" >> "$REPORT"
    warn=1
  fi
}

json_escape() {
  python3 -c 'import json,sys; print(json.dumps(sys.stdin.read()))'
}

write_header() {
  cat > "$REPORT" <<EOF_REPORT
# ZeaZ Platform full repository audit report

Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)
Repository: cvsz/zeaz-platform
Mode: local read-only audit

This audit is designed for final-release and go-live evidence. It does not deploy, mutate Cloudflare, rotate tokens, apply Terraform, delete files, run live trading, or execute social automation.

## Audit scope

- Git repository status and tracked-file hygiene
- Makefile release gates
- Generated source review and app inventory reports
- App ports, domains, and route assets
- Secret/state/log tracking risk
- Nested repositories and local env files
- Terraform/OpenTofu formatting and validation when tools are available
- Build/go-live verification wrappers when dependencies are available

EOF_REPORT
}

write_repo_inventory() {
  section "Repository inventory"
  local tracked_count app_count script_count report_count workflow_count
  tracked_count="$(git ls-files | wc -l | tr -d ' ')"
  app_count="$(find apps -mindepth 1 -maxdepth 1 -type d 2>/dev/null | wc -l | tr -d ' ')"
  script_count="$(find scripts -type f 2>/dev/null | wc -l | tr -d ' ')"
  report_count="$(find reports docs/reports -type f 2>/dev/null | wc -l | tr -d ' ')"
  workflow_count="$(find .github/workflows -type f \( -name '*.yml' -o -name '*.yaml' \) 2>/dev/null | wc -l | tr -d ' ')"

  cat >> "$REPORT" <<EOF_REPORT
| Metric | Value |
|---|---:|
| Tracked files | ${tracked_count} |
| App directories | ${app_count} |
| Script files | ${script_count} |
| Report files | ${report_count} |
| GitHub workflow files | ${workflow_count} |

EOF_REPORT
}

write_forbidden_tracked_files() {
  section "Forbidden tracked release files"
  echo '```text' >> "$REPORT"
  local forbidden
  forbidden="$(git ls-files | grep -E '(^|/)(\.env|\.env\.local|\.env\.production|\.env\.cloudflare|.*\.tfstate|.*\.tfstate\.backup|.*\.tfvars|.*\.tfplan|.*\.sqlite|.*\.db|.*\.log|id_rsa|id_ed25519|.*\.pem|.*\.key)$' || true)"
  if [ -n "$forbidden" ]; then
    echo "$forbidden" >> "$REPORT"
    fail=1
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: FAIL - forbidden tracked release files exist" >> "$REPORT"
  else
    echo "PASS: no forbidden tracked secrets/state/log/key files" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: PASS" >> "$REPORT"
  fi
}

write_nested_git_check() {
  section "Nested Git directory check"
  echo '```text' >> "$REPORT"
  local nested
  nested="$(find . -path './.git' -prune -o -type d -name .git -print 2>/dev/null || true)"
  if [ -n "$nested" ]; then
    echo "$nested" >> "$REPORT"
    warn=1
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: WARN - nested Git metadata found; vendor/import policy review required" >> "$REPORT"
  else
    echo "PASS: no nested Git directories" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: PASS" >> "$REPORT"
  fi
}

write_local_env_check() {
  section "Local env file check"
  echo '```text' >> "$REPORT"
  local env_files
  env_files="$(find . -path './.git' -prune -o -type f \( -name '.env' -o -name '.env.*' \) ! -name '*.example' -print 2>/dev/null || true)"
  if [ -n "$env_files" ]; then
    echo "$env_files" >> "$REPORT"
    warn=1
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: WARN - local env files exist; confirm they are untracked and chmod 600" >> "$REPORT"
  else
    echo "PASS: no non-example env files discovered" >> "$REPORT"
    echo '```' >> "$REPORT"
    echo >> "$REPORT"
    echo "Result: PASS" >> "$REPORT"
  fi
}

write_todo_summary() {
  section "Incomplete marker summary"
  echo '```text' >> "$REPORT"
  grep -RInE '\b(TODO|FIXME|HACK|XXX|BUG|TBD|INCOMPLETE|PLACEHOLDER)\b' \
    --exclude-dir=.git \
    --exclude-dir=node_modules \
    --exclude-dir=.venv \
    --exclude-dir=venv \
    --exclude-dir=.terraform \
    --exclude-dir=dist \
    --exclude-dir=build \
    --exclude-dir=.next \
    --exclude='*.min.js' \
    . 2>/dev/null | head -n 250 >> "$REPORT" || true
  echo '```' >> "$REPORT"
  echo >> "$REPORT"
  echo "Result: INFO - review listed markers before production sign-off" >> "$REPORT"
}

write_source_review_summary() {
  section "Apps source review summary"
  if [ -f reports/platform/apps-source-review.json ]; then
    python3 - <<'PY' >> "$REPORT"
import json
from pathlib import Path
p = Path('reports/platform/apps-source-review.json')
data = json.loads(p.read_text())
print(f"Generated: {data.get('generated_at')}")
print(f"Apps scanned: {data.get('app_count')}")
print(f"Critical count: {data.get('critical_count')}")
print()
print('| App | Stack | Critical | Warnings | Findings |')
print('|---|---|---:|---:|---|')
for app in data.get('apps', []):
    findings = app.get('findings', [])
    critical = sum(1 for f in findings if f.get('severity') == 'critical')
    warnings = sum(1 for f in findings if f.get('severity') == 'warn')
    notes = ', '.join(f"{f.get('severity')}:{f.get('code')}" for f in findings[:8]) or '-'
    stack = ', '.join(app.get('stack') or [])
    print(f"| `{app.get('app_id')}` | `{stack}` | {critical} | {warnings} | {notes} |")
PY
  else
    echo "No reports/platform/apps-source-review.json found. Run: python3 scripts/platform/review-apps-source.py" >> "$REPORT"
    warn=1
  fi
}

write_final_decision() {
  section "Final audit decision"
  if [ "$fail" -eq 0 ]; then
    echo "Status: AUDIT COMPLETED" >> "$REPORT"
  else
    echo "Status: AUDIT BLOCKED" >> "$REPORT"
  fi
  echo >> "$REPORT"
  if [ "$warn" -ne 0 ]; then
    echo "Warnings were found. Review warning sections before final go-live." >> "$REPORT"
    echo >> "$REPORT"
  fi
  echo "Next command for release evidence:" >> "$REPORT"
  echo >> "$REPORT"
  echo '```bash' >> "$REPORT"
  echo 'bash scripts/platform/final-go-live-complete.sh' >> "$REPORT"
  echo '```' >> "$REPORT"
}

write_json_summary() {
  python3 - <<PY
import json
from pathlib import Path
summary = {
  "repository": "cvsz/zeaz-platform",
  "generated_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "report": "$REPORT",
  "status": "AUDIT_BLOCKED" if $fail else "AUDIT_COMPLETED",
  "warnings_present": bool($warn),
}
Path("$JSON_REPORT").write_text(json.dumps(summary, indent=2) + "\n")
PY
}

write_header
write_repo_inventory
run_required "Git diff whitespace check" git diff --check
run_required "Makefile audit" python3 scripts/make/audit-makefile.py Makefile
run_optional "Repository deep-dive report generator" bash scripts/repo/deep-dive-report.sh
run_optional "Apps source review generator" python3 scripts/platform/review-apps-source.py
run_optional "Apps stack deep-dive generator" python3 scripts/platform/deep-dive-apps-stack.py
run_optional "Apps port refactor asset generator" python3 scripts/platform/generate-port-refactor-assets.py
run_optional "Apps routing asset generator" python3 scripts/platform/generate-apps-routing-assets.py
run_optional "Terraform recursive format check" terraform fmt -check -recursive terraform opentofu
run_optional "Cloudflare apps Terraform validate" bash -lc 'cd terraform/cloudflare-apps && terraform init -backend=false && terraform validate'
run_optional "Safe build all stacks" bash scripts/platform/build-all-stacks.sh
write_forbidden_tracked_files
write_nested_git_check
write_local_env_check
write_todo_summary
write_source_review_summary
write_final_decision
write_json_summary

echo "PASS: wrote $REPORT"
echo "PASS: wrote $JSON_REPORT"

if [ "$fail" -ne 0 ]; then
  echo "ERROR: full repo audit found blocking failures"
  exit 1
fi

echo "PASS: full repo audit completed"
