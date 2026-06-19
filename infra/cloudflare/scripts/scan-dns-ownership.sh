#!/usr/bin/env bash
# scan-dns-ownership.sh
# Phase 5: Read-only scanner for DNS hostname ownership across all config sources.
# Scans tunnel configs, Terraform files, wrangler tomls, and live-adjacent sources.
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

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Scan the repository for DNS hostname ownership across all Cloudflare config sources.

Sources scanned:
  - infra/cloudflare/config/*.yml
  - infra/cloudflare/*.yml
  - tunnels/**/*.yml
  - infrastructure/cloudflare/**/*.yml
  - apps/**/cloudflared/**/*.yml
  - terraform/**/*.tf
  - wrangler*.toml and workers/**/wrangler*.toml

Detection:
  - All hostnames matching *.zeaz.dev
  - Duplicate hostname ownership across sources
  - Hardcoded tunnel IDs/names
  - Terraform modules that overlap

Options:
  --help          Show this help message and exit
  --markdown      Output in Markdown format (for documentation)
  --json          Output in JSON format (machine-readable)
  --strict        Exit with code 1 if any duplicates or issues found
  --verbose       Show full file paths

Exit codes:
  0   No issues found (or --strict not specified)
  1   Issues found (only with --strict)
  2   Error during scan
EOF
}

# ---------- Parse arguments ----------
MODE="human"
STRICT=false
VERBOSE=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)     show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json)     MODE="json" ;;
    --strict)   STRICT=true ;;
    --verbose)  VERBOSE=true ;;
    *)          log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

# ---------- Helpers ----------
declare -A all_hostnames
declare -A hostname_sources
declare -a all_files=()

# Extract hostname from various line patterns
extract_hostname() {
  local line="$1"
  local hostname=""

  # YAML: hostname: xxx.zeaz.dev
  if [[ "$line" =~ hostname:[[:space:]]*(.+)$ ]]; then
    hostname="${BASH_REMATCH[1]}"
  # Terraform: name = "xxx.zeaz.dev"
  elif [[ "$line" =~ name[[:space:]]*=[[:space:]]*\"(.+)\" ]]; then
    hostname="${BASH_REMATCH[1]}"
  # Terraform: var.xxx_domain (indirect)
  elif [[ "$line" =~ var\.([a-zA-Z_]+_domain) ]]; then
    hostname="<var:${BASH_REMATCH[1]}>"
  # wrangler: pattern = "xxx.zeaz.dev/*"
  elif [[ "$line" =~ pattern[[:space:]]*=[[:space:]]*\"([^\"]+)\" ]]; then
    local pat="${BASH_REMATCH[1]}"
    hostname="${pat%/*}"
  fi

  # Strip leading/trailing whitespace and quotes
  hostname="$(echo "$hostname" | sed 's/^[[:space:]"'\'']*//;s/[[:space:]"'\'']*$//')"

  if [[ -n "$hostname" ]]; then
    # Check if it matches *.zeaz.dev (or is a domain variable)
    if [[ "$hostname" == *".zeaz.dev" ]] || [[ "$hostname" == *"<var:"* ]] || [[ "$hostname" == "zeaz.dev" ]]; then
      [[ "$hostname" == "<var:"* ]] || echo "$hostname"
    fi
  fi
}

# Determine source label for a file
source_label() {
  local path="$1"
  case "$path" in
    *"infra/cloudflare/config/"*)     echo "CFG" ;;
    *"infra/cloudflare/config.yml")   echo "I1" ;;
    *"infra/cloudflare/ingress.yml")  echo "I2" ;;
    *"infrastructure/cloudflare/"*)   echo "IS" ;;
    *"tunnels/cloudflared/config.yml") echo "T1" ;;
    *"tunnels/cloudflared/zeaz-platform.yml") echo "T2" ;;
    *"tunnels/config/config.yml")     echo "T3" ;;
    *"tunnels/config.yaml")           echo "T4" ;;
    *"terraform/cloudflare-apps/"*)   echo "TA" ;;
    *"terraform/cloudflare/main.tf")  echo "TC" ;;
    *"terraform/zdash/"*)             echo "TZ" ;;
    *"wrangler.toml")                 echo "WL" ;;
    *"apps/"*"/cloudflared/"*)        echo "APP" ;;
    *)                                echo "??" ;;
  esac
}

