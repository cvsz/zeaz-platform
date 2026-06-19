#!/usr/bin/env bash
set -Eeuo pipefail

# scan-terraform-cloudflare-ownership.sh
# Detects Terraform Cloudflare resources, extracts hostnames, and checks for conflicts with live runtime.

usage() {
  echo "Usage: $0 [--strict] [--json] [--markdown] [--help]"
  echo ""
  echo "Options:"
  echo "  --strict    Exit non-zero if high-risk conflicts are found."
  echo "  --json      Output results in JSON format."
  echo "  --markdown  Output results in Markdown format."
  echo "  --help      Show this help message."
}

STRICT=0
FORMAT="text"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --strict)
      STRICT=1
      shift
      ;;
    --json)
      FORMAT="json"
      shift
      ;;
    --markdown)
      FORMAT="markdown"
      shift
      ;;
    --help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      usage
      exit 1
      ;;
  esac
done

REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$REPO_ROOT"

# Fallback values if live files are inaccessible
LIVE_CONFIG="/etc/cloudflared/config.yml"
LIVE_HOSTNAMES=()

# Extract from live runtime if safely accessible read-only
if [[ -r "$LIVE_CONFIG" ]]; then
  while read -r line; do
    if [[ "$line" =~ hostname:\ +(.*) ]]; then
      live_host="${BASH_REMATCH[1]}"
      live_host="${live_host//[\"\']/}"
      LIVE_HOSTNAMES+=("$live_host")
    fi
  done < <(grep "hostname:" "$LIVE_CONFIG" || true)
fi

# Detect Terraform resources
TF_FILES=$(find terraform/ opentofu/ -type f -name "*.tf" 2>/dev/null || true)

RESOURCES=()
HOSTNAMES=()
CONFLICTS=()

for tf_file in $TF_FILES; do
  while read -r line; do
    if [[ "$line" =~ ^resource\ \"cloudflare_([a-zA-Z0-9_]+)\"\ \"([a-zA-Z0-9_]+)\" ]]; then
      rtype="cloudflare_${BASH_REMATCH[1]}"
      rname="${BASH_REMATCH[2]}"
      RESOURCES+=("$tf_file:$rtype:$rname")
    fi
  done < "$tf_file"
  
  # Very naive hostname detection in tf files for demonstration
  while read -r line; do
    if [[ "$line" =~ name\ *=\ *\"([a-zA-Z0-9.-]+\.zeaz\.dev)\" ]]; then
      host="${BASH_REMATCH[1]}"
      HOSTNAMES+=("$tf_file:$host")
      
      # Check against live runtime
      for live_host in "${LIVE_HOSTNAMES[@]:-}"; do
        if [[ "$host" == "$live_host" ]]; then
          CONFLICTS+=("Live Runtime ($LIVE_CONFIG) vs Terraform ($tf_file): $host")
        fi
      done
    fi
  done < "$tf_file"
done

# Check against repo config files if they exist
for conf in infra/cloudflare/dns.yml infra/cloudflare/tunnels.yml infra/cloudflare/workers.yml; do
  if [[ -f "$conf" ]]; then
    while read -r host; do
      for h in "${HOSTNAMES[@]:-}"; do
        tf_host="${h#*:}"
        tf_file="${h%%:*}"
        if [[ "$tf_host" == "$host" ]]; then
          CONFLICTS+=("Canonical Config ($conf) vs Terraform ($tf_file): $tf_host")
        fi
      done
    done < <(grep -oE '[a-zA-Z0-9.-]+\.zeaz\.dev' "$conf" || true)
  fi
done

if [[ "$FORMAT" == "json" ]]; then
  echo "{"
  echo "  \"resources_found\": ${#RESOURCES[@]},"
  echo "  \"hostnames_found\": ${#HOSTNAMES[@]},"
  echo "  \"conflicts\": ["
  first=1
  for conf in "${CONFLICTS[@]:-}"; do
    [[ $first -eq 0 ]] && echo "," || first=0
    echo -n "    \"$conf\""
  done
  echo ""
  echo "  ]"
  echo "}"
elif [[ "$FORMAT" == "markdown" ]]; then
  echo "========== Cloudflare Terraform Ownership Scan =========="
  echo "  Scan completed at $(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  echo "  Resources found: ${#RESOURCES[@]}"
  echo "  Hostnames found: ${#HOSTNAMES[@]}"
  echo ""
  echo "--- Conflicts (${#CONFLICTS[@]}) ---"
  if [[ ${#CONFLICTS[@]} -eq 0 ]]; then
    echo "  [OK] No high-risk conflicts found."
  else
    for conf in "${CONFLICTS[@]}"; do
      echo "  - $conf"
    done
  fi
  echo "=========================================================="
else
  echo "========== Cloudflare Terraform Ownership Scan =========="
  echo "Resources found: ${#RESOURCES[@]}"
  echo "Hostnames found: ${#HOSTNAMES[@]}"
  echo "Conflicts: ${#CONFLICTS[@]}"
  for conf in "${CONFLICTS[@]:-}"; do
    echo "  [CONFLICT] $conf"
  done
fi

if [[ $STRICT -eq 1 && ${#CONFLICTS[@]} -gt 0 ]]; then
  exit 1
fi

exit 0
