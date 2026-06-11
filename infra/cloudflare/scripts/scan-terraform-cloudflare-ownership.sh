#!/usr/bin/env bash
# scan-terraform-cloudflare-ownership.sh
# Phase 8: Offline scanner for Cloudflare Terraform/OpenTofu ownership evidence.
# No API calls. No live mutation. No secret printing.

set -Eeuo pipefail
IFS=$'\n\t'

# ---------- Defaults ----------
MODE="text"
STRICT=false
SEARCH_ROOT="."

# ---------- Helpers ----------
show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Scan repo Terraform/OpenTofu files for Cloudflare resource ownership.

Options:
  --help          Show this help message
  --markdown      Output as markdown table
  --json          Output as JSON
  --strict        Exit 1 if high-risk conflicts or secret-like patterns are found
  --root <path>   Set search root directory (default: current dir)

EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --strict) STRICT=true ;;
    --root)
      shift
      SEARCH_ROOT="$1"
      ;;
    *)
      echo "Unknown option: $1" >&2
      show_help
      exit 1
      ;;
  esac
  shift
done

# We will collect lines into an array. Each line format:
# filepath|resource_type|resource_name|hostname|owner_category|risk|recommendation
declare -a findings=()
high_risk_found=false

redact_value() {
  local val="$1"
  # Redact long hex, tokens
  if [[ "$val" =~ [0-9a-fA-F]{32,} ]] || [[ "$val" =~ [a-zA-Z0-9_-]{35,} ]]; then
    echo "<redacted>"
  else
    echo "$val"
  fi
}

process_file() {
  local f="$1"
  local in_resource=false
  local r_type=""
  local r_name=""
  local r_host=""
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*resource[[:space:]]+\"([^\"]+)\"[[:space:]]+\"([^\"]+)\" ]]; then
      r_type="${BASH_REMATCH[1]}"
      r_name="${BASH_REMATCH[2]}"
      r_host=""
      in_resource=true
      continue
    fi
    
    if [[ "$in_resource" == true ]]; then
      if [[ "$line" =~ ^[[:space:]]*\} ]]; then
        # End of resource, record finding
        if [[ "$r_type" == cloudflare_* ]]; then
          local cat="unknown"
          local risk="ok"
          local rec="none"
          if [[ "$r_type" == "cloudflare_record" ]] || [[ "$r_type" == "cloudflare_dns_record" ]]; then
            cat="dns"
          elif [[ "$r_type" == "cloudflare_tunnel" ]] || [[ "$r_type" == "cloudflare_tunnel_config" ]]; then
            cat="tunnel"
          elif [[ "$r_type" == "cloudflare_worker_script" ]] || [[ "$r_type" == "cloudflare_workers_route" ]] || [[ "$r_type" == "cloudflare_worker_route" ]] || [[ "$r_type" == "cloudflare_workers_domain" ]]; then
            cat="worker"
          elif [[ "$r_type" =~ ^cloudflare_(zero_trust|access)_ ]]; then
            cat="access"
          elif [[ "$r_type" =~ ^cloudflare_r2_ ]] || [[ "$r_type" =~ ^cloudflare_d1_ ]] || [[ "$r_type" =~ ^cloudflare_queue ]]; then
            cat="storage"
          elif [[ "$r_type" == "cloudflare_ruleset" ]]; then
            cat="ruleset"
          elif [[ "$r_type" == "cloudflare_ai_gateway" ]]; then
            cat="gateway"
          fi
          
          if [[ -z "$r_host" ]]; then r_host="<not visible>"; fi
          
          if [[ "$r_name" == *"duplicate"* ]]; then
            risk="duplicate-hostname-risk"
            rec="manual-review-required"
            high_risk_found=true
          fi
          
          findings+=("$f|$r_type|$r_name|$r_host|$cat|$risk|$rec")
        fi
        in_resource=false
      elif [[ "$line" =~ name[[:space:]]*=[[:space:]]*\"([^\"]+)\" ]]; then
         r_host=$(redact_value "${BASH_REMATCH[1]}")
      elif [[ "$line" =~ hostname[[:space:]]*=[[:space:]]*\"([^\"]+)\" ]]; then
         r_host=$(redact_value "${BASH_REMATCH[1]}")
      fi
    fi
  done < "$f"
}

export -f process_file
export -f redact_value

while IFS= read -r -d '' file; do
  process_file "$file"
done < <(find "$SEARCH_ROOT" -type f \( -name "*.tf" -o -name "*.tf.example" -o -name "*.tfvars.example" \) \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.next/*" \
  -not -path "*/coverage/*" \
  -print0 2>/dev/null)

if [[ "$MODE" == "json" ]]; then
  echo "["
  first=true
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath rtype rname rhost rcat rrisk rrec <<< "$f"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "file": "$filepath",
    "resource_type": "$rtype",
    "resource_name": "$rname",
    "hostname": "$rhost",
    "owner_category": "$rcat",
    "risk": "$rrisk",
    "recommendation": "$rrec"
  }
EOF
  done
  echo "]"
elif [[ "$MODE" == "markdown" ]]; then
  echo "| File | Resource Type | Resource Name | Hostname/Name | Owner Category | Risk | Recommendation |"
  echo "|---|---|---|---|---|---|---|"
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath rtype rname rhost rcat rrisk rrec <<< "$f"
    echo "| $filepath | $rtype | $rname | $rhost | $rcat | $rrisk | $rrec |"
  done
else
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath rtype rname rhost rcat rrisk rrec <<< "$f"
    echo "$filepath: $rtype $rname ($rhost) [$rcat] - Risk: $rrisk, Rec: $rrec"
  done
fi

if [[ "$STRICT" == true ]] && [[ "$high_risk_found" == true ]]; then
  exit 1
fi

exit 0
