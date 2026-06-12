#!/usr/bin/env bash
# scan-cloudflare-environment-boundaries.sh
# Phase 18: Offline scanner for Cloudflare dev/staging/prod ownership boundaries.
# No API calls. No modifications.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"
readonly ENV_DIR="${REPO_ROOT}/infra/cloudflare/environments"

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

Scan Cloudflare environment intent files for dev/staging/prod boundary issues.

Read-only scanner. Offline by default. No Cloudflare API calls. No modifications.

Checks:
  - dev.yml, staging.yml, and prod.yml exist
  - duplicate hostnames across environment YAML files
  - production domain suffixes in dev or staging YAML
  - missing or mismatched env tags on Worker routes
  - missing top-level owner fields
  - missing promotion evidence reference in prod YAML

Options:
  --help       Show this help message and exit
  --markdown   Output results as a Markdown table
  --json       Output results as JSON
  --strict     Exit non-zero when boundary violations are found

Exit codes:
  0   No boundary violations found, or violations found without --strict
  1   Boundary violations found with --strict
  2   Invalid arguments
EOF
}

MODE="human"
STRICT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help) show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json) MODE="json" ;;
    --strict) STRICT=true ;;
    *)
      log_error "Unknown option: $1"
      show_help
      exit 2
      ;;
  esac
  shift
done

declare -a expected_envs=("dev" "staging" "prod")
declare -a checked_envs=()
declare -a violations=()
declare -A hostname_envs=()

strip_value() {
  local value="$1"
  value="${value%%#*}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "$value"
}

json_escape() {
  printf '%s' "$1" | python3 -c 'import json, sys; print(json.dumps(sys.stdin.read()), end="")'
}

add_violation() {
  local env="$1"
  local kind="$2"
  local message="$3"
  local recommendation="$4"
  violations+=("${env}|${kind}|${message}|${recommendation}")
}

extract_environment_value() {
  local file="$1"
  local line
  line=$(grep -E '^environment:[[:space:]]*' "$file" 2>/dev/null | head -1 || true)
  strip_value "${line#*:}"
}

extract_hostnames() {
  local file="$1"
  local in_hostnames=false
  local line value

  while IFS= read -r line || [[ -n "$line" ]]; do
    if [[ "$line" =~ ^hostnames: ]]; then
      in_hostnames=true
      continue
    fi

    if [[ "$in_hostnames" == true && "$line" =~ ^[A-Za-z_][A-Za-z0-9_]*: ]]; then
      break
    fi

    if [[ "$in_hostnames" == true && "$line" =~ ^[[:space:]]*-[[:space:]]*name:[[:space:]]*(.+)$ ]]; then
      value="$(strip_value "${BASH_REMATCH[1]}")"
      [[ -n "$value" ]] && echo "$value"
      continue
    fi

    if [[ "$in_hostnames" == true && "$line" =~ ^[[:space:]]*name:[[:space:]]*(.+)$ ]]; then
      value="$(strip_value "${BASH_REMATCH[1]}")"
      [[ -n "$value" ]] && echo "$value"
    fi
  done < "$file"
}

contains_env() {
  local list="$1"
  local env="$2"
  [[ ",${list}," == *",${env},"* ]]
}

record_hostnames() {
  local env="$1"
  local file="$2"
  local hostname existing

  while IFS= read -r hostname; do
    [[ -z "$hostname" ]] && continue
    existing="${hostname_envs[$hostname]:-}"
    if [[ -z "$existing" ]]; then
      hostname_envs["$hostname"]="$env"
    elif ! contains_env "$existing" "$env"; then
      hostname_envs["$hostname"]="${existing},${env}"
    fi
  done < <(extract_hostnames "$file")
}

check_nonprod_domains() {
  local env="$1"
  local file="$2"

  if [[ "$env" == "prod" ]]; then
    return 0
  fi

  if grep -Eq '(^|[^A-Za-z0-9_.-])zeaz\.dev([^A-Za-z0-9_.-]|$)|\.zeaz\.dev' "$file"; then
    add_violation \
      "$env" \
      "prod-domain-in-nonprod" \
      "${env}.yml contains a production domain suffix" \
      "Use an internal or local-only hostname in ${env}.yml"
  fi
}

