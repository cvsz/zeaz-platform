#!/usr/bin/env bash
# check-wrangler-examples.sh
# Phase 6: Read-only scanner for Wrangler example file hygiene.
# Detects exact copies, placeholder drift, unsafe values.
# No API calls. No modifications.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

# Colors
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

log_info()  { echo -e "${CYAN}[INFO]${NC}  $*" >&2; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ---------- Help ----------
show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Check Wrangler example file hygiene across the repository.

Detects:
  - Exact copies of wrangler.toml into wrangler.example.toml
  - Example files containing real-looking IDs, tokens, secrets
  - Missing example files for live wrangler.toml files
  - Placeholder drift between live and example files
  - Unsafe route definitions in examples

Read-only. No API calls. No modifications.

Options:
  --help          Show this help message and exit
  --strict        Exit non-zero when unsafe examples found

Exit codes:
  0   Clean
  1   Unsafe examples found (with --strict)
  2   Error during scan
EOF
}

# ---------- Parse ----------
STRICT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)   show_help; exit 0 ;;
    --strict) STRICT=true ;;
    *)        log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

# ---------- Scan ----------
log_info "Checking Wrangler example file hygiene..."

SCAN_START=$(date +%s)

declare -a wrangler_files=()
while IFS= read -r -d '' f; do
  wrangler_files+=("$f")
done < <(
  find "$REPO_ROOT" \
    -path '*/node_modules' -prune -o \
    -path '*/.git' -prune -o \
    -path '*/.venv' -prune -o \
    -path '*/.backup' -prune -o \
    -path '*/.terraform' -prune -o \
    -path '*/.wrangler' -prune -o \
    -type f -name 'wrangler*.toml' \
    -print0 2>/dev/null || true
)

declare -a issues=()

# Check for real-looking values in example files
UNSAFE_PATTERNS=(
  'account_id\s*=\s*"[0-9a-f]{32}"'
  'zone_id\s*=\s*"[0-9a-f]{32}"'
  'id\s*=\s*"[0-9a-f]{32}"'
  'token\s*=\s*"'
  'secret\s*=\s*"'
  'api_key\s*=\s*"'
  'password\s*=\s*"'
)

for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"

  # Only check example files for unsafe values
  if [[ "$rel" == *.example* ]]; then
    for pattern in "${UNSAFE_PATTERNS[@]}"; do
      while IFS= read -r line; do
        [[ -z "$line" ]] && continue
        # Skip if it's a placeholder or zeroed ID
        if echo "$line" | grep -qE 'REPLACE_|PLACEHOLDER|example|00000000-|000000000000'; then
          continue
        fi
        if echo "$line" | grep -qE '(account_id|zone_id)\s*=\s*"'$; then
          continue
        fi
        issues+=("UNSAFE_VALUE:$rel:$line")
      done < <(grep -oE "$pattern" "$f" 2>/dev/null || true)
    done
  fi
done

# Check for exact copies
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" != *.example* ]] && continue

  # Try to find corresponding live file
  live_candidates=()
  base="${rel%.example}"
  if [[ -f "$REPO_ROOT/$base" ]]; then
    live_candidates+=("$base")
  fi
  base2="${rel%.example.toml}.toml"
  if [[ -f "$REPO_ROOT/$base2" ]]; then
    live_candidates+=("$base2")
  fi

  for live in "${live_candidates[@]}"; do
    if diff -q "$REPO_ROOT/$live" "$f" &>/dev/null; then
      issues+=("EXACT_COPY:$live → $rel")
    fi
  done
done

# Check for missing example files
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" == *.example* ]] && continue

  # Check if example exists
  ex_candidates=("${rel}.example" "${rel%.toml}.example.toml")
  found=false
  for ex in "${ex_candidates[@]}"; do
    if [[ -f "$REPO_ROOT/$ex" ]]; then
      found=true
      break
    fi
  done
  if [[ "$found" == false ]]; then
    issues+=("MISSING_EXAMPLE:$rel")
  fi
done

# Check for unsafe route definitions in examples
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" != *.example* ]] && continue

  if grep -qE 'route\s*=\s*"' "$f" 2>/dev/null; then
    while IFS= read -r line; do
      if echo "$line" | grep -qE 'route\s*=\s*".*zeaz\.dev' && ! echo "$line" | grep -qE 'PLACEHOLDER|example\.'; then
        issues+=("UNSAFE_ROUTE:$rel:$line")
      fi
    done < <(grep -E 'route\s*=\s*"' "$f" 2>/dev/null || true)
  fi
