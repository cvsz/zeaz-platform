#!/usr/bin/env bash
set -Eeuo pipefail

# check-cloudflare-no-mutation.sh
# Static guard to detect unsafe Cloudflare/deploy/mutation commands.

show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --help      Show this help message"
  echo "  --strict    Fail if active unsafe patterns are found in executable/workflow files"
  echo "  --json      Output in JSON format"
  echo "  --markdown  Output in Markdown format"
  exit 0
}

STRICT=false
MODE="text"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help ;;
    --strict) STRICT=true ;;
    --json) MODE="json" ;;
    --markdown) MODE="markdown" ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
  shift
done

cd "$REPO_ROOT" || exit 1

declare -a results=()

add_result() {
  local file="$1"
  local line="$2"
  local pattern="$3"
  local severity="$4"
  local ftype="$5"
  local recommendation="$6"
  results+=("$file|$line|$pattern|$severity|$ftype|$recommendation")
}

check_file() {
  local file="$1"
  local ftype="config"
  if [[ "$file" == *.sh || "$file" == *.py || "$file" == *.js || "$file" == *.ts || "$file" == *workflows/*.yml || "$file" == *package.json ]]; then
    ftype="executable"
  elif [[ "$file" == *.md || "$file" == *.txt ]]; then
    ftype="docs"
  fi

  local line_num=0
  while IFS= read -r line; do
    ((line_num++))
    local pattern=""
    local severity="REVIEW"
    local recommendation="Remove or verify read-only intent"

    if echo "$line" | grep -qE "wrangler deploy|wrangler publish"; then
      pattern="wrangler deploy/publish"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Do not deploy directly from scripts/workflows"
    elif echo "$line" | grep -qE "terraform apply|tofu apply"; then
      pattern="terraform/tofu apply"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Use plan and manual apply approval"
    elif echo "$line" | grep -qE "curl -X (POST|PUT|PATCH|DELETE).*api\.cloudflare\.com"; then
      pattern="cloudflare api mutation"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Do not mutate resources via API"
    elif echo "$line" | grep -qE "cloudflared tunnel (delete|create|route dns)"; then
      pattern="cloudflared tunnel mutation"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Manage tunnels via UI or Terraform"
    elif echo "$line" | grep -qE "echo \\\$?CLOUDFLARE_API_TOKEN|echo \\\$?CF_API_TOKEN|cat /etc/cloudflared/.*\.json|cat /etc/cloudflared/config\.yml|cat infra/cloudflare/creds\.json"; then
      pattern="secret print risk"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Do not print tokens or secrets"
    elif echo "$line" | grep -qE "(env|printenv) \| grep TOKEN|set \| grep SECRET"; then
      pattern="suspicious env dump"
      [[ "$ftype" == "executable" ]] && severity="BLOCKER"
      recommendation="Do not dump env vars"
    fi

    if [[ -n "$pattern" ]]; then
      # Filter out self-references in this script and docs reporting
      if [[ "$file" != "infra/cloudflare/scripts/check-cloudflare-no-mutation.sh" ]] && [[ "$file" != "docs/infra/cloudflare-no-mutation-policy.md" ]]; then
        add_result "$file" "$line_num" "$pattern" "$severity" "$ftype" "$recommendation"
      fi
    fi
  done < "$file"
}

# Find files to scan
while IFS= read -r -d '' file; do
  # Remove leading ./
  file="${file#./}"
  check_file "$file"
done < <(find . -type f -not -path "*/.git/*" -not -path "*/node_modules/*" -not -name "pnpm-lock.yaml" -not -name "package-lock.json" -not -path "*/docs/infra/*-report.md" -not -path "*/docs/infra/*-log.md" -print0)

has_blocker=false

if [[ "$MODE" == "json" ]]; then
  echo "["
  first=true
  for r in "${results[@]}"; do
    IFS='|' read -r file line pattern severity ftype recommendation <<< "$r"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "file": "$file",
    "line": $line,
    "pattern": "$pattern",
    "severity": "$severity",
    "type": "$ftype",
    "recommendation": "$recommendation"
  }
EOF
    if [[ "$severity" == "BLOCKER" ]]; then has_blocker=true; fi
  done
  echo "]"
elif [[ "$MODE" == "markdown" ]]; then
  echo "| File | Line | Pattern | Severity | Type | Recommendation |"
  echo "|---|---|---|---|---|---|"
  for r in "${results[@]}"; do
    IFS='|' read -r file line pattern severity ftype recommendation <<< "$r"
    echo "| $file | $line | $pattern | $severity | $ftype | $recommendation |"
    if [[ "$severity" == "BLOCKER" ]]; then has_blocker=true; fi
  done
else
  printf "%-40s %-5s %-30s %-10s %-12s %s\n" "FILE" "LINE" "PATTERN" "SEVERITY" "TYPE" "RECOMMENDATION"
  for r in "${results[@]}"; do
    IFS='|' read -r file line pattern severity ftype recommendation <<< "$r"
    printf "%-40s %-5s %-30s %-10s %-12s %s\n" "${file:0:40}" "$line" "${pattern:0:30}" "$severity" "$ftype" "$recommendation"
    if [[ "$severity" == "BLOCKER" ]]; then has_blocker=true; fi
  done
fi

if [[ "$STRICT" == "true" && "$has_blocker" == "true" ]]; then
  exit 1
fi
exit 0
