#!/usr/bin/env bash
# check-secret-leaks.sh
# Phase 5: Offline scanner that detects committed or staged secret-like files.
# Scans git index and working tree for credential files, keys, tokens, env files.
# No network calls. No file modification.
set -Eeo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

# ---------- Colors ----------
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

Detect committed or staged secret-like files in the repository.

Read-only scanner. Scans both git index and working tree for:
  - Credential files (creds.json, *credentials.json)
  - Private keys (*.pem, *.key)
  - Terraform variable files (*.tfvars, *.tfvars.json)
  - Environment files (.env, .env.*)
  - Auth/token files (*.auth, *token*, *secret*)

Detection is by filename pattern only — no content inspection.

Options:
  --help        Show this help message and exit
  --strict      Exit with code 1 if any secret-like files are tracked
  --all         Show all found files (not just tracked ones)
  --json        Output in JSON format

Exit codes:
  0   No tracked secret-like files found
  1   Tracked secret-like files found (with --strict)
  2   Error during scan
EOF
}

# ---------- Parse arguments ----------
STRICT=false
SHOW_ALL=false
MODE="human"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)    show_help; exit 0 ;;
    --strict)  STRICT=true ;;
    --all)     SHOW_ALL=true ;;
    --json)    MODE="json" ;;
    *)         log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

# ---------- Patterns ----------
# Only match actual credential/secret files, not source code filenames.
SECRET_PATTERNS=(
  "creds.json"
  "credential.json"
  "*credentials.json"
  "*.pem"
  "*.key"
  "*.p12"
  "*.pfx"
  "*.tfvars"
  "*.tfvars.json"
  "*.agekey"
)

ENV_PATTERNS=(
  ".env"
  ".env.*"
  "*.env"
)

AUTH_PATTERNS=(
  "*.auth"
  "*tunnel-token*"
  "*tunnel-cred*"
)

SECRET_FILE_PATTERNS=(
  "*secret*"
  "*token*"
)

# ---------- Scan ----------
declare -a tracked_secrets=()
declare -a untracked_secrets=()
ISSUE_COUNT=0

SCAN_START=$(date +%s)

# Helper: check if a file is source code (not an actual credential file)
is_source_code() {
  local path="$1"
  case "$path" in
    *.ts|*.js|*.py|*.go|*.rs|*.css|*.scss|*.less|*.vue|*.svelte|*.php|*.java|*.rb|*.c|*.cpp|*.h|*.hpp|*.sh|*.yaml|*.yml|*.tf) return 0 ;;
    *) return 1 ;;
  esac
}

# Helper: check for explicitly whitelisted safe files
is_safe_known_file() {
  local path="$1"
  case "$path" in
    terraform/cloudflare-apps/apps.auto.tfvars.json) return 0 ;;
    scripts/cloudflare/sync-tunnel-token.sh) return 0 ;;
    *) return 1 ;;
  esac
}

# Helper: check if file is an .example variant (safe)
is_example_file() {
  local path="$1"
  case "$path" in
    *.example|*.example.*|*.bak|*.bak.*|*.md|*.png|*.jpg|*.svg|*.gif) return 0 ;;
    *) return 1 ;;
  esac
}

