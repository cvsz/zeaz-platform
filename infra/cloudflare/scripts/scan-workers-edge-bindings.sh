#!/usr/bin/env bash
# scan-workers-edge-bindings.sh
# Phase 7: Read-only scanner for Workers, edge bindings, and AI Gateway governance.
# No API calls. No deploys. No Cloudflare resource mutations.
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly REPO_ROOT="$(cd "${SCRIPT_DIR}/../../../" && pwd)"

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

Scan local repository files for Cloudflare Workers, edge bindings, and AI Gateway governance.

Read-only scanner. No API calls. No wrangler deploy. No terraform/tofu apply.

Detects:
  - wrangler.toml files and wrangler.toml.example files
  - Worker routes and custom domains
  - KV namespace bindings
  - D1 database bindings
  - R2 bucket bindings
  - Durable Object bindings
  - Workers AI bindings
  - AI Gateway references
  - Placeholder IDs and placeholder values
  - Suspicious exact-copy examples
  - Missing examples
  - Route overlap with tunnel-owned and DNS-owned hostnames when visible locally

Options:
  --help          Show this help message and exit
  --markdown      Output Markdown report
  --json          Output JSON report
  --strict        Exit non-zero when governance issues are found

Exit codes:
  0   Scan completed
  1   Issues found with --strict
  2   Scanner error or invalid arguments
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
    *) log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

