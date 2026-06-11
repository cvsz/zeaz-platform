#!/usr/bin/env bash
# check-release-readiness.sh
# Phase 11: Check Release Readiness

set -Eeuo pipefail

MODE="markdown"
STRICT=false
OUTPUT=""
NO_LIVE=true

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Read-only release gate that runs all available Cloudflare policy scanners.

Options:
  --help                 Show this help message
  --strict               Exit non-zero if not ready
  --json                 Output as JSON
  --markdown             Output as markdown
  --output <path>        Write output to file
  --no-live              Default mode: no live API calls
  --allow-live-readonly  Allow live comparison (requires tokens)
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --strict) STRICT=true ;;
    --json) MODE="json" ;;
    --markdown) MODE="markdown" ;;
    --output) OUTPUT="$2"; shift ;;
    --no-live) NO_LIVE=true ;;
    --allow-live-readonly) NO_LIVE=false ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

total_checks=0
passed_checks=0
failed_checks=0
declare -a warnings=()
declare -a check_results=()

run_check() {
  local name="$1"
  local cmd="$2"
  total_checks=$((total_checks + 1))
  
  if eval "$cmd" > /dev/null 2>&1; then
    passed_checks=$((passed_checks + 1))
    check_results+=("$name|PASS")
  else
    failed_checks=$((failed_checks + 1))
    check_results+=("$name|FAIL")
  fi
}

run_check "Secret Leak Scan" "infra/cloudflare/scripts/check-secret-leaks.sh --strict"
run_check "DNS Ownership Scan" "infra/cloudflare/scripts/scan-dns-ownership.sh --strict"
run_check "Workers Routes Scan" "infra/cloudflare/scripts/scan-workers-routes.sh --strict"
run_check "Wrangler Examples Scan" "infra/cloudflare/scripts/check-wrangler-examples.sh --strict"
run_check "CI PR Gates Check" "infra/cloudflare/scripts/check-ci-pr-gates.sh --strict"
run_check "PR Cloudflare Scope Check" "infra/cloudflare/scripts/check-pr-cloudflare-scope.sh --strict"
run_check "Cloudflare Config Validation" "infra/cloudflare/scripts/validate-cloudflare-config.sh --check --secrets --workers"
run_check "Workflow Policy Check" "bash scripts/workflow-policy.sh"

status="READY"
if [[ $failed_checks -gt 0 ]]; then
  status="NOT READY"
fi

generate_markdown() {
  echo "# Cloudflare Release Readiness Report"
  echo "Status: **$status**"
  echo ""
  echo "Total checks: $total_checks"
  echo "Passed checks: $passed_checks"
  echo "Failed checks: $failed_checks"
  echo "Warnings: ${#warnings[@]}"
  if [[ -n "$OUTPUT" ]]; then
    echo "Evidence report path: $OUTPUT"
  fi
  echo ""
  echo "## Check Results"
  echo "| Check | Status |"
  echo "|-------|--------|"
  for res in "${check_results[@]}"; do
    IFS='|' read -r name result <<< "$res"
    echo "| $name | $result |"
  done
  echo ""
  echo "## Confirmed non-actions"
  echo "- No wrangler deploy executed."
  echo "- No Terraform/OpenTofu apply executed."
  echo "- No Terraform/OpenTofu destroy executed."
  echo "- No Cloudflare write API executed."
  echo "- No secrets printed."
}

generate_json() {
  cat <<EOF
{
  "status": "$status",
  "total_checks": $total_checks,
  "passed_checks": $passed_checks,
  "failed_checks": $failed_checks,
  "warnings": ${#warnings[@]},
  "evidence_report_path": "$OUTPUT",
  "confirmed_non_actions": [
    "No wrangler deploy executed.",
    "No Terraform/OpenTofu apply executed.",
    "No Terraform/OpenTofu destroy executed.",
    "No Cloudflare write API executed.",
    "No secrets printed."
  ]
}
EOF
}

if [[ "$MODE" == "markdown" ]]; then
  if [[ -n "$OUTPUT" ]]; then
    generate_markdown > "$OUTPUT"
  else
    generate_markdown
  fi
elif [[ "$MODE" == "json" ]]; then
  if [[ -n "$OUTPUT" ]]; then
    generate_json > "$OUTPUT"
  else
    generate_json
  fi
fi

if [[ "$STRICT" == true ]] && [[ "$status" == "NOT READY" ]]; then
  exit 1
fi
exit 0
