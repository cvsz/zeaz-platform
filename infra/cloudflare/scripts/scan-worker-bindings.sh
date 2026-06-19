#!/usr/bin/env bash
set -Eeuo pipefail

# scan-worker-bindings.sh
# Inventory Worker bindings from wrangler config files without exposing IDs.

show_help() {
  echo "Usage: $0 [options]"
  echo "Options:"
  echo "  --help      Show this help message"
  echo "  --strict    Fail if any high risk bindings or missing examples are found"
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
  local worker="$2"
  local env="$3"
  local btype="$4"
  local bname="$5"
  local target="$6"
  local risk="$7"
  local rec="$8"
  local manual="$9"
  results+=("$file|$worker|$env|$btype|$bname|$target|$risk|$rec|$manual")
}

declare -A toml_files
declare -A example_files

# Find all config files
while IFS= read -r -d '' file; do
  file="${file#./}"
  if [[ "$file" == *.example ]]; then
    example_files["$file"]=1
  else
    toml_files["$file"]=1
  fi
done < <(find workers apps infra/cloudflare -type f \( -name "wrangler.toml" -o -name "wrangler.toml.example" -o -name "wrangler.json" -o -name "wrangler.jsonc" \) 2>/dev/null -print0)

# Also look at package scripts mentioning wrangler
while IFS= read -r -d '' pjson; do
  pjson="${pjson#./}"
  if grep -q "wrangler" "$pjson"; then
    worker=$(dirname "$pjson")
    add_result "$pjson" "$worker" "all" "package-script" "wrangler" "redacted" "OK" "Ensure scripts don't bypass safety" "None"
  fi
done < <(find workers apps -name "package.json" -not -path "*/node_modules/*" 2>/dev/null -print0)

for file in "${!toml_files[@]}"; do
  worker=$(dirname "$file")
  
  if [[ -z "${example_files[$file.example]:-}" ]]; then
    add_result "$file" "$worker" "all" "file" "missing_example" "none" "REVIEW" "Create $file.example" "Create example"
  fi

  # Basic regex parsing for bindings in TOML.
  # This is a very rough parser for a shell script.

  while IFS= read -r line; do
    # Remove comments and whitespace
    clean_line=$(echo "$line" | sed 's/#.*//' | awk '{$1=$1};1')
    [[ -z "$clean_line" ]] && continue
    
    if echo "$clean_line" | grep -qE "^kv_namespaces"; then
      # multiline or inline, we just flag the presence if it's inline
      if echo "$clean_line" | grep -q "binding"; then
        bname=$(echo "$clean_line" | sed -n 's/.*binding\s*=\s*"\([^"]*\)".*/\1/p')
        raw_id=$(echo "$clean_line" | sed -n 's/.*id\s*=\s*"\([^"]*\)".*/\1/p')
        risk="OK"
        if [[ "$raw_id" == "00000000000000000000000000000000" || "$raw_id" == "replace-me" ]]; then
          risk="BLOCKER"
        fi
        add_result "$file" "$worker" "default" "kv_namespace" "${bname:-unknown}" "REDACTED_ID" "$risk" "Check IDs" "Check"
      fi
    elif echo "$clean_line" | grep -qE "^\[\[kv_namespaces\]\]"; then
      add_result "$file" "$worker" "default" "kv_namespace" "unknown" "REDACTED_ID" "OK" "Verify ID is real" "Verify"
    elif echo "$clean_line" | grep -qE "^\[\[d1_databases\]\]"; then
      add_result "$file" "$worker" "default" "d1_database" "unknown" "REDACTED_ID" "OK" "Verify ID is real" "Verify"
    elif echo "$clean_line" | grep -qE "^\[\[r2_buckets\]\]"; then
      add_result "$file" "$worker" "default" "r2_bucket" "unknown" "REDACTED_ID" "OK" "Verify ID is real" "Verify"
    elif echo "$clean_line" | grep -qE "^\[\[queues.producers\]\]"; then
      add_result "$file" "$worker" "default" "queue_producer" "unknown" "REDACTED" "OK" "Verify queue exists" "Verify"
    elif echo "$clean_line" | grep -qE "^\[\[queues.consumers\]\]"; then
      add_result "$file" "$worker" "default" "queue_consumer" "unknown" "REDACTED" "OK" "Verify queue exists" "Verify"
    elif echo "$clean_line" | grep -qE "^\[ai\]"; then
      add_result "$file" "$worker" "default" "ai_binding" "AI" "cloudflare" "OK" "Review AI governance docs" "Verify"
    elif echo "$clean_line" | grep -qE "ai_gateway"; then
      add_result "$file" "$worker" "default" "ai_gateway" "unknown" "REDACTED" "REVIEW" "AI Gateway must have governance" "Verify"
    elif echo "$clean_line" | grep -qE "^\[\[services\]\]"; then
      add_result "$file" "$worker" "default" "service_binding" "unknown" "REDACTED" "REVIEW" "Service bindings imply cross-app ownership" "Verify"
    elif echo "$clean_line" | grep -qE "^\[vars\]"; then
      add_result "$file" "$worker" "default" "vars" "multiple" "REDACTED" "OK" "Vars are public" "None"
    fi
  done < "$file"
