#!/usr/bin/env bash
# scan-tunnel-configs.sh
# Phase 4: Read-only scanner for Cloudflare tunnel configuration files.
# Scans the repository for all tunnel-related files and reports on their status,
# duplicates, hardcoded values, and potential issues.
# Offline by default. No API calls. No destructive operations.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

# ---------- Colors ----------
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m' # No Color

# ---------- Logging ----------
log_info()  { echo -e "${CYAN}[INFO]${NC}  $*" >&2; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ---------- Help ----------
show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Scan the repository for Cloudflare tunnel configuration files and report on their status.

Read-only scanner. No API calls. No modifications.

Options:
  --help        Show this help message and exit
  --json        Output in JSON format (machine-readable)
  --verbose     Show detailed information for each file
  --check       Exit with code 1 if any issues are found

Output:
  - Total tunnel config files found
  - Classification by status (active, legacy, example, reference, sensitive)
  - Hardcoded tunnel names and credential paths
  - Duplicate hostname analysis
  - Summary of issues found

Exit codes:
  0   No issues found (or --check not specified)
  1   Issues found (only with --check)
  2   Error during scan
EOF
}

# ---------- Parse arguments ----------
MODE="human"
VERBOSE=false
CHECK=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)    show_help; exit 0 ;;
    --json)    MODE="json" ;;
    --verbose) VERBOSE=true ;;
    --check)   CHECK=true ;;
    *)         log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

# ---------- Scan functions ----------
declare -a config_files=()
ISSUE_COUNT=0

find_config_files() {
  while IFS= read -r -d '' file; do
    config_files+=("$file")
  done < <(
    find "$REPO_ROOT" \
      -path '*/node_modules' -prune -o \
      -path '*/.git' -prune -o \
      -path '*/.ops/backups*' -prune -o \
      -type f \( \
        -name 'config.yml' -o \
        -name 'ingress.yml' -o \
        -name 'compose.yaml' -o \
        -name 'docker-compose.yml' -o \
        -name 'cloudflared.service' -o \
        -name 'cloudflared-deployment.yaml' -o \
        -name 'config.yaml' -o \
        -name 'creds.json' \
      \) -print0 | sort -z
  )
}

classify_file() {
  local path="$1"
  local fname
  fname="$(basename "$path")"

  case "$path" in
    *"/infra/cloudflare/config.yml")       echo "active" ;;
    *"/infra/cloudflare/ingress.yml")      echo "active" ;;
    *"/infra/cloudflare/compose.yaml")     echo "active" ;;
    *"/infra/cloudflare/creds.json")       echo "sensitive" ;;
    *"/infrastructure/cloudflare/"*)       echo "legacy" ;;
    *"/tunnels/cloudflared/config.yml")    echo "legacy" ;;
    *"/tunnels/config/config.yml")         echo "legacy" ;;
    *"/tunnels/config.yaml")               echo "reference" ;;
    *"/tunnels/cloudflared/zeaz-platform.yml") echo "reference" ;;
    *".example")                           echo "example" ;;
    *".template.yml")                      echo "example" ;;
    *"/docker/docker-compose.yml")         echo "example" ;;
    *"/systemd/cloudflared.service")       echo "example" ;;
    *"/k8s/cloudflared-deployment.yaml")   echo "example" ;;
    *"/zLinebot/"*)                        echo "unknown" ;;
    *)                                     echo "unknown" ;;
  esac
}

check_hardcoded_tunnel_name() {
  local path="$1"
  local issues=0
  local tline
  tline=$(grep -E '^tunnel:' "$path" 2>/dev/null | head -1 || true)
  if [[ -n "$tline" ]]; then
    if [[ "$tline" != *'${'* ]]; then
      issues=$((issues + 1))
    fi
  fi
  echo "$issues"
}

check_hardcoded_cred_path() {
  local path="$1"
  local cline
  cline=$(grep -E 'credentials-file:' "$path" 2>/dev/null | head -1 || true)
  if [[ -n "$cline" ]]; then
    if [[ "$cline" != *'${'* ]]; then
      echo 1
      return
    fi
  fi
  echo 0
}

count_hostnames() {
  local path="$1"
  grep -c 'hostname:' "$path" 2>/dev/null || echo 0
}

extract_hostnames() {
  local path="$1"
  grep 'hostname:' "$path" 2>/dev/null | sed 's/.*hostname:\s*//' | sed 's/#.*//' | tr -d ' ' | sort -u
}

get_tunnel_name() {
  local path="$1"
  grep -E '^tunnel:' "$path" 2>/dev/null | head -1 | sed 's/.*tunnel:\s*//' | tr -d ' '
}

# ---------- Main scan ----------
log_info "Scanning for tunnel configuration files..."

SCAN_START=$(date +%s)

find_config_files

declare -a active_files=()
declare -a legacy_files=()
declare -a example_files=()
declare -a reference_files=()
declare -a sensitive_files=()
declare -a unknown_files=()

declare -A all_hostnames
declare -A hostname_configs