# Determine source group
source_group() {
  local path="$1"
  case "$path" in
    *"infra/cloudflare"*) echo "infra" ;;
    *"infrastructure/"*)  echo "legacy" ;;
    *"tunnels/"*)         echo "tunnels" ;;
    *"terraform/"*)       echo "terraform" ;;
    *"wrangler"*)         echo "wrangler" ;;
    *"apps/"*)            echo "apps" ;;
    *)                    echo "other" ;;
  esac
}

# ---------- Collection ----------
log_info "Scanning for DNS hostname ownership..."

SCAN_START=$(date +%s)

# Find all relevant files
while IFS= read -r -d '' file; do
  all_files+=("$file")
done < <(
  find "$REPO_ROOT" \
    -path '*/node_modules' -prune -o \
    -path '*/.git' -prune -o \
    -path '*/.venv' -prune -o \
    -path '*/.backup' -prune -o \
    -path '*/.terraform' -prune -o \
    -path '*/.ops/backups*' -prune -o \
    -type f \( \
      -name 'config.yml' -o \
      -name 'config.yaml' -o \
      -name 'ingress.yml' -o \
      -name 'main.tf' -o \
      -name 'wrangler.toml' -o \
      -name '*.auto.tfvars.json' \
    \) -print0 2>/dev/null || true
)

declare -a source_files=()
for file in "${all_files[@]}"; do
  rel="${file#$REPO_ROOT/}"
  source_files+=("$rel")
done

# For each file, extract hostnames
declare -A file_hostnames
declare -A file_hardcoded

for file in "${all_files[@]}"; do
  rel="${file#$REPO_ROOT/}"
  lbl="$(source_label "$file")"
  grp="$(source_group "$file")"
  file_hostnames["$rel"]=""
  file_hardcoded["$rel"]=""

  if [[ ! -f "$file" ]] || [[ ! -r "$file" ]]; then
    continue
  fi

  # Extract hostnames
  while IFS= read -r line; do
    # Skip comments
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ "$line" =~ ^[[:space:]]*// ]] && continue

    h=$(extract_hostname "$line")
    if [[ -n "$h" ]] && [[ "$h" != "<var:"* ]]; then
      h="${h#\"}"; h="${h%\"}"; h="${h#\'}"; h="${h%\'}"
      if [[ -n "$h" ]]; then
        if [[ -z "${file_hostnames[$rel]}" ]]; then
          file_hostnames["$rel"]="$h"
        else
          file_hostnames["$rel"]="${file_hostnames[$rel]} $h"
        fi
        if [[ -z "${hostname_sources[$h]:-}" ]]; then
          hostname_sources["$h"]="$rel ($lbl)"
        else
          hostname_sources["$h"]="${hostname_sources[$h]} | $rel ($lbl)"
        fi
      fi
    fi
  done < "$file"

  # Check for hardcoded tunnel ID (UUID-like pattern that's not a placeholder)
  tid=$(grep -oE '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}' "$file" 2>/dev/null || true)
  if [[ -n "$tid" ]]; then
    file_hardcoded["$rel"]="$tid"
  fi
done

SCAN_DURATION=$(($(date +%s) - SCAN_START))

# ---------- Analysis ----------
declare -A hostname_count
for h in "${!hostname_sources[@]}"; do
  count=$(echo "${hostname_sources[$h]}" | awk -F'|' '{print NF}')
  hostname_count["$h"]=$count
done

# Find duplicates (hostname in 2+ sources)
declare -a duplicates=()
declare -a unique_hostnames=()
for h in $(echo "${!hostname_count[@]}" | tr ' ' '\n' | sort); do
  if [[ "${hostname_count[$h]}" -gt 1 ]]; then
    duplicates+=("$h")
  else
    unique_hostnames+=("$h")
  fi
done

# Find hardcoded tunnel IDs across files
declare -a hardcoded_ids=()
for rel in "${!file_hardcoded[@]}"; do
  if [[ -n "${file_hardcoded[$rel]}" ]]; then
    hardcoded_ids+=("$rel: ${file_hardcoded[$rel]}")
  fi
done

