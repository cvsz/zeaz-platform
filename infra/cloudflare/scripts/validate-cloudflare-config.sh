#!/usr/bin/env bash
# validate-cloudflare-config.sh
# Phase 5: Offline validation of Cloudflare tunnel configuration files.
# Checks for: malformed YAML, missing env vars, hardcoded values,
# duplicate hostnames, credential file safety, secret leak detection,
# canonical config presence, required placeholder variables.
# No API calls. No destructive operations.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
readonly CONFIG_DIR="${REPO_ROOT}/infra/cloudflare"

# ---------- Colors ----------
readonly RED='\033[0;31m'
readonly GREEN='\033[0;32m'
readonly YELLOW='\033[1;33m'
readonly CYAN='\033[0;36m'
readonly NC='\033[0m'

# ---------- Logging ----------
log_info()  { echo -e "${CYAN}[INFO]${NC}  $*" >&2; }
log_ok()    { echo -e "${GREEN}[OK]${NC}    $*" >&2; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC}  $*" >&2; }
log_error() { echo -e "${RED}[ERROR]${NC} $*" >&2; }

# ---------- Help ----------
show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS] [CONFIG_FILE...]

Validate Cloudflare tunnel configuration files.

Offline validation. No API calls. Checks:
  - File existence and readability
  - YAML structure (basic validation)
  - Missing or malformed env var references
  - Hardcoded tunnel names and credential paths
  - Duplicate hostnames within a config
  - Credential file safety

Options:
  --help        Show this help message and exit
  --check       Exit with code 1 if any validation errors are found
  --verbose     Show detailed validation output
  --json        Output results in JSON format
  --secrets     Also run secret leak detection

If no CONFIG_FILE is specified, validates all configs under infra/cloudflare/.

Exit codes:
  0   Validation passed (or --check not specified with warnings)
  1   Validation errors found (only with --check)
  2   Error during validation
EOF
}

# ---------- Parse arguments ----------
MODE="human"
VERBOSE=false
CHECK=false
CHECK_SECRETS=false
TARGET_FILES=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)    show_help; exit 0 ;;
    --check)   CHECK=true ;;
    --verbose) VERBOSE=true ;;
    --json)    MODE="json" ;;
    --secrets) CHECK_SECRETS=true ;;
    -*)
      log_error "Unknown option: $1"
      show_help
      exit 2
      ;;
    *)
      TARGET_FILES+=("$1")
      ;;
  esac
  shift
done

# ---------- Helpers ----------
declare -a errors=()
declare -a warnings=()
declare -a passes=()