for file in "${config_files[@]}"; do
  classification="$(classify_file "$file")"
  rel_path="${file#$REPO_ROOT/}"

  case "$classification" in
    active)    active_files+=("$rel_path") ;;
    legacy)    legacy_files+=("$rel_path") ;;
    example)   example_files+=("$rel_path") ;;
    reference) reference_files+=("$rel_path") ;;
    sensitive) sensitive_files+=("$rel_path") ;;
    unknown)   unknown_files+=("$rel_path") ;;
  esac

  while IFS= read -r host; do
    [[ -z "$host" ]] && continue
    all_hostnames["$host"]=1
    if [[ -n "${hostname_configs[$host]:-}" ]]; then
      hostname_configs["$host"]="${hostname_configs[$host]}, $rel_path"
    else
      hostname_configs["$host"]="$rel_path"
    fi
  done < <(extract_hostnames "$file")
done

SCAN_DURATION=$(($(date +%s) - SCAN_START))

# ---------- Analyze issues ----------
declare -a issues=()

for file in "${config_files[@]}"; do
  rel_path="${file#$REPO_ROOT/}"
  fname="$(basename "$file")"

  if [[ "$fname" == "creds.json" ]]; then
    issues+=("SENSITIVE: $rel_path — contains tunnel credentials, committed to repo")
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
    continue
  fi

  hard_name=$(check_hardcoded_tunnel_name "$file")
  if [[ "$hard_name" -gt 0 ]]; then
    tname=$(get_tunnel_name "$file")
    issues+=("HARDCODED: $rel_path — tunnel name '$tname' should use env var")
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
  fi

  hard_cred=$(check_hardcoded_cred_path "$file")
  if [[ "$hard_cred" -gt 0 ]]; then
    issues+=("HARDCODED: $rel_path — credentials-file path should use env var")
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
  fi
done

# Find duplicate hostnames
declare -a duplicates=()
for host in "${!all_hostnames[@]}"; do
  configs="${hostname_configs[$host]}"
  count=$(echo "$configs" | tr ',' '\n' | wc -l)
  if [[ "$count" -gt 1 ]]; then
    duplicates+=("DUPLICATE: $host appears in: $configs")
    ISSUE_COUNT=$((ISSUE_COUNT + 1))
  fi
done

# ---------- Output ----------
if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"scan_timestamp\": $(date +%s),"
  echo "  \"scan_duration_seconds\": $SCAN_DURATION,"
  echo "  \"total_files\": ${#config_files[@]},"
  echo "  \"classification\": {"
  echo "    \"active\": ${#active_files[@]},"
  echo "    \"legacy\": ${#legacy_files[@]},"
  echo "    \"example\": ${#example_files[@]},"
  echo "    \"reference\": ${#reference_files[@]},"
  echo "    \"sensitive\": ${#sensitive_files[@]},"
  echo "    \"unknown\": ${#unknown_files[@]}"
  echo "  },"
  echo "  \"issue_count\": $ISSUE_COUNT,"
  echo "  \"issues\": ["
  for i in "${!issues[@]}"; do
    comma=","
    [[ $i -eq $((${#issues[@]} - 1)) ]] && comma=""
    echo "    \"${issues[$i]}\"$comma"
  done
  echo "  ]"
  echo "}"
else
  echo ""
  echo "========== Cloudflare Tunnel Config Scanner =========="
  echo "  Scan completed in ${SCAN_DURATION}s"
  echo "  Total files found: ${#config_files[@]}"
  echo ""

  echo "--- Classification ---"
  echo "  Active:     ${#active_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${active_files[@]}"; do echo "    $f"; done
  echo "  Legacy:     ${#legacy_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${legacy_files[@]}"; do echo "    $f"; done
  echo "  Example:    ${#example_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${example_files[@]}"; do echo "    $f"; done
  echo "  Reference:  ${#reference_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${reference_files[@]}"; do echo "    $f"; done
  echo "  Sensitive:  ${#sensitive_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${sensitive_files[@]}"; do echo "    $f"; done
  echo "  Unknown:    ${#unknown_files[@]}"
  [[ $VERBOSE == true ]] && for f in "${unknown_files[@]}"; do echo "    $f"; done
  echo ""

  echo "--- Issues Found: $ISSUE_COUNT ---"
  if [[ ${#issues[@]} -eq 0 ]]; then
    log_ok "No issues found."
  else
    for issue in "${issues[@]}"; do
      log_warn "$issue"
    done
  fi
  echo ""

  echo "--- Duplicate Hostnames ---"
  if [[ ${#duplicates[@]} -eq 0 ]]; then
    echo "  (none)"
  else
    for dup in "${duplicates[@]}"; do
      echo "  $dup"
    done
  fi
  echo ""

  echo "======================================================"
fi

# ---------- Exit code ----------
if [[ "$CHECK" == true ]]; then
  if [[ "$ISSUE_COUNT" -gt 0 ]]; then
    exit 1
  fi
fi