json_escape() {
  local s="${1:-}"
  s=${s//\\/\\\\}
  s=${s//\"/\\\"}
  s=${s//$'\n'/\\n}
  s=${s//$'\r'/}
  printf '%s' "$s"
}

json_array() {
  local -n values_ref="$1"
  local indent="${2:-4}"
  local spaces
  spaces=$(printf '%*s' "$indent" '')
  echo "["
  for i in "${!values_ref[@]}"; do
    local comma=","
    [[ "$i" -eq $((${#values_ref[@]} - 1)) ]] && comma=""
    printf '%s"%s"%s\n' "$spaces" "$(json_escape "${values_ref[$i]}")" "$comma"
  done
  printf '%*s]' $((indent - 2)) ''
}

json_array_property() {
  local name="$1"
  local array_name="$2"
  local suffix="${3:-,}"
  printf '  "%s": ' "$name"
  json_array "$array_name" 4
  printf '%s\n' "$suffix"
}

add_unique() {
  local -n arr_ref="$1"
  local -n map_ref="$2"
  local value="${3:-}"
  [[ -z "$value" ]] && return 0
  if [[ -z "${map_ref[$value]+x}" ]]; then
    arr_ref+=("$value")
    map_ref["$value"]=1
  fi
}

trim_value() {
  local value="${1:-}"
  value="${value%%#*}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

extract_quoted_value() {
  local line="${1:-}"
  sed -E 's/^[^=]+= *"([^"]*)".*$/\1/' <<< "$line"
}

route_host() {
  local pattern="${1:-}"
  pattern="${pattern#https://}"
  pattern="${pattern#http://}"
  pattern="${pattern%%/*}"
  pattern="${pattern%\*}"
  pattern="${pattern%.}"
  printf '%s' "$pattern"
}

is_example_file() {
  local rel="$1"
  [[ "$rel" == *".example"* ]]
}

is_placeholder_value() {
  local value="${1:-}"
  [[ "$value" =~ ^\<[A-Z0-9_:-]+\>$ ]] || \
    [[ "$value" =~ ^0{32}$ ]] || \
    [[ "$value" =~ ^0{8}-0{4}-0{4}-0{4}-0{12}$ ]] || \
    [[ "$value" =~ ^(example|test)- ]]
}

is_zero_placeholder() {
  local value="${1:-}"
  [[ "$value" =~ ^0{32}$ ]] || [[ "$value" =~ ^0{8}-0{4}-0{4}-0{4}-0{12}$ ]]
}

is_real_id_like() {
  local value="${1:-}"
  [[ "$value" =~ ^[0-9a-fA-F]{32}$ ]] || \
    [[ "$value" =~ ^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$ ]]
}

SCAN_START=$(date +%s)

declare -a wrangler_files=()
declare -a live_wrangler_files=()
declare -a example_wrangler_files=()
declare -a worker_rows=()
declare -a route_rows=()
declare -a custom_domain_rows=()
declare -a binding_rows=()
declare -a ai_gateway_refs=()
declare -a placeholder_rows=()
declare -a exact_copy_examples=()
declare -a missing_examples=()
declare -a unsafe_examples=()
declare -a dns_overlaps=()
declare -a tunnel_overlaps=()
declare -a terraform_worker_route_refs=()
declare -a governance_issues=()

declare -A route_workers=()
declare -A route_files=()
declare -A route_hosts_seen=()
declare -a route_hosts=()

while IFS= read -r -d '' file; do
  wrangler_files+=("$file")
done < <(
  find "$REPO_ROOT" \
    -path '*/node_modules' -prune -o \
    -path '*/.git' -prune -o \
    -path '*/.venv' -prune -o \
    -path '*/.backup' -prune -o \
    -path '*/.terraform' -prune -o \
    -path '*/.wrangler' -prune -o \
    -type f \( -name 'wrangler.toml' -o -name 'wrangler.toml.example' -o -name 'wrangler.*.toml' -o -name 'wrangler.*.toml.example' \) \
    -print0 2>/dev/null || true
)

parse_wrangler_file() {
  local file="$1"
  local rel="${file#$REPO_ROOT/}"
  local is_example="false"
  is_example_file "$rel" && is_example="true"

  if [[ "$is_example" == "true" ]]; then
    example_wrangler_files+=("$rel")
  else
    live_wrangler_files+=("$rel")
  fi

  local worker_name main compatibility workers_dev
  worker_name=$(grep -E '^[[:space:]]*name[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed -E 's/^[^=]+= *"([^"]*)".*$/\1/' || true)
  main=$(grep -E '^[[:space:]]*main[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed -E 's/^[^=]+= *"([^"]*)".*$/\1/' || true)
  compatibility=$(grep -E '^[[:space:]]*compatibility_date[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed -E 's/^[^=]+= *"([^"]*)".*$/\1/' || true)
  workers_dev=$(grep -E '^[[:space:]]*workers_dev[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed -E 's/^[^=]+= *([^ #]+).*$/\1/' || true)
  worker_rows+=("$rel|${worker_name:-<missing>}|${main:-<missing>}|${compatibility:-<missing>}|${workers_dev:-<unset>}|$is_example")

  local active_content
  active_content=$(sed -E '/^[[:space:]]*#/d;s/[[:space:]]+#.*$//' "$file")

  while IFS= read -r line; do
    [[ -z "$line" ]] && continue
    if [[ "$line" =~ route[[:space:]]*= ]] && [[ ! "$line" =~ routes[[:space:]]*= ]]; then
      local pattern host
      pattern=$(extract_quoted_value "$line")
      host=$(route_host "$pattern")
      route_rows+=("$rel|${worker_name:-<missing>}|$pattern|$host|$is_example")
      if [[ "$is_example" == "false" ]]; then
        route_workers["$host"]="${route_workers[$host]:-}${route_workers[$host]:+, }${worker_name:-<missing>}"
        route_files["$host"]="${route_files[$host]:-}${route_files[$host]:+, }$rel"
        add_unique route_hosts route_hosts_seen "$host"
      fi
    fi
    if [[ "$line" =~ pattern[[:space:]]*= ]]; then
      local pattern host
      pattern=$(sed -E 's/.*pattern[[:space:]]*=[[:space:]]*"([^"]*)".*/\1/' <<< "$line")
      host=$(route_host "$pattern")
      route_rows+=("$rel|${worker_name:-<missing>}|$pattern|$host|$is_example")
      if [[ "$is_example" == "false" ]]; then
        route_workers["$host"]="${route_workers[$host]:-}${route_workers[$host]:+, }${worker_name:-<missing>}"
        route_files["$host"]="${route_files[$host]:-}${route_files[$host]:+, }$rel"
        add_unique route_hosts route_hosts_seen "$host"
      fi
    fi
    if [[ "$line" =~ custom_domain ]]; then
      custom_domain_rows+=("$rel|${worker_name:-<missing>}|$(trim_value "$line")|$is_example")
    fi
    if [[ "$line" =~ (CLOUDFLARE_AI_GATEWAY|AI_GATEWAY|ai-gateway|AI_GATEWAY_SLUG) ]]; then
      ai_gateway_refs+=("$rel|wrangler|$(trim_value "$line")")
    fi
  done <<< "$active_content"

  local section="" binding="" resource_id="" database_name="" bucket_name="" class_name=""
  finalize_binding() {
    [[ -z "$section" ]] && return 0
    case "$section" in
      kv_namespaces)
        [[ -n "$binding" || -n "$resource_id" ]] && binding_rows+=("$rel|KV|${binding:-<missing-binding>}|${resource_id:-<missing-id>}|$is_example")
        ;;
      d1_databases)
        [[ -n "$binding" || -n "$resource_id" || -n "$database_name" ]] && binding_rows+=("$rel|D1|${binding:-<missing-binding>}|${database_name:-<missing-database-name>}:${resource_id:-<missing-database-id>}|$is_example")
        ;;
      r2_buckets)
        [[ -n "$binding" || -n "$bucket_name" ]] && binding_rows+=("$rel|R2|${binding:-<missing-binding>}|${bucket_name:-<missing-bucket-name>}|$is_example")
        ;;
      durable_objects.bindings)
        [[ -n "$binding" || -n "$class_name" ]] && binding_rows+=("$rel|Durable Object|${binding:-<missing-name>}|${class_name:-<missing-class>}|$is_example")
        ;;
      ai)
        [[ -n "$binding" ]] && binding_rows+=("$rel|Workers AI|$binding|binding|$is_example")
        ;;
    esac
  }

  while IFS= read -r raw_line; do
    local line
    line=$(trim_value "$raw_line")
    [[ -z "$line" ]] && continue

    if [[ "$line" =~ ^\[\[?([^][]+)\]?\]?$ ]]; then
      finalize_binding
      section="${BASH_REMATCH[1]}"
      binding=""
      resource_id=""
      database_name=""
      bucket_name=""
      class_name=""
      continue
    fi

    case "$section" in
      kv_namespaces)
        [[ "$line" =~ ^binding[[:space:]]*= ]] && binding=$(extract_quoted_value "$line")
        if [[ "$line" =~ ^(id|preview_id)[[:space:]]*= ]]; then
          resource_id=$(extract_quoted_value "$line")
          if is_placeholder_value "$resource_id"; then
            placeholder_rows+=("$rel|KV|${binding:-<pending-binding>}|$resource_id|$is_example")
          fi
          if [[ "$is_example" == "true" ]] && is_zero_placeholder "$resource_id"; then
            unsafe_examples+=("$rel uses all-zero KV placeholder; use <KV_NAMESPACE_ID>")
          fi
          if [[ "$is_example" == "false" ]] && is_zero_placeholder "$resource_id"; then
            governance_issues+=("$rel has non-deployable all-zero KV namespace ID for ${binding:-<pending-binding>}")
          fi
        fi
        ;;
      d1_databases)
        [[ "$line" =~ ^binding[[:space:]]*= ]] && binding=$(extract_quoted_value "$line")
        [[ "$line" =~ ^database_name[[:space:]]*= ]] && database_name=$(extract_quoted_value "$line")
        if [[ "$line" =~ ^database_id[[:space:]]*= ]]; then
          resource_id=$(extract_quoted_value "$line")
          if is_placeholder_value "$resource_id"; then
            placeholder_rows+=("$rel|D1|${binding:-<pending-binding>}|$resource_id|$is_example")
          elif [[ "$is_example" == "true" ]] && is_real_id_like "$resource_id"; then
            unsafe_examples+=("$rel contains real-looking D1 database_id")
          fi
        fi
        ;;
      r2_buckets)
        [[ "$line" =~ ^binding[[:space:]]*= ]] && binding=$(extract_quoted_value "$line")
        if [[ "$line" =~ ^bucket_name[[:space:]]*= ]]; then
          bucket_name=$(extract_quoted_value "$line")
          if is_placeholder_value "$bucket_name"; then
            placeholder_rows+=("$rel|R2|${binding:-<pending-binding>}|$bucket_name|$is_example")
          fi
        fi
        ;;
      durable_objects.bindings)
        [[ "$line" =~ ^name[[:space:]]*= ]] && binding=$(extract_quoted_value "$line")
        [[ "$line" =~ ^class_name[[:space:]]*= ]] && class_name=$(extract_quoted_value "$line")
        ;;
      durable_objects)
        if [[ "$line" =~ bindings[[:space:]]*= ]]; then
          while IFS= read -r name_value; do
            [[ -z "$name_value" ]] && continue
            binding=$(sed -E 's/name[[:space:]]*=[[:space:]]*"([^"]*)"/\1/' <<< "$name_value")
          done < <(grep -oE 'name[[:space:]]*=[[:space:]]*"[^"]*"' <<< "$line" || true)
          while IFS= read -r class_value; do
            [[ -z "$class_value" ]] && continue
            class_name=$(sed -E 's/class_name[[:space:]]*=[[:space:]]*"([^"]*)"/\1/' <<< "$class_value")
          done < <(grep -oE 'class_name[[:space:]]*=[[:space:]]*"[^"]*"' <<< "$line" || true)
          [[ -n "$binding" || -n "$class_name" ]] && binding_rows+=("$rel|Durable Object|${binding:-<missing-name>}|${class_name:-<missing-class>}|$is_example")
          binding=""
          class_name=""
        fi
        ;;
      ai)
        [[ "$line" =~ ^binding[[:space:]]*= ]] && binding=$(extract_quoted_value "$line")
        ;;
    esac

    if [[ "$line" =~ ^(account_id|zone_id|id|preview_id|database_id)[[:space:]]*= ]]; then
      local key value
      key=$(sed -E 's/^([^=]+)=.*/\1/' <<< "$line" | tr -d '[:space:]')
      value=$(extract_quoted_value "$line")
      if is_placeholder_value "$value"; then
        placeholder_rows+=("$rel|$key|config|$value|$is_example")
      elif [[ "$is_example" == "true" ]] && is_real_id_like "$value"; then
        unsafe_examples+=("$rel contains real-looking $key")
      fi
    fi
  done <<< "$active_content"
  finalize_binding
}