validate_env_var_refs() {
  local file="$1"
  local issues=0

  # Check for ${VAR} patterns that are well-formed
  while IFS= read -r line; do
    # Skip comments
    [[ "$line" =~ ^[[:space:]]*# ]] && continue

    # Check for empty env var references like ${} or ${
    if [[ "$line" =~ \$\{\s*\} ]]; then
      warnings+=("$file: empty env var reference")
      issues=$((issues + 1))
    fi

    # Check for malformed env var syntax like ${VAR (missing closing brace)
    if [[ "$line" =~ \$\{[A-Za-z_][A-Za-z0-9_]*$ ]]; then
      errors+=("$file: malformed env var (missing closing brace): $line")
      issues=$((issues + 1))
    fi
  done < "$file"

  echo "$issues"
}

validate_hardcoded_values() {
  local file="$1"
  local issues=0

  # Check for hardcoded tunnel names
  local tline
  tline=$(grep -E '^tunnel:' "$file" 2>/dev/null | head -1 || true)
  if [[ -n "$tline" ]] && [[ "$tline" != *'${'* ]]; then
    local tname
    tname=$(echo "$tline" | sed 's/.*tunnel:\s*//')
    warnings+=("$file: hardcoded tunnel name '$tname' — should use env var (${VAR})")
    issues=$((issues + 1))
  fi

  # Check for hardcoded credential paths
  local cline
  cline=$(grep -E 'credentials-file:' "$file" 2>/dev/null | head -1 || true)
  if [[ -n "$cline" ]] && [[ "$cline" != *'${'* ]]; then
    local cpath
    cpath=$(echo "$cline" | sed 's/.*credentials-file:\s*//')
    warnings+=("$file: hardcoded credential path '$cpath' — should use env var (${VAR})")
    issues=$((issues + 1))
  fi

  echo "$issues"
}

validate_yaml_structure() {
  local file="$1"
  local issues=0

  # Check if file starts with a top-level key
  if ! grep -qE '^[a-zA-Z]' "$file" 2>/dev/null; then
    errors+=("$file: no top-level keys found (empty or malformed)")
    issues=$((issues + 1))
  fi

  # Check for ingress section
  if ! grep -qE '^ingress:' "$file" 2>/dev/null; then
    if grep -qE '^tunnel:' "$file" 2>/dev/null; then
      errors+=("$file: has 'tunnel:' but no 'ingress:' section")
      issues=$((issues + 1))
    fi
  fi

  # Check ingress rules have service (not just hostname)
  if grep -qE 'hostname:' "$file" 2>/dev/null; then
    local hostname_count
    hostname_count=$(grep -cE 'hostname:' "$file" 2>/dev/null || echo 0)
    local service_count
    service_count=$(grep -cE 'service:' "$file" 2>/dev/null || echo 0)

    # Account for catch-all (service without hostname)
    # Expected: service count >= hostname count (each hostname has a service, plus catch-all)
    if [[ "$service_count" -lt "$hostname_count" ]]; then
      errors+=("$file: $hostname_count hostnames but only $service_count services — missing service entries")
      issues=$((issues + 1))
    fi

    # Check for duplicate hostnames
    local duplicates
    duplicates=$(grep -E 'hostname:' "$file" | sed 's/.*hostname:\s*//' | tr -d ' ' | sort | uniq -d)
    if [[ -n "$duplicates" ]]; then
      while IFS= read -r dup; do
        [[ -z "$dup" ]] && continue
        errors+=("$file: duplicate hostname '$dup'")
        issues=$((issues + 1))
      done <<< "$duplicates"
    fi
  fi

  echo "$issues"
}

validate_creds_file() {
  local issues=0
  local creds_path="${CONFIG_DIR}/creds.json"

  if [[ -f "$creds_path" ]]; then
    if git -C "$REPO_ROOT" ls-files --error-unmatch "$creds_path" &>/dev/null 2>&1; then
      errors+=("$creds_path: tracked by git — sensitive credentials committed!")
      issues=$((issues + 1))
    fi

    if [[ -s "$creds_path" ]]; then
      warnings+=("$creds_path: exists on disk with content — ensure .gitignore protects it")
      issues=$((issues + 1))
    fi
  fi

  echo "$issues"
}

# Phase 5: Secret file detection
validate_no_tracked_secrets() {
  local issues=0
  local patterns=("creds.json" "*credentials.json" "*.pem" "*.key" "*.tfvars" ".env" "*.auth")

  for pattern in "${patterns[@]}"; do
    while IFS= read -r -d '' file; do
      if git -C "$REPO_ROOT" ls-files --error-unmatch "$file" &>/dev/null 2>&1; then
        errors+=("$file: tracked secret file!")
        issues=$((issues + 1))
      fi
    done < <(find "$CONFIG_DIR" -type f -name "$pattern" -print0 2>/dev/null || true)
  done

  echo "$issues"
}

# Phase 5: Required placeholder variable validation
validate_required_placeholders() {
  local file="$1"
  local issues=0
  local required_vars=("CLOUDFLARE_TUNNEL_ID" "CLOUDFLARE_ACCOUNT_ID" "CLOUDFLARE_ZONE_ID")

  # Determine file type
  if grep -qE '^tunnel:' "$file" 2>/dev/null; then
    # Tunnel config — check for CLOUDFLARE_TUNNEL_ID
    if ! grep -q '\${CLOUDFLARE_TUNNEL_ID}' "$file" 2>/dev/null; then
      if grep -qE '^tunnel:' "$file" 2>/dev/null; then
        local tval
        tval=$(grep -E '^tunnel:' "$file" | head -1 | sed 's/.*tunnel:\s*//')
        if [[ -n "$tval" ]] && [[ "$tval" != *'${'* ]]; then
          warnings+=("$file: missing \${CLOUDFLARE_TUNNEL_ID} (hardcoded: $tval)")
          issues=$((issues + 1))
        fi
      fi
    fi
  fi

  # Terraform files — check for zone_id and account_id
  if [[ "$file" == *.tf ]]; then
    if ! grep -q 'var.cloudflare_zone_id' "$file" 2>/dev/null && ! grep -q 'var.zone_id' "$file" 2>/dev/null; then
      if grep -q 'cloudflare_record' "$file" 2>/dev/null; then
        warnings+=("$file: uses cloudflare_record but no var.zone_id or var.cloudflare_zone_id")
        issues=$((issues + 1))
      fi
    fi
  fi

  echo "$issues"
}

# Phase 5: Canonical YAML presence check
validate_canonical_presence() {
  local issues=0
  local canonical_dir="${CONFIG_DIR}/config"
  local expected_files=("domains.yml" "dns.yml" "tunnels.yml")

  if [[ ! -d "$canonical_dir" ]]; then
    warnings+=("${canonical_dir}: canonical config directory does not exist")
    issues=$((issues + 1))
    echo "$issues"
    return
  fi

  for f in "${expected_files[@]}"; do
    if [[ ! -f "${canonical_dir}/${f}" ]]; then
      warnings+=("${canonical_dir}/${f}: canonical config file missing")
      issues=$((issues + 1))
    fi
  done

  echo "$issues"
}

# ---------- Validation ----------
if [[ ${#TARGET_FILES[@]} -eq 0 ]]; then
  while IFS= read -r -d '' file; do
    TARGET_FILES+=("$file")
  done < <(
    find "$CONFIG_DIR" -maxdepth 2 -type f \( -name 'config.yml' -o -name 'ingress.yml' -o -name 'compose.yaml' \) -print0
  )
fi

total_errors=0
total_warnings=0

for file in "${TARGET_FILES[@]}"; do
  if [[ ! -f "$file" ]]; then
    errors+=("$file: not found")
    total_errors=$((total_errors + 1))
    continue
  fi

  if [[ ! -r "$file" ]]; then
    errors+=("$file: not readable")
    total_errors=$((total_errors + 1))
    continue
  fi

  rel_path="${file#$REPO_ROOT/}"
  log_info "Validating: $rel_path"

  yaml_issues=$(validate_yaml_structure "$file")
  env_issues=$(validate_env_var_refs "$file")
  hard_issues=$(validate_hardcoded_values "$file")

  total_issues=$((yaml_issues + env_issues + hard_issues))
  if [[ "$total_issues" -eq 0 ]]; then
    log_ok "$rel_path — valid"
    passes+=("$rel_path")
  fi

  total_errors=$((total_errors + yaml_issues + env_issues + hard_issues))
done

# Check creds file
creds_issues=$(validate_creds_file)
total_errors=$((total_errors + creds_issues))

# Phase 5: Secret detection
if [[ "$CHECK_SECRETS" == true ]]; then
  secret_issues=$(validate_no_tracked_secrets)
  total_errors=$((total_errors + secret_issues))
fi

# Phase 5: Canonical config presence
canon_issues=$(validate_canonical_presence)
total_warnings=$((total_warnings + canon_issues))

# Phase 5: Required placeholders in each target file
for file in "${TARGET_FILES[@]}"; do
  ph_issues=$(validate_required_placeholders "$file")
  total_warnings=$((total_warnings + ph_issues))
done

# ---------- Output ----------
if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"validation_timestamp\": $(date +%s),"
  echo "  \"files_validated\": ${#TARGET_FILES[@]},"
  echo "  \"errors\": $total_errors,"
  echo "  \"warnings\": ${#warnings[@]},"
  echo "  \"passed_files\": ["
  for i in "${!passes[@]}"; do
    comma=","
    [[ $i -eq $((${#passes[@]} - 1)) ]] && comma=""
    echo "    \"${passes[$i]}\"$comma"
  done
  echo "  ]"
  echo "}"
else
  echo ""
  echo "========== Cloudflare Config Validation =========="
  echo "  Files validated: ${#TARGET_FILES[@]}"
  echo ""

  if [[ ${#errors[@]} -gt 0 ]]; then
    echo "--- Errors ($total_errors) ---"
    for err in "${errors[@]}"; do
      log_error "$err"
    done
    echo ""
  fi

  if [[ ${#warnings[@]} -gt 0 ]]; then
    echo "--- Warnings (${#warnings[@]}) ---"
    for warn in "${warnings[@]}"; do
      log_warn "$warn"
    done
    echo ""
  fi

  echo "--- Passed (${#passes[@]}) ---"
  if [[ ${#passes[@]} -eq 0 ]]; then
    log_info "No files passed (all had issues)"
  else
    for pass in "${passes[@]}"; do
      log_ok "$pass"
    done
  fi
  echo ""

  if [[ "$total_errors" -eq 0 && "${#warnings[@]}" -eq 0 ]]; then
    log_ok "All validations passed."
  elif [[ "$total_errors" -eq 0 ]]; then
    log_info "Validation passed with warnings."
  else
    log_error "Validation failed with $total_errors error(s) and ${#warnings[@]} warning(s)."
  fi

  echo "================================================="
fi

# ---------- Exit code ----------
if [[ "$CHECK" == true ]]; then
  if [[ "$total_errors" -gt 0 ]]; then
    exit 1
  fi
fi
exit 0