check_owner() {
  local env="$1"
  local file="$2"

  if ! grep -qE '^owner:[[:space:]]*[^[:space:]]+' "$file"; then
    add_violation \
      "$env" \
      "missing-owner" \
      "${env}.yml is missing a top-level owner field" \
      "Add owner to ${env}.yml"
  fi
}

check_prod_evidence() {
  local env="$1"
  local file="$2"
  local line value

  if [[ "$env" != "prod" ]]; then
    return 0
  fi

  line=$(grep -E '^promotion_evidence_reference:[[:space:]]*' "$file" 2>/dev/null | head -1 || true)
  value="$(strip_value "${line#*:}")"

  if [[ -z "$line" || -z "$value" || "$value" == "not-required"* || "$value" == "none" ]]; then
    add_violation \
      "$env" \
      "missing-promotion-evidence" \
      "prod.yml is missing a production promotion evidence reference" \
      "Add promotion_evidence_reference that points to the Phase 16 evidence index or record"
  fi
}

check_worker_route_env_tags() {
  local env="$1"
  local file="$2"
  local result pattern issue recommendation

  while IFS='|' read -r pattern issue recommendation; do
    [[ -z "${pattern:-}" ]] && continue
    case "$issue" in
      missing)
        add_violation \
          "$env" \
          "missing-worker-env" \
          "${env}.yml Worker route ${pattern} is missing an env tag" \
          "$recommendation"
        ;;
      mismatch:*)
        add_violation \
          "$env" \
          "mismatched-worker-env" \
          "${env}.yml Worker route ${pattern} has ${issue#mismatch:}, expected ${env}" \
          "$recommendation"
        ;;
    esac
  done < <(
    awk -v expected="$env" '
      function trim(value) {
        sub(/#.*/, "", value)
        gsub(/^[[:space:]"'\''"]+/, "", value)
        gsub(/[[:space:]"'\''"]+$/, "", value)
        return value
      }
      function check_route() {
        if (!route_active) {
          return
        }
        if (route_env == "") {
          print route_pattern "|missing|Add env: " expected " to the Worker route"
        } else if (route_env != expected) {
          print route_pattern "|mismatch:" route_env "|Change Worker route env to " expected
        }
        route_active = 0
        route_pattern = ""
        route_env = ""
      }
      /^worker_routes:/ {
        in_routes = 1
        next
      }
      in_routes && /^[A-Za-z_][A-Za-z0-9_]*:/ {
        check_route()
        in_routes = 0
      }
      in_routes && /^[[:space:]]*-[[:space:]]*pattern:[[:space:]]*/ {
        check_route()
        route_active = 1
        route_pattern = $0
        sub(/^[[:space:]]*-[[:space:]]*pattern:[[:space:]]*/, "", route_pattern)
        route_pattern = trim(route_pattern)
        next
      }
      in_routes && route_active && /^[[:space:]]*env:[[:space:]]*/ {
        route_env = $0
        sub(/^[[:space:]]*env:[[:space:]]*/, "", route_env)
        route_env = trim(route_env)
        next
      }
      END {
        check_route()
      }
    ' "$file"
  )

  return 0
}

scan_environment_file() {
  local env="$1"
  local file="${ENV_DIR}/${env}.yml"
  local declared_env

  if [[ ! -f "$file" ]]; then
    add_violation \
      "$env" \
      "missing-file" \
      "infra/cloudflare/environments/${env}.yml is missing" \
      "Create sanitized ${env}.yml intent file"
    return 0
  fi

  checked_envs+=("$env")

  declared_env="$(extract_environment_value "$file")"
  if [[ "$declared_env" != "$env" ]]; then
    add_violation \
      "$env" \
      "environment-mismatch" \
      "${env}.yml declares environment '${declared_env:-missing}'" \
      "Set environment: ${env}"
  fi

  check_nonprod_domains "$env" "$file"
  check_owner "$env" "$file"
  check_prod_evidence "$env" "$file"
  check_worker_route_env_tags "$env" "$file"
  record_hostnames "$env" "$file"
}

