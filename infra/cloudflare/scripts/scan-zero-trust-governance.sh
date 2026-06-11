#!/usr/bin/env bash
# scan-zero-trust-governance.sh
# Phase 9: Scanner for Cloudflare Access / Zero Trust governance evidence

set -Eeuo pipefail
IFS=$'\n\t'

MODE="markdown"
STRICT=false
SEARCH_ROOT="infra/cloudflare"

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
  if [[ "$val" =~ [0-9a-fA-F]{32,} ]] || [[ "$val" =~ [a-zA-Z0-9_-]{35,} ]] || [[ "$val" =~ api_token ]] || [[ "$val" =~ client_secret ]] || [[ "$val" =~ service_token_secret ]]; then
    echo "<redacted>"
  else
    echo "$val"
  fi
}

process_file() {
  local f="$1"
  local r_type="none"
  local domain_app="<not visible>"
  local policy_signal="none"
  local risk="ok"
  local rec="none"

  local in_block=false
  local block_content=""
  
  while IFS= read -r line; do
    if [[ "$line" =~ ^[[:space:]]*resource[[:space:]]+\"([^\"]+)\" ]]; then
      r_type="${BASH_REMATCH[1]}"
      if [[ "$r_type" =~ ^cloudflare_(zero_trust|access)_ ]]; then
        in_block=true
        block_content=""
      fi
    fi
    
    if [[ "$in_block" == true ]]; then
      block_content+="$line"$'\n'
      if [[ "$line" =~ ^[[:space:]]*\} ]]; then
        in_block=false
        
        # Analyze block
        if echo "$block_content" | grep -qE 'domain\s*='; then
          domain_app=$(echo "$block_content" | grep -E 'domain\s*=' | sed -E 's/.*domain\s*=\s*"([^"]+)".*/\1/' | head -n 1)
        elif echo "$block_content" | grep -qE 'name\s*='; then
          domain_app=$(echo "$block_content" | grep -E 'name\s*=' | sed -E 's/.*name\s*=\s*"([^"]+)".*/\1/' | head -n 1)
        fi
        
        policy_signal=""
        for sig in include exclude require everyone email email_domain group ip service_token bypass allow block non_identity session_duration; do
          if echo "$block_content" | grep -q "$sig"; then
             policy_signal+="$sig,"
          fi
        done
        policy_signal=${policy_signal%,}
        if [[ -z "$policy_signal" ]]; then policy_signal="none"; fi
        
        if echo "$block_content" | grep -qiE 'secret|token|password|client_secret|service_token_secret'; then
          risk="service-token-secret-risk"
          high_risk_found=true
        elif echo "$policy_signal" | grep -qiE 'allow|bypass|everyone'; then
          risk="bypass-policy-risk"
          high_risk_found=true
        elif [[ "$r_type" =~ application ]] && [[ "$domain_app" == "<not visible>" ]]; then
          risk="missing-domain"
        elif [[ "$r_type" =~ ^cloudflare_access_ ]]; then
          risk="stale-resource-syntax"
        elif ! echo "$block_content" | grep -qE 'owner|team|comment'; then
          risk="missing-owner"
        fi
        
        findings+=("$f|$r_type|$domain_app|$policy_signal|$risk|$rec")
      fi
    fi
  done < "$f"
}

export -f process_file
export -f redact_value

while IFS= read -r -d '' file; do
  process_file "$file"
done < <(find "$SEARCH_ROOT" -type f \
  \( -name "*.tf" -o -name "*.tf.example" -o -name "*.tfvars.example" -o -name "*.yml" -o -name "*.yaml" -o -name "*.json" -o -name "*.md" -o -name "wrangler.toml" -o -name "*.conf" \) \
  -not -path "*/.git/*" \
  -not -path "*/node_modules/*" \
  -not -path "*/dist/*" \
  -not -path "*/build/*" \
  -not -path "*/.next/*" \
  -not -path "*/coverage/*" \
  -not -path "*/vendor/*" \
  -not -path "*/tmp/*" \
  -not -path "*/temp/*" \
  -not -path "*/.terraform/*" \
  -not -path "*/.turbo/*" \
  -not -path "*/.cache/*" \
  -not -name ".env*" \
  -not -name "*.tfvars" \
  -not -name "*.tfstate*" \
  -not -name "creds.json" \
  -not -name "credentials.json" \
  -not -name "*token*" \
  -not -name "*secret*" \
  -not -name "*.pem" \
  -not -name "*.key" \
  -not -name "package-lock.json" \
  -not -name "pnpm-lock.yaml" \
  -not -name "yarn.lock" \
  -print0 2>/dev/null)

if [[ "$MODE" == "json" ]]; then
  echo "["
  first=true
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath evidence domain_app policy_signal risk rec <<< "$f"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "file": "$filepath",
    "evidence": "$evidence",
    "domain_or_app": "$domain_app",
    "policy_signal": "$policy_signal",
    "risk": "$risk",
    "recommendation": "$rec"
  }
EOF
  done
  echo "]"
elif [[ "$MODE" == "markdown" ]]; then
  echo "| File | Evidence | Domain/App | Policy Signal | Risk | Recommendation |"
  echo "|---|---|---|---|---|---|"
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath evidence domain_app policy_signal risk rec <<< "$f"
    echo "| $filepath | $evidence | $(redact_value "$domain_app") | $policy_signal | $risk | $rec |"
  done
else
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath evidence domain_app policy_signal risk rec <<< "$f"
    echo "$filepath: $evidence ($domain_app) [$policy_signal] - Risk: $risk, Rec: $rec"
  done
fi

if [[ "$STRICT" == true ]] && [[ "$high_risk_found" == true ]]; then
  exit 1
fi
exit 0
