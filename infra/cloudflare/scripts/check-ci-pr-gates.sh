#!/usr/bin/env bash
# check-ci-pr-gates.sh
# Phase 10: Check PR workflows and scripts for mutation commands

set -Eeuo pipefail

MODE="markdown"
STRICT=false

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Static scanner for checking workflows and scripts for dangerous commands.

Options:
  --help          Show this help message
  --markdown      Output as markdown
  --json          Output as JSON
  --strict        Exit 1 if violations found
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --strict) STRICT=true ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

declare -a findings=()
violation_found=false

check_file() {
  local file="$1"
  local in_pr_workflow=false
  local in_push_workflow=false
  local is_workflow=false

  if [[ "$file" == .github/workflows/*.yml ]] || [[ "$file" == .github/workflows/*.yaml ]]; then
    is_workflow=true
    if grep -qE '^on:.*pull_request:' "$file" || grep -A 5 '^on:' "$file" | grep -q 'pull_request:'; then
      in_pr_workflow=true
    fi
    if grep -qE '^on:.*push:' "$file" || grep -A 5 '^on:' "$file" | grep -q 'push:'; then
      in_push_workflow=true
    fi
  fi

  while IFS= read -r line; do
    if echo "$line" | grep -qE 'wrangler[[:space:]]+deploy'; then
      if [[ "$is_workflow" == true ]] && { [[ "$in_pr_workflow" == true ]] || [[ "$in_push_workflow" == true ]]; }; then
        findings+=("$file|wrangler deploy in PR/push workflow|wrangler deploy not allowed in CI|remove")
        violation_found=true
      fi
    fi
    if echo "$line" | grep -qE 'terraform[[:space:]]+apply|tofu[[:space:]]+apply'; then
      if [[ "$is_workflow" == true ]] && [[ "$in_pr_workflow" == true ]]; then
        findings+=("$file|terraform/tofu apply in PR workflow|mutating infrastructure not allowed in PR|remove")
        violation_found=true
      fi
    fi
    if echo "$line" | grep -qE 'terraform[[:space:]]+destroy|tofu[[:space:]]+destroy'; then
      if [[ "$is_workflow" == true ]] && [[ "$in_pr_workflow" == true ]]; then
        findings+=("$file|terraform/tofu destroy in PR workflow|destroying infrastructure not allowed in PR|remove")
        violation_found=true
      fi
    fi
    if echo "$line" | grep -qE 'cloudflared[[:space:]]+tunnel[[:space:]]+route[[:space:]]+dns'; then
      if [[ "$is_workflow" == true ]] && { [[ "$in_pr_workflow" == true ]] || [[ "$in_push_workflow" == true ]]; }; then
        findings+=("$file|cloudflared tunnel route dns in CI|mutating dns not allowed in CI|remove")
        violation_found=true
      fi
    fi
    if echo "$line" | grep -qE 'api\.cloudflare\.com' && echo "$line" | grep -qE 'POST|PUT|PATCH|DELETE'; then
      if [[ "$is_workflow" == true ]] && { [[ "$in_pr_workflow" == true ]] || [[ "$in_push_workflow" == true ]]; }; then
        findings+=("$file|Cloudflare write API in CI|mutating API not allowed in CI|remove")
        violation_found=true
      fi
    fi
    if [[ "$is_workflow" == true ]] && echo "$line" | grep -qE 'branches:.*master'; then
      findings+=("$file|master branch trigger|default branch is main|change to main")
      violation_found=true
    fi
    if [[ "$is_workflow" == true ]] && echo "$line" | grep -qE 'continue-on-error:[[:space:]]*true'; then
      findings+=("$file|continue-on-error: true|security gates must not soft-fail|remove or isolate")
      violation_found=true
    fi
  done < "$file"
}

export -f check_file

while IFS= read -r -d '' file; do
  check_file "$file"
done < <(find .github/workflows -type f \( -name "*.yml" -o -name "*.yaml" \) -print0 2>/dev/null || true)

if [[ "$MODE" == "markdown" ]]; then
  echo "| File | Violation | Reason | Recommendation |"
  echo "|---|---|---|---|"
  for f in "${findings[@]}"; do
    IFS='|' read -r file violation reason rec <<< "$f"
    echo "| $file | $violation | $reason | $rec |"
  done
elif [[ "$MODE" == "json" ]]; then
  echo "["
  first=true
  for f in "${findings[@]}"; do
    IFS='|' read -r file violation reason rec <<< "$f"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "file": "$file",
    "violation": "$violation",
    "reason": "$reason",
    "recommendation": "$rec"
  }
EOF
  done
  echo "]"
fi

if [[ "$STRICT" == true ]] && [[ "$violation_found" == true ]]; then
  exit 1
fi
exit 0