for env in "${expected_envs[@]}"; do
  scan_environment_file "$env"
done

for hostname in "${!hostname_envs[@]}"; do
  env_list="${hostname_envs[$hostname]}"
  if [[ "$env_list" == *,* ]]; then
    add_violation \
      "multiple" \
      "duplicate-hostname" \
      "Hostname ${hostname} appears in multiple environments: ${env_list}" \
      "Assign ${hostname} to exactly one environment intent file"
  fi
done

render_human() {
  echo "Cloudflare environment boundary scan"
  local checked="none"
  if [[ ${#checked_envs[@]} -gt 0 ]]; then
    checked="$(printf '%s, ' "${checked_envs[@]}")"
    checked="${checked%, }"
  fi
  echo "Checked environments: ${checked}"
  echo "Violations: ${#violations[@]}"
  echo ""

  if [[ ${#violations[@]} -eq 0 ]]; then
    log_ok "No boundary violations found."
    return 0
  fi

  local entry env kind message recommendation
  for entry in "${violations[@]}"; do
    IFS='|' read -r env kind message recommendation <<< "$entry"
    log_error "[$env][$kind] $message"
    log_warn "Recommendation: $recommendation"
  done
}

render_markdown() {
  echo "| Environment | Check | Status | Recommendation |"
  echo "|---|---|---|---|"

  if [[ ${#violations[@]} -eq 0 ]]; then
    local env
    for env in "${checked_envs[@]}"; do
      echo "| ${env} | boundary scan | PASS | No boundary violations found |"
    done
    return 0
  fi

  local entry env kind message recommendation
  for entry in "${violations[@]}"; do
    IFS='|' read -r env kind message recommendation <<< "$entry"
    echo "| ${env} | ${kind} | FAIL: ${message} | ${recommendation} |"
  done
}

render_json() {
  local entry env kind message recommendation i comma

  echo "{"
  echo "  \"scanner\": \"scan-cloudflare-environment-boundaries\","
  echo "  \"offline\": true,"
  echo "  \"violation_count\": ${#violations[@]},"
  echo "  \"environments_checked\": ["
  for i in "${!checked_envs[@]}"; do
    comma=","
    [[ "$i" -eq $((${#checked_envs[@]} - 1)) ]] && comma=""
    printf '    '
    json_escape "${checked_envs[$i]}"
    printf '%s\n' "$comma"
  done
  echo "  ],"
  echo "  \"violations\": ["
  for i in "${!violations[@]}"; do
    IFS='|' read -r env kind message recommendation <<< "${violations[$i]}"
    comma=","
    [[ "$i" -eq $((${#violations[@]} - 1)) ]] && comma=""
    echo "    {"
    printf '      "environment": '
    json_escape "$env"
    printf ',\n'
    printf '      "type": '
    json_escape "$kind"
    printf ',\n'
    printf '      "message": '
    json_escape "$message"
    printf ',\n'
    printf '      "recommendation": '
    json_escape "$recommendation"
    printf '\n'
    printf '    }%s\n' "$comma"
  done
  echo "  ],"
  echo "  \"recommendations\": ["
  if [[ ${#violations[@]} -eq 0 ]]; then
    printf '    '
    json_escape "No boundary violations found."
    printf '\n'
  else
    for i in "${!violations[@]}"; do
      IFS='|' read -r env kind message recommendation <<< "${violations[$i]}"
      comma=","
      [[ "$i" -eq $((${#violations[@]} - 1)) ]] && comma=""
      printf '    '
      json_escape "$recommendation"
      printf '%s\n' "$comma"
    done
  fi
  echo "  ]"
  echo "}"
}

case "$MODE" in
  human) render_human ;;
  markdown) render_markdown ;;
  json) render_json ;;
esac

if [[ "$STRICT" == true && ${#violations[@]} -gt 0 ]]; then
  exit 1
fi

exit 0
