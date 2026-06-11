#!/usr/bin/env bash
set -Eeuo pipefail

# generate-runtime-governance-report.sh
# Run safe scanners and write markdown reports.

show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --help      Show this help message"
  exit 0
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
cd "$REPO_ROOT" || exit 1

REPORT_FILE="docs/infra/cloudflare-runtime-governance-report.md"
BINDINGS_FILE="docs/infra/cloudflare-worker-bindings-inventory.md"
LOG_FILE="docs/infra/cloudflare-phase7-validation-log.md"

TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")
LATEST_COMMIT=$(git log -1 --oneline 2>/dev/null || echo "unknown")
GIT_STATUS=$(git status --short 2>/dev/null || echo "unknown")

mkdir -p docs/infra

# Run scanners and capture results
declare -A exit_codes
any_failure=false

run_scanner() {
  local name="$1"
  local cmd="$2"
  local out_file="$3"
  
  echo "Running $name..."
  if eval "$cmd" > "$out_file" 2>&1; then
    exit_codes["$name"]=0
  else
    exit_codes["$name"]=$?
    any_failure=true
  fi
}

run_scanner "check-secret-leaks" "infra/cloudflare/scripts/check-secret-leaks.sh --strict" "/tmp/scan_secret_leaks.txt"
run_scanner "scan-dns-ownership" "infra/cloudflare/scripts/scan-dns-ownership.sh --strict" "/tmp/scan_dns.txt"
run_scanner "scan-workers-routes" "infra/cloudflare/scripts/scan-workers-routes.sh --strict" "/tmp/scan_routes.txt"
run_scanner "check-wrangler-examples" "infra/cloudflare/scripts/check-wrangler-examples.sh --strict" "/tmp/scan_examples.txt"
run_scanner "check-no-mutation" "infra/cloudflare/scripts/check-cloudflare-no-mutation.sh --strict" "/tmp/scan_no_mutation.txt"
run_scanner "scan-runtime-governance" "infra/cloudflare/scripts/scan-runtime-governance.sh --markdown" "/tmp/scan_runtime.md"
run_scanner "scan-worker-bindings" "infra/cloudflare/scripts/scan-worker-bindings.sh --markdown" "/tmp/scan_bindings.md"

# Write docs/infra/cloudflare-worker-bindings-inventory.md
cat <<EOF > "$BINDINGS_FILE"
# Cloudflare Worker Bindings Inventory

*Generated: $TIMESTAMP*

$(cat /tmp/scan_bindings.md)
EOF

# Write docs/infra/cloudflare-phase7-validation-log.md
cat <<EOF > "$LOG_FILE"
# Phase 7 Validation Log

*Generated: $TIMESTAMP*

## Environment

**Branch:** $BRANCH
**Latest Commit:** $LATEST_COMMIT

### Git Status
\`\`\`
$GIT_STATUS
\`\`\`

## Commands Run

- \`infra/cloudflare/scripts/check-secret-leaks.sh --strict\`
- \`infra/cloudflare/scripts/scan-dns-ownership.sh --strict\`
- \`infra/cloudflare/scripts/scan-workers-routes.sh --strict\`
- \`infra/cloudflare/scripts/check-wrangler-examples.sh --strict\`
- \`infra/cloudflare/scripts/check-cloudflare-no-mutation.sh --strict\`
- \`infra/cloudflare/scripts/scan-runtime-governance.sh --markdown\`
- \`infra/cloudflare/scripts/scan-worker-bindings.sh --markdown\`

## Results

| Scanner | Exit Code | Status |
|---|---|---|
EOF

for name in "${!exit_codes[@]}"; do
  status="Pass"
  [[ "${exit_codes[$name]}" -ne 0 ]] && status="Fail"
  echo "| $name | ${exit_codes[$name]} | $status |" >> "$LOG_FILE"
done

cat <<EOF >> "$LOG_FILE"

## Failures and Accepted Known Risks

*To be filled manually if risks are accepted.*

## Manual Decisions Required

*To be filled manually.*
EOF

# Write docs/infra/cloudflare-runtime-governance-report.md
cat <<EOF > "$REPORT_FILE"
# Cloudflare Runtime Governance Report

*Phase: 7*
*Branch: $BRANCH*
*Generated: $TIMESTAMP*

## Scanner Summary

| Scanner | Exit Code |
|---|---|
EOF

for name in "${!exit_codes[@]}"; do
  echo "| $name | ${exit_codes[$name]} |" >> "$REPORT_FILE"
done

cat <<EOF >> "$REPORT_FILE"

## Runtime Governance Summary

$(cat /tmp/scan_runtime.md)

## No-Mutation Guard Summary

Exit Code: ${exit_codes["check-no-mutation"]}
See validation log for details if failed.

## Worker Bindings Summary

See [cloudflare-worker-bindings-inventory.md](cloudflare-worker-bindings-inventory.md) for full inventory.

## Ownership Risks Summary

Any failures in DNS or Route scanners highlight ownership risks.
See validation log.

## Blockers

If any strict scanner exited non-zero, this phase cannot proceed to deploy.

## Manual Actions

Review binding inventories and ensure no placeholder IDs exist before deploy.

## Validation Commands

Run \`infra/cloudflare/scripts/generate-runtime-governance-report.sh\` to regenerate this report.
EOF

# Cleanup
rm -f /tmp/scan_secret_leaks.txt /tmp/scan_dns.txt /tmp/scan_routes.txt /tmp/scan_examples.txt /tmp/scan_no_mutation.txt /tmp/scan_runtime.md /tmp/scan_bindings.md

if [[ "$any_failure" == "true" ]]; then
  echo "Some scanners failed. Report generated with warnings."
  exit 1
fi
exit 0