done

# Check for placeholder drift
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" != *.example* ]] && continue

  live=""
  base="${rel%.example}"
  [[ -f "$REPO_ROOT/$base" ]] && live="$base"
  [[ -z "$live" ]] && base2="${rel%.example.toml}.toml" && [[ -f "$REPO_ROOT/$base2" ]] && live="$base2"
  [[ -z "$live" ]] && continue

  # Check that example has placeholders where live has real values
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^id\s*=\s*"' && ! echo "$line" | grep -qE '00000000'; then
      # Live has a real-looking ID — check that example has a placeholder
      ex_line=$(grep -E '^id\s*=' "$REPO_ROOT/$live" 2>/dev/null || true)
      if echo "$ex_line" | grep -qE '^id\s*=\s*"' && ! echo "$ex_line" | grep -qE '00000000'; then
        issues+=("PLACEHOLDER_DRIFT:$rel:id differs from live but both have real-looking values")
      fi
    fi
  done < "$f" 2>/dev/null || true
done

SCAN_DURATION=$(($(date +%s) - SCAN_START))
ISSUE_COUNT=${#issues[@]}

# Categorize issues
declare -a exact=()
declare -a missing=()
declare -a unsafe_val=()
declare -a unsafe_route=()
declare -a drift=()

for issue in "${issues[@]}"; do
  case "$issue" in
    EXACT_COPY:*)    exact+=("${issue#EXACT_COPY:}") ;;
    MISSING_EXAMPLE:*) missing+=("${issue#MISSING_EXAMPLE:}") ;;
    UNSAFE_VALUE:*)  unsafe_val+=("${issue#UNSAFE_VALUE:}") ;;
    UNSAFE_ROUTE:*)  unsafe_route+=("${issue#UNSAFE_ROUTE:}") ;;
    PLACEHOLDER_DRIFT:*) drift+=("${issue#PLACEHOLDER_DRIFT:}") ;;
  esac
done

# ---------- Output ----------
echo ""
echo "========== Wrangler Example Checker =========="
echo "  Scan completed in ${SCAN_DURATION}s"
echo "  Files scanned: ${#wrangler_files[@]}"
echo ""

if [[ "$ISSUE_COUNT" -eq 0 ]]; then
  log_ok "All wrangler examples are clean."
else
  echo "--- Issues Found: $ISSUE_COUNT ---"
  echo ""

  if [[ ${#exact[@]} -gt 0 ]]; then
    echo "  Exact copies (${#exact[@]}):"
    for e in "${exact[@]}"; do log_warn "  $e"; done
    echo ""
  fi
  if [[ ${#missing[@]} -gt 0 ]]; then
    echo "  Missing examples (${#missing[@]}):"
    for m in "${missing[@]}"; do log_warn "  $m"; done
    echo ""
  fi
  if [[ ${#unsafe_val[@]} -gt 0 ]]; then
    echo "  Unsafe values in examples (${#unsafe_val[@]}):"
    for v in "${unsafe_val[@]}"; do log_error "  $v"; done
    echo ""
  fi
  if [[ ${#unsafe_route[@]} -gt 0 ]]; then
    echo "  Unsafe routes in examples (${#unsafe_route[@]}):"
    for r in "${unsafe_route[@]}"; do log_error "  $r"; done
    echo ""
  fi
  if [[ ${#drift[@]} -gt 0 ]]; then
    echo "  Placeholder drift (${#drift[@]}):"
    for d in "${drift[@]}"; do log_warn "  $d"; done
    echo ""
  fi

  if [[ ${#unsafe_val[@]} -gt 0 || ${#unsafe_route[@]} -gt 0 ]]; then
    log_error "UNSAFE: Example files contain real-looking values."
  elif [[ "$ISSUE_COUNT" -gt 0 ]]; then
    log_warn "WARNINGS: Example hygiene issues found."
  fi
fi
echo "=============================================="

# ---------- Exit ----------
if [[ "$STRICT" == true ]] && [[ "$ISSUE_COUNT" -gt 0 ]]; then
  exit 1
fi
exit 0