for file in "${wrangler_files[@]}"; do
  parse_wrangler_file "$file"
done

for rel in "${live_wrangler_files[@]}"; do
  found=false
  for candidate in "${rel}.example" "${rel%.toml}.toml.example"; do
    if [[ -f "$REPO_ROOT/$candidate" ]]; then
      found=true
      break
    fi
  done
  [[ "$found" == "false" ]] && missing_examples+=("$rel")
done

for rel in "${example_wrangler_files[@]}"; do
  live=""
  [[ "$rel" == *.example ]] && live="${rel%.example}"
  [[ -z "$live" && "$rel" == *.example.toml ]] && live="${rel%.example.toml}.toml"
  if [[ -n "$live" && -f "$REPO_ROOT/$live" ]] && diff -q "$REPO_ROOT/$live" "$REPO_ROOT/$rel" >/dev/null 2>&1; then
    exact_copy_examples+=("$live -> $rel")
  fi
done

declare -A dns_host_seen=()
declare -a dns_hosts=()
while IFS= read -r host; do
  add_unique dns_hosts dns_host_seen "$host"
done < <(
  find "$REPO_ROOT/terraform" "$REPO_ROOT/opentofu" \
    -path '*/.terraform' -prune -o \
    -type f \( -name '*.tf' -o -name '*.tfvars' -o -name '*.tfvars.example' -o -name '*.json' \) \
    ! -name '*.tfstate' ! -name '*.backup' ! -name '*.lock.info' \
    -print0 2>/dev/null | \
    xargs -0 grep -Eho '[A-Za-z0-9*_.-]+\.zeaz\.dev' 2>/dev/null | sort -u || true
)