done

for ex_file in "${!example_files[@]}"; do
  worker=$(dirname "$ex_file")
  while IFS= read -r line; do
    if echo "$line" | grep -qE 'id\s*=\s*"[a-f0-9]{32}"' && ! echo "$line" | grep -q "00000000000000000000000000000000"; then
      add_result "$ex_file" "$worker" "default" "example_id" "unknown" "REDACTED" "BLOCKER" "Real-looking ID in example" "Remove real ID"
    fi
  done < "$ex_file"
  
  actual_file="${ex_file%.example}"
  if [[ -f "$actual_file" ]]; then
    if cmp -s "$actual_file" "$ex_file"; then
      add_result "$ex_file" "$worker" "all" "file" "exact_copy" "none" "BLOCKER" "Example is exact copy of real file" "Fix example"
    fi
  fi
done

has_blocker=false

if [[ "$MODE" == "json" ]]; then
  echo "["
  first=true
  for r in "${results[@]}"; do
    IFS='|' read -r file worker env btype bname target risk rec manual <<< "$r"
    if [ "$first" = true ]; then first=false; else echo ","; fi
    cat <<EOF
  {
    "source_file": "$file",
    "worker": "$worker",
    "environment": "$env",
    "binding_type": "$btype",
    "binding_name": "$bname",
    "target": "$target",
    "risk": "$risk",
    "recommendation": "$rec",
    "manual_action_required": "$manual"
  }
EOF
    if [[ "$risk" == "BLOCKER" ]]; then has_blocker=true; fi
  done
  echo "]"
elif [[ "$MODE" == "markdown" ]]; then
  echo "| Source File | Worker/App | Env | Type | Name | Target | Risk | Recommendation | Manual Action |"
  echo "|---|---|---|---|---|---|---|---|---|"
  for r in "${results[@]}"; do
    IFS='|' read -r file worker env btype bname target risk rec manual <<< "$r"
    echo "| $file | $worker | $env | $btype | $bname | $target | $risk | $rec | $manual |"
    if [[ "$risk" == "BLOCKER" ]]; then has_blocker=true; fi
  done
else
  printf "%-30s %-15s %-10s %-15s %-15s %-15s %-10s %-30s %s\n" "FILE" "WORKER" "ENV" "TYPE" "NAME" "TARGET" "RISK" "RECOMMENDATION" "ACTION"
  for r in "${results[@]}"; do
    IFS='|' read -r file worker env btype bname target risk rec manual <<< "$r"
    printf "%-30s %-15s %-10s %-15s %-15s %-15s %-10s %-30s %s\n" "${file:0:30}" "${worker:0:15}" "$env" "$btype" "$bname" "$target" "$risk" "${rec:0:30}" "$manual"
    if [[ "$risk" == "BLOCKER" ]]; then has_blocker=true; fi
  done
fi

if [[ "$STRICT" == "true" && "$has_blocker" == "true" ]]; then
  exit 1
fi
exit 0
