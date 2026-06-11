#!/usr/bin/env bash
# scan-cloudflare-access-ownership.sh
# Phase 8: Offline scanner for Access / Zero Trust ownership evidence.
# No API calls by default.

set -Eeuo pipefail
IFS=$'\n\t'

MODE="text"
STRICT=false
SEARCH_ROOT="."

show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Offline scanner for Access / Zero Trust ownership evidence.

Options:
  --help          Show this help message
  --markdown      Output as markdown table
  --json          Output as JSON
  --strict        Exit 1 if high-risk issues found
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

declare -a findings=()
high_risk_found=false

redact_value() {
  local val="$1"
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
  local r_domain=""
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*resource[[:space:]]+\"([^\"]+)\"[[:space:]]+\"([^\"]+)\" ]]; then
      r_type="${BASH_REMATCH[1]}"
      r_name="${BASH_REMATCH[2]}"
      r_domain=""
      if [[ "$r_type" =~ ^cloudflare_(zero_trust|access)_ ]]; then
        in_resource=true
      fi
      continue
    fi
    
    if [[ "$in_resource" == true ]]; then
      if [[ "$line" =~ ^[[:space:]]*\} ]]; then
        if [[ -z "$r_domain" ]]; then r_domain="<not visible>"; fi
        
        local risk="ok"
        local rec="none"
        if [[ "$r_name" == *"duplicate"* ]]; then
            risk="duplicate-hostname-risk"
            rec="manual-review-required"
            high_risk_found=true
        fi
        
        findings+=("$f|$r_type|$r_name|$r_domain|$risk|$rec")
        in_resource=false
      elif [[ "$line" =~ domain[[:space:]]*=[[:space:]]*\"([^\"]+)\" ]]; then
         r_domain=$(redact_value "${BASH_REMATCH[1]}")
      elif [[ "$line" =~ name[[:space:]]*=[[:space:]]*\"([^\"]+)\" ]]; then
         r_domain=$(redact_value "${BASH_REMATCH[1]}")
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
    IFS='|' read -r filepath rtype rname rdomain rrisk rrec <<< "$f"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "file": "$filepath",
    "resource_type": "$rtype",
    "resource_name": "$rname",
    "domain": "$rdomain",
    "risk": "$rrisk",
    "recommendation": "$rrec"
  }
EOF
  done
  echo "]"
elif [[ "$MODE" == "markdown" ]]; then
  echo "| File | Resource Type | Resource Name | Domain/Name | Risk | Recommendation |"
  echo "|---|---|---|---|---|---|"
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath rtype rname rdomain rrisk rrec <<< "$f"
    echo "| $filepath | $rtype | $rname | $rdomain | $rrisk | $rrec |"
  done
else
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath rtype rname rdomain rrisk rrec <<< "$f"
    echo "$filepath: $rtype $rname ($rdomain) - Risk: $rrisk, Rec: $rrec"
  done
fi

if [[ "$STRICT" == true ]] && [[ "$high_risk_found" == true ]]; then
  exit 1
fi

exit 0