# Scan high-confidence secret patterns (always report)
for pattern in "${SECRET_PATTERNS[@]}" "${ENV_PATTERNS[@]}" "${AUTH_PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    rel_path="${file#$REPO_ROOT/}"
    is_example_file "$rel_path" && continue
    is_safe_known_file "$rel_path" && continue

    if git -C "$REPO_ROOT" ls-files --error-unmatch "$file" &>/dev/null 2>&1; then
      tracked_secrets+=("$rel_path")
    else
      untracked_secrets+=("$rel_path")
    fi
  done < <(
    find "$REPO_ROOT" \
      -path '*/node_modules' -prune -o \
      -path '*/.git' -prune -o \
      -path '*/.venv' -prune -o \
      -path '*/.backup' -prune -o \
      -path '*/.terraform' -prune -o \
      -type f -name "$pattern" -print0 2>/dev/null || true
  )
done

# Scan broad *secret* and *token* patterns, but exclude source code and examples
for pattern in "${SECRET_FILE_PATTERNS[@]}"; do
  while IFS= read -r -d '' file; do
    rel_path="${file#$REPO_ROOT/}"
    is_example_file "$rel_path" && continue
    is_safe_known_file "$rel_path" && continue
    is_source_code "$rel_path" && continue

    if git -C "$REPO_ROOT" ls-files --error-unmatch "$file" &>/dev/null 2>&1; then
      tracked_secrets+=("$rel_path")
    else
      untracked_secrets+=("$rel_path")
    fi
  done < <(
    find "$REPO_ROOT" \
      -path '*/node_modules' -prune -o \
      -path '*/.git' -prune -o \
      -path '*/.venv' -prune -o \
      -path '*/.backup' -prune -o \
      -path '*/.terraform' -prune -o \
      -type f -name "$pattern" -print0 2>/dev/null || true
  )
done

# Sort and deduplicate
declare -A tracked_unique
for f in "${tracked_secrets[@]}"; do
  tracked_unique["$f"]=1
done

declare -A untracked_unique
for f in "${untracked_secrets[@]}"; do
  untracked_unique["$f"]=1
done

# Remove tracked from untracked
for f in "${!tracked_unique[@]}"; do
  unset 'untracked_unique[$f]'
done

SCAN_DURATION=$(($(date +%s) - SCAN_START))

# Also check git index directly for any files that match but aren't in working tree
while IFS= read -r -d '' file; do
  rel_path="$file"
  if [[ -z "${tracked_unique[$rel_path]:-}" ]] && [[ -z "${untracked_unique[$rel_path]:-}" ]]; then
    if [[ -n "$rel_path" ]]; then
      tracked_unique["$rel_path"]=1
    fi
  fi
done < <(git -C "$REPO_ROOT" ls-files -z -- 'creds.json' '*credentials.json' '*.pem' '*.key' '*.tfvars' '.env' '*.auth' 2>/dev/null || true)

# Build output
declare -a issues=()
for f in "${!tracked_unique[@]}"; do
  issues+=("TRACKED: $f")
  ISSUE_COUNT=$((ISSUE_COUNT + 1))
done

# ---------- Output ----------
if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"scan_timestamp\": $(date +%s),"
  echo "  \"scan_duration_seconds\": $SCAN_DURATION,"
  echo "  \"tracked_count\": ${#tracked_unique[@]},"
  echo "  \"untracked_count\": ${#untracked_unique[@]},"
  echo "  \"issue_count\": $ISSUE_COUNT,"
  echo "  \"tracked_files\": ["
  first=true
  for f in $(echo "${!tracked_unique[@]}" | tr ' ' '\n' | sort); do
    $first || echo ","
    first=false
    echo -n "    \"$f\""
  done
  echo ""
  echo "  ],"
  echo "  \"untracked_files\": ["
  first=true
  for f in $(echo "${!untracked_unique[@]}" | tr ' ' '\n' | sort); do
    $first || echo ","
    first=false
    echo -n "    \"$f\""
  done
  echo ""
  echo "  ]"
  echo "}"
else
  echo ""
  echo "========== Cloudflare Secret Leak Scanner =========="
  echo "  Scan completed in ${SCAN_DURATION}s"
  echo ""

  echo "--- Tracked Secret-Like Files: ${#tracked_unique[@]} ---"
  if [[ ${#tracked_unique[@]} -eq 0 ]]; then
    log_ok "No secret-like files tracked by git."
  else
    for f in $(echo "${!tracked_unique[@]}" | tr ' ' '\n' | sort); do
      log_error "TRACKED: $f"
    done
  fi
  echo ""

  if [[ "$SHOW_ALL" == true ]]; then
    echo "--- Untracked Secret-Like Files: ${#untracked_unique[@]} ---"
    if [[ ${#untracked_unique[@]} -eq 0 ]]; then
      log_ok "No untracked secret-like files on disk."
    else
      for f in $(echo "${!untracked_unique[@]}" | tr ' ' '\n' | sort); do
        log_warn "DISK: $f (not tracked)"
      done
    fi
    echo ""
  fi

  if [[ ${#tracked_unique[@]} -eq 0 ]]; then
    log_ok "PASS: No secret files tracked in git."
  else
    log_error "FAIL: ${#tracked_unique[@]} secret-like file(s) tracked in git."
  fi
  echo "===================================================="
fi

# ---------- Exit ----------
if [[ "$STRICT" == true ]] && [[ "$ISSUE_COUNT" -gt 0 ]]; then
  exit 1
fi
exit 0
