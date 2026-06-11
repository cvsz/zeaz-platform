#!/usr/bin/env bash
# check-runtime-baseline.sh
# Phase 14: Read-only checker for Cloudflare runtime baseline evidence.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

OUTPUT_FILE="docs/infra/cloudflare-phase14-runtime-baseline.md"
LOCKFILE="docs/infra/cloudflare-phase14-ownership-lockfile.md"
DIFF_REPORT="docs/infra/cloudflare-phase14-baseline-diff-report.md"
STRICT=false
MODE="human"

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Validate that Phase 14 runtime baseline evidence exists and is structurally complete.

Options:
  --help                Show this help message
  --baseline PATH       Output markdown path (default: $OUTPUT_FILE)
  --lockfile PATH       Lockfile path (default: $LOCKFILE)
  --diff-report PATH    Diff report path (default: $DIFF_REPORT)
  --strict              Exit 1 if evidence is missing or incomplete
  --markdown            Output as markdown
  --json                Output as JSON
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --baseline) OUTPUT_FILE="$2"; shift ;;
    --lockfile) LOCKFILE="$2"; shift ;;
    --diff-report) DIFF_REPORT="$2"; shift ;;
    --strict) STRICT=true ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

declare -a ERRORS=()

# 1. Validate files exist
for file in "$OUTPUT_FILE" "$LOCKFILE" "$DIFF_REPORT"; do
  if [[ ! -f "${REPO_ROOT}/${file}" ]]; then
    ERRORS+=("Missing file: ${file}")
  fi
done

# 2. Validate Baseline scope and facts
if [[ -f "${REPO_ROOT}/${OUTPUT_FILE}" ]]; then
  content=$(cat "${REPO_ROOT}/${OUTPUT_FILE}")
  
  if ! echo "$content" | grep -q "Phase 14 does not deploy"; then
    ERRORS+=("Baseline missing required safety statement")
  fi
  
  for word in "Worker" "Tunnel" "terraform/cloudflare-apps" "workers/*/wrangler.toml" "/etc/cloudflared/config.yml"; do
    if ! echo "$content" | grep -F -q "$word"; then
      ERRORS+=("Baseline missing required ownership word: $word")
    fi
  done
  
  for host in "www.zeaz.dev" "zeaz.dev" "app.zeaz.dev" "api-*"; do
    if ! echo "$content" | grep -F -q "$host"; then
      ERRORS+=("Baseline missing required hostname: $host")
    fi
  done
fi

# 3. Validate Lockfile
if [[ -f "${REPO_ROOT}/${LOCKFILE}" ]]; then
  content=$(cat "${REPO_ROOT}/${LOCKFILE}")
  
  if ! echo "$content" | grep -q "documentation evidence only"; then
    ERRORS+=("Lockfile missing safety warning")
  fi
  
  for host in "www.zeaz.dev" "zeaz.dev" "app.zeaz.dev" "api-*.zeaz.dev"; do
    if ! echo "$content" | grep -F -q "$host"; then
      ERRORS+=("Lockfile missing required hostname: $host")
    fi
  done
fi

# 4. Validate Diff Report
if [[ -f "${REPO_ROOT}/${DIFF_REPORT}" ]]; then
  content=$(cat "${REPO_ROOT}/${DIFF_REPORT}")
  
  for status in "BASELINE_MATCH" "BASELINE_CHANGED_REVIEW_REQUIRED" "BASELINE_BLOCKED"; do
    if ! echo "$content" | grep -F -q "$status"; then
      ERRORS+=("Diff report missing status: $status")
    fi
  done
  
  for action in "no deploy" "no Terraform/OpenTofu apply" "no destroy" "no Wrangler deploy" "no Cloudflare API mutation" "no secret printing"; do
    if ! echo "$content" | grep -F -q "$action"; then
      ERRORS+=("Diff report missing non-action: $action")
    fi
  done
fi

# 5. Output
if [[ ${#ERRORS[@]} -eq 0 ]]; then
  if [[ "$MODE" == "json" ]]; then
    echo '{"status": "ok", "errors": []}'
  elif [[ "$MODE" == "markdown" ]]; then
    echo "| Phase 14 Baseline Checks | PASS | Structurally complete |"
  else
    echo "[OK] Phase 14 baseline checks passed."
  fi
  exit 0
else
  if [[ "$MODE" == "json" ]]; then
    echo '{"status": "error", "errors": ['
    first=1
    for err in "${ERRORS[@]}"; do
      if [ $first -eq 1 ]; then first=0; else echo ","; fi
      echo -n "\"$err\""
    done
    echo ']}'
  elif [[ "$MODE" == "markdown" ]]; then
    echo "| Phase 14 Baseline Checks | FAIL | Missing requirements |"
    for err in "${ERRORS[@]}"; do
      echo "- $err"
    done
  else
    echo "[FAIL] Phase 14 baseline has errors:"
    for err in "${ERRORS[@]}"; do
      echo "  - $err"
    done
  fi
  if [[ "$STRICT" == true ]]; then
    exit 1
  fi
  exit 0
fi