declare -A tunnel_host_seen=()
declare -a tunnel_hosts=()
while IFS= read -r host; do
  host="${host//\$\{PRIMARY_DOMAIN\}/zeaz.dev}"
  host="${host//PRIMARY_DOMAIN/zeaz.dev}"
  host=$(trim_value "$host")
  [[ "$host" == *".zeaz.dev" || "$host" == "zeaz.dev" || "$host" == "'*.zeaz.dev'" || "$host" == "*.zeaz.dev" ]] || continue
  host="${host#\'}"
  host="${host%\'}"
  add_unique tunnel_hosts tunnel_host_seen "$host"
done < <(
  find "$REPO_ROOT/infra/cloudflare" "$REPO_ROOT/infrastructure/cloudflare" "$REPO_ROOT/tunnels" \
    -path '*/.terraform' -prune -o \
    -type f \( -name '*.yml' -o -name '*.yaml' -o -name '*.conf' -o -name '*.template.yml' \) \
    -print0 2>/dev/null | \
    xargs -0 grep -Eh 'hostname:|server_name ' 2>/dev/null | \
    sed -E 's/.*hostname:[[:space:]]*//;s/.*server_name[[:space:]]+//;s/[; ].*$//' || true
)

for host in "${route_hosts[@]}"; do
  if [[ -n "${dns_host_seen[$host]+x}" ]]; then
    dns_overlaps+=("$host (worker: ${route_workers[$host]}, files: ${route_files[$host]})")
    governance_issues+=("$host has Worker route and local Terraform/OpenTofu DNS ownership evidence")
  fi
  if [[ -n "${tunnel_host_seen[$host]+x}" || -n "${tunnel_host_seen["*.zeaz.dev"]+x}" ]]; then
    tunnel_overlaps+=("$host (worker: ${route_workers[$host]}, files: ${route_files[$host]})")
    governance_issues+=("$host has Worker route and local tunnel ownership evidence")
  fi