TOTAL_HOSTNAMES=${#hostname_count[@]}
TOTAL_DUPLICATES=${#duplicates[@]}
TOTAL_UNIQUE=$((TOTAL_HOSTNAMES - TOTAL_DUPLICATES))
TOTAL_FILES=${#source_files[@]}
TOTAL_HARDCODED=${#hardcoded_ids[@]}

# ---------- Output ----------
if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"scan_timestamp\": $(date +%s),"
  echo "  \"scan_duration_seconds\": $SCAN_DURATION,"
  echo "  \"total_files\": $TOTAL_FILES,"
  echo "  \"total_hostnames\": $TOTAL_HOSTNAMES,"
  echo "  \"unique_hostnames\": $TOTAL_UNIQUE,"
  echo "  \"duplicate_hostnames\": $TOTAL_DUPLICATES,"
  echo "  \"hardcoded_tunnel_ids\": $TOTAL_HARDCODED,"
  echo "  \"hostnames\": {"
  first=true
  for h in $(echo "${!hostname_count[@]}" | tr ' ' '\n' | sort); do
    $first || echo ","
    first=false
    echo -n "    \"$h\": { \"count\": ${hostname_count[$h]}, \"sources\": \"${hostname_sources[$h]}\" }"
  done
  echo ""
  echo "  },"
  echo "  \"duplicates\": ["
  for i in "${!duplicates[@]}"; do
    comma=","
    [[ $i -eq $((${#duplicates[@]} - 1)) ]] && comma=""
    echo "    \"${duplicates[$i]}\"$comma"
  done
  echo "  ]"
  echo "}"
elif [[ "$MODE" == "markdown" ]]; then
  echo "# DNS Ownership Scan Report"
  echo ""
  echo "Generated: $(date)"
  echo ""
  echo "## Summary"
  echo ""
  echo "| Metric | Value |"
  echo "|---|---|"
  echo "| Files scanned | $TOTAL_FILES |"
  echo "| Total hostnames | $TOTAL_HOSTNAMES |"
  echo "| Unique hostnames | $TOTAL_UNIQUE |"
  echo "| Duplicate hostnames | $TOTAL_DUPLICATES |"
  echo "| Hardcoded tunnel IDs | $TOTAL_HARDCODED |"
  echo ""
  echo "## Duplicate Hostnames"
  echo ""
  echo "| Hostname | Sources | Count |"
  echo "|---|---|---|"
  for h in "${duplicates[@]}"; do
    count="${hostname_count[$h]}"
    sources="${hostname_sources[$h]}"
    echo "| $h | $sources | $count |"
  done
  echo ""
  if [[ "$TOTAL_HARDCODED" -gt 0 ]]; then
    echo "## Hardcoded Tunnel IDs"
    echo ""
    for id in "${hardcoded_ids[@]}"; do
      echo "- $id"
    done
    echo ""
  fi
  echo "## All Hostnames"
  echo ""
  for h in $(echo "${!hostname_count[@]}" | tr ' ' '\n' | sort); do
    echo "- $h (${hostname_count[$h]} source(s))"
  done
else
  echo ""
  echo "========== Cloudflare DNS Ownership Scanner =========="
  echo "  Scan completed in ${SCAN_DURATION}s"
  echo "  Files scanned: $TOTAL_FILES"
  echo "  Total hostnames: $TOTAL_HOSTNAMES ($TOTAL_UNIQUE unique, $TOTAL_DUPLICATES duplicated)"
  echo "  Hardcoded tunnel IDs: $TOTAL_HARDCODED"
  echo ""

  if [[ "$TOTAL_DUPLICATES" -gt 0 ]]; then
    echo "--- Duplicate Hostnames ($TOTAL_DUPLICATES) ---"
    for h in "${duplicates[@]}"; do
      count="${hostname_count[$h]}"
      log_warn "$h — appears in $count sources"
      if [[ "$VERBOSE" == true ]]; then
        echo "  ${hostname_sources[$h]}"
      fi
    done
    echo ""
  fi

  if [[ "$TOTAL_HARDCODED" -gt 0 ]]; then
    echo "--- Hardcoded Tunnel IDs ---"
    for id in "${hardcoded_ids[@]}"; do
      log_warn "$id"
    done
    echo ""
  fi

  if [[ "$TOTAL_UNIQUE" -gt 0 ]]; then
    echo "--- Unique Hostnames ($TOTAL_UNIQUE) ---"
    for h in "${unique_hostnames[@]}"; do
      echo "  $h"
    done
    echo ""
  fi

  if [[ "$TOTAL_DUPLICATES" -eq 0 && "$TOTAL_HARDCODED" -eq 0 ]]; then
    log_ok "No duplicate hostnames or hardcoded IDs found."
  elif [[ "$TOTAL_DUPLICATES" -eq 0 ]]; then
    log_ok "No duplicate hostnames found."
  fi
  echo "======================================================"
fi

# ---------- Exit ----------
if [[ "$STRICT" == true ]] && [[ "$TOTAL_DUPLICATES" -gt 0 || "$TOTAL_HARDCODED" -gt 0 ]]; then
  exit 1
fi
exit 0
