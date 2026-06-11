#!/usr/bin/env bash
# scan-cloudflare-rulesets-governance.sh
# Phase 9: Scanner for Cloudflare rulesets governance

set -Eeuo pipefail
IFS=$'\n\t'

MODE="markdown"
STRICT=false
SEARCH_ROOT="."

while [[ $# -gt 0 ]]; do
  case "$1" in
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --strict) STRICT=true ;;
    --root) shift; SEARCH_ROOT="$1" ;;
    --help) exit 0 ;;
    *) shift ;;
  esac
  shift
done

declare -a findings=()
high_risk_found=false

process_file() {
  local f="$1"
  while IFS= read -r line; do
    local r_cat="unknown"
    local a_sig="unknown"
    local risk="ok"
    local rec="none"

    if echo "$line" | grep -qiE 'cloudflare_ruleset|cloudflare_zone_settings_override|cloudflare_page_rule|managed_rules|firewall|waf|rate_limit|redirect|transform|cache|origin|skip|execute|challenge|block|allow'; then
      if echo "$line" | grep -qi 'cloudflare_page_rule'; then
        risk="legacy-page-rule"
        high_risk_found=true
      fi
      if echo "$line" | grep -qi 'skip' && echo "$line" | grep -qiE 'broad|all|\*'; then
        risk="broad-skip-rule"
        high_risk_found=true
      fi
      if echo "$line" | grep -qi 'allow' && echo "$line" | grep -qiE 'broad|all|\*'; then
        risk="broad-allow-rule"
        high_risk_found=true
      fi
      if echo "$line" | grep -qiE 'waf|rate_limit' && ! grep -qiE 'owner|comment' "$f"; then
        risk="missing-owner"
      fi

      findings+=("$f|rule_evidence|category|action|$risk|$rec")
    fi
  done < "$f"
}
export -f process_file

while IFS= read -r -d '' file; do
  process_file "$file"
done < <(find "$SEARCH_ROOT" -type f \( -name "*.tf" -o -name "*.tf.example" \) \
  -not -path "*/.git/*" -not -path "*/node_modules/*" -not -path "*/.terraform/*" \
  -print0 2>/dev/null)

if [[ "$MODE" == "markdown" ]]; then
  echo "| File | Rule Evidence | Rule Category | Action Signal | Risk | Recommendation |"
  echo "|---|---|---|---|---|---|"
  for f in "${findings[@]}"; do
    IFS='|' read -r filepath r_ev r_cat a_sig risk rec <<< "$f"
    echo "| $filepath | $r_ev | $r_cat | $a_sig | $risk | $rec |"
  done
else
  for f in "${findings[@]}"; do echo "$f"; done
fi

if [[ "$STRICT" == true ]] && [[ "$high_risk_found" == true ]]; then exit 1; fi
exit 0