done

while IFS= read -r ref; do
  [[ -z "$ref" ]] && continue
  terraform_worker_route_refs+=("$ref")
done < <(
  grep -RInE 'cloudflare_(worker|workers)_route' "$REPO_ROOT/terraform" "$REPO_ROOT/opentofu" 2>/dev/null | \
    grep -v '/\.terraform/' || true
)

if [[ ${#route_hosts[@]} -gt 0 && ${#terraform_worker_route_refs[@]} -eq 0 ]]; then
  governance_issues+=("No Terraform/OpenTofu cloudflare_worker_route resources found for current Worker routes")
fi

while IFS= read -r ref; do
  [[ -z "$ref" ]] && continue
  ai_gateway_refs+=("$ref")
done < <(
  grep -RInE 'CLOUDFLARE_AI_GATEWAY|AI_GATEWAY|ai-gateway|gateway:' "$REPO_ROOT/workers-ai" "$REPO_ROOT/workers" 2>/dev/null | \
    grep -v '/node_modules/' || true
)

ISSUE_COUNT=0
ISSUE_COUNT=$((ISSUE_COUNT + ${#missing_examples[@]}))
ISSUE_COUNT=$((ISSUE_COUNT + ${#exact_copy_examples[@]}))
ISSUE_COUNT=$((ISSUE_COUNT + ${#unsafe_examples[@]}))
ISSUE_COUNT=$((ISSUE_COUNT + ${#dns_overlaps[@]}))
ISSUE_COUNT=$((ISSUE_COUNT + ${#tunnel_overlaps[@]}))
ISSUE_COUNT=$((ISSUE_COUNT + ${#governance_issues[@]}))
SCAN_DURATION=$(($(date +%s) - SCAN_START))

if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"scan_timestamp\": $(date +%s),"
  echo "  \"scan_duration_seconds\": $SCAN_DURATION,"
  echo "  \"wrangler_files\": ${#wrangler_files[@]},"
  echo "  \"live_wrangler_files\": ${#live_wrangler_files[@]},"
  echo "  \"example_wrangler_files\": ${#example_wrangler_files[@]},"
  echo "  \"worker_routes\": ${#route_rows[@]},"
  echo "  \"custom_domains\": ${#custom_domain_rows[@]},"
  echo "  \"bindings\": ${#binding_rows[@]},"
  echo "  \"ai_gateway_references\": ${#ai_gateway_refs[@]},"
  echo "  \"placeholder_values\": ${#placeholder_rows[@]},"
  json_array_property "dns_overlaps" dns_overlaps ","
  json_array_property "tunnel_overlaps" tunnel_overlaps ","
  json_array_property "missing_examples" missing_examples ","
  json_array_property "exact_copy_examples" exact_copy_examples ","
  json_array_property "unsafe_examples" unsafe_examples ","
  json_array_property "governance_issues" governance_issues ","
  json_array_property "workers" worker_rows ","
  json_array_property "routes" route_rows ","
  json_array_property "bindings_detail" binding_rows ","
  json_array_property "ai_gateway_detail" ai_gateway_refs ","
  json_array_property "terraform_worker_route_refs" terraform_worker_route_refs ","
  echo "  \"issue_count\": $ISSUE_COUNT"
  echo "}"
elif [[ "$MODE" == "markdown" ]]; then
  echo "# Cloudflare Workers Edge Bindings Scan"
  echo ""
  echo "Generated: $(date -u '+%Y-%m-%d %H:%M:%S UTC')"
  echo ""
  echo "## Summary"
  echo ""
  echo "| Metric | Value |"
  echo "|---|---:|"
  echo "| Wrangler files scanned | ${#wrangler_files[@]} |"
  echo "| Live wrangler files | ${#live_wrangler_files[@]} |"
  echo "| Example wrangler files | ${#example_wrangler_files[@]} |"
  echo "| Worker route entries | ${#route_rows[@]} |"
  echo "| Custom domain references | ${#custom_domain_rows[@]} |"
  echo "| Edge bindings | ${#binding_rows[@]} |"
  echo "| AI Gateway references | ${#ai_gateway_refs[@]} |"
  echo "| Placeholder values | ${#placeholder_rows[@]} |"
  echo "| Missing examples | ${#missing_examples[@]} |"
  echo "| Exact-copy examples | ${#exact_copy_examples[@]} |"
  echo "| Route/DNS overlaps | ${#dns_overlaps[@]} |"
  echo "| Route/tunnel overlaps | ${#tunnel_overlaps[@]} |"
  echo "| Governance issue count | $ISSUE_COUNT |"
  echo ""
  echo "## Workers"
  echo ""
  echo "| File | Name | Main | Compatibility Date | workers_dev | Example |"
  echo "|---|---|---|---|---|---|"
  for row in "${worker_rows[@]}"; do
    IFS='|' read -r rel name main compatibility workers_dev is_example <<< "$row"
    echo "| $rel | $name | $main | $compatibility | $workers_dev | $is_example |"
  done
  echo ""
  echo "## Routes"
  echo ""
  echo "| File | Worker | Pattern | Hostname | Example |"
  echo "|---|---|---|---|---|"
  if [[ ${#route_rows[@]} -eq 0 ]]; then
    echo "| - | - | - | - | - |"
  else
    for row in "${route_rows[@]}"; do
      IFS='|' read -r rel name pattern host is_example <<< "$row"
      echo "| $rel | $name | $pattern | $host | $is_example |"
    done
  fi
  echo ""
  echo "## Bindings"
  echo ""
  echo "| File | Type | Binding | Target | Example |"
  echo "|---|---|---|---|---|"
  if [[ ${#binding_rows[@]} -eq 0 ]]; then
    echo "| - | - | - | - | - |"
  else
    for row in "${binding_rows[@]}"; do
      IFS='|' read -r rel type binding target is_example <<< "$row"
      echo "| $rel | $type | $binding | $target | $is_example |"
    done
  fi
  echo ""
  echo "## AI Gateway References"
  echo ""
  if [[ ${#ai_gateway_refs[@]} -eq 0 ]]; then
    echo "- None found."
  else
    for ref in "${ai_gateway_refs[@]}"; do
      echo "- $ref"
    done
  fi
  echo ""
  echo "## Placeholders"
  echo ""
  if [[ ${#placeholder_rows[@]} -eq 0 ]]; then
    echo "- None found."
  else
    for row in "${placeholder_rows[@]}"; do
      echo "- $row"
    done
  fi
  echo ""
  echo "## Governance Findings"
  echo ""
  if [[ "$ISSUE_COUNT" -eq 0 ]]; then
    echo "- No governance issues found."
  else
    for issue in "${missing_examples[@]}"; do echo "- Missing example: $issue"; done
    for issue in "${exact_copy_examples[@]}"; do echo "- Exact-copy example: $issue"; done
    for issue in "${unsafe_examples[@]}"; do echo "- Unsafe example: $issue"; done
    for issue in "${dns_overlaps[@]}"; do echo "- Route/DNS overlap: $issue"; done
    for issue in "${tunnel_overlaps[@]}"; do echo "- Route/tunnel overlap: $issue"; done
    for issue in "${governance_issues[@]}"; do echo "- Governance: $issue"; done
  fi
else
  echo ""
  echo "========== Workers Edge Binding Scanner =========="
  echo "  Scan completed in ${SCAN_DURATION}s"
  echo "  Wrangler files: ${#wrangler_files[@]} (${#live_wrangler_files[@]} live, ${#example_wrangler_files[@]} examples)"
  echo "  Routes: ${#route_rows[@]}"
  echo "  Bindings: ${#binding_rows[@]}"
  echo "  AI Gateway references: ${#ai_gateway_refs[@]}"
  echo "  Issues: $ISSUE_COUNT"
  echo ""
  if [[ "$ISSUE_COUNT" -eq 0 ]]; then
    log_ok "No governance issues found."
  else
    for issue in "${missing_examples[@]}"; do log_warn "Missing example: $issue"; done
    for issue in "${exact_copy_examples[@]}"; do log_warn "Exact-copy example: $issue"; done
    for issue in "${unsafe_examples[@]}"; do log_error "Unsafe example: $issue"; done
    for issue in "${dns_overlaps[@]}"; do log_warn "Route/DNS overlap: $issue"; done
    for issue in "${tunnel_overlaps[@]}"; do log_warn "Route/tunnel overlap: $issue"; done
    for issue in "${governance_issues[@]}"; do log_warn "Governance: $issue"; done
  fi
  echo "=================================================="
fi

if [[ "$STRICT" == "true" && "$ISSUE_COUNT" -gt 0 ]]; then
  exit 1
fi
exit 0
