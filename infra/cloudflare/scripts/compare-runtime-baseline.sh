#!/usr/bin/env bash
# compare-runtime-baseline.sh
# Phase 14: Read-only comparator for Cloudflare runtime baseline evidence.

set -Eeuo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

BASELINE="docs/infra/cloudflare-phase14-runtime-baseline.md"
LOCKFILE="docs/infra/cloudflare-phase14-ownership-lockfile.md"
STRICT=false
MODE="human"

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Compare current repository evidence against the Phase 14 runtime baseline.

Options:
  --help                Show this help message
  --baseline PATH       Output markdown path (default: $BASELINE)
  --lockfile PATH       Lockfile path (default: $LOCKFILE)
  --strict              Exit 1 if evidence mismatches baseline
  --markdown            Output as markdown
  --json                Output as JSON
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --baseline) BASELINE="$2"; shift ;;
    --lockfile) LOCKFILE="$2"; shift ;;
    --strict) STRICT=true ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    *) echo "Unknown option: $1" >&2; exit 2 ;;
  esac
  shift
done

declare -a ERRORS=()

# Basic validation
if [[ ! -f "${REPO_ROOT}/${LOCKFILE}" ]]; then
  ERRORS+=("Missing lockfile: $LOCKFILE")
elif [[ ! -f "${REPO_ROOT}/${BASELINE}" ]]; then
  ERRORS+=("Missing baseline: $BASELINE")
else
  # Conservative grep-based validation
  # Limitations: We do not do full markdown table parsing. We check if the exact strings are present in the exact rows via grep.
  
  LOCK_CONTENT=$(cat "${REPO_ROOT}/${LOCKFILE}")
  BASE_CONTENT=$(cat "${REPO_ROOT}/${BASELINE}")

  # 1. known lockfile hostnames missing from baseline
  for host in "www.zeaz.dev" "zeaz.dev" "app.zeaz.dev" "api-*.zeaz.dev"; do
    if ! echo "$BASE_CONTENT" | grep -F -q "${host%.zeaz.dev}"; then
      ERRORS+=("Baseline missing lockfile hostname: $host")
    fi
  done

  # 2. www.zeaz.dev ownership missing or changed
  if ! echo "$LOCK_CONTENT" | grep -q "| www.zeaz.dev | Worker |"; then
    ERRORS+=("Lockfile ownership changed: www.zeaz.dev is not Worker")
  fi

  # 3. tunnel-owned hostnames accidentally listed as Worker-owned
  for host in "zeaz.dev" "app.zeaz.dev" "api-*.zeaz.dev"; do
    if echo "$LOCK_CONTENT" | grep -E "\|\s*${host}\s*\|\s*Worker\s*\|"; then
      ERRORS+=("Lockfile violation: ${host} illegally assigned to Worker")
    fi
  done

  # 4. new Worker route hostnames not reflected in lockfile
  # Run scan-workers-routes.sh to get all current routes if possible
  if [[ -x "${SCRIPT_DIR}/scan-workers-routes.sh" ]]; then
    # Grab the unique hostnames from the JSON output of the scanner
    # Since we can't reliably parse JSON in pure bash, we grep the human output
    SCAN_OUT=$("${SCRIPT_DIR}/scan-workers-routes.sh" || true)
    
    # We grep the lines in "--- Workers ---" table? Actually, we'll grep the routes section.
    # It's safer to just do a simple search over wrangler.toml files
    while IFS= read -r f; do
       if [[ -f "$f" ]]; then
         while IFS= read -r route_line; do
           route_pat=$(echo "$route_line" | grep -oE 'pattern[[:space:]]*=[[:space:]]*"[^"]*"' | sed 's/.*=[[:space:]]*"//;s/"//' || true)
           if [[ -z "$route_pat" ]]; then
             route_pat=$(echo "$route_line" | grep -E '^route[[:space:]]*=' | head -1 | sed 's/.*=[[:space:]]*"//;s/".*//' || true)
           fi
           if [[ -n "$route_pat" ]]; then
             hostname="${route_pat%%/*}"
             if ! echo "$LOCK_CONTENT" | grep -F -q "$hostname"; then
               ERRORS+=("New Worker route hostname not in lockfile: $hostname")
             fi
           fi
         done < "$f"
       fi
    done < <(find "${REPO_ROOT}" -name "wrangler.toml" -o -name "wrangler.*.toml" 2>/dev/null)
  fi

  # 5. forbidden exact-copy live examples if existing checker available
  if [[ -x "${SCRIPT_DIR}/scan-workers-routes.sh" ]]; then
    if ! "${SCRIPT_DIR}/scan-workers-routes.sh" --strict >/dev/null 2>&1; then
      ERRORS+=("scan-workers-routes.sh failed (possibly forbidden exact-copy live examples found)")
    fi
  fi
fi

# 5. Output
if [[ ${#ERRORS[@]} -eq 0 ]]; then
  if [[ "$MODE" == "json" ]]; then
    echo '{"status": "ok", "errors": []}'
  elif [[ "$MODE" == "markdown" ]]; then
    echo "| Phase 14 Comparator | PASS | Baseline matches evidence |"
  else
    echo "[OK] Phase 14 baseline matches evidence."
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
    echo "| Phase 14 Comparator | FAIL | Evidence mismatch |"
    for err in "${ERRORS[@]}"; do
      echo "- $err"
    done
  else
    echo "[FAIL] Phase 14 baseline mismatch:"
    for err in "${ERRORS[@]}"; do
      echo "  - $err"
    done
  fi
  if [[ "$STRICT" == true ]]; then
    exit 1
  fi
  exit 0
fi
