#!/usr/bin/env bash
# scan-workers-routes.sh
# Phase 6: Read-only scanner for Cloudflare Worker/Wrangler route ownership.
# Scans all wrangler.toml files, worker configs, and terraform worker modules.
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

# ---------- Help ----------
show_help() {
  cat <<EOF
Usage: $(basename "$0") [OPTIONS]

Scan the repository for Cloudflare Worker and Wrangler configuration files.
Reports on routes, bindings, placeholders, and ownership conflicts.

Read-only scanner. No API calls. No modifications.

Scans:
  - wrangler.toml, wrangler.example.toml, wrangler.*.toml
  - workers/**
  - apps/**
  - infra/**/*.toml
  - terraform/**/*.tf (worker resources)
  - opentofu/**/*.tf (worker modules)

Detection:
  - Routes (route = "...", routes = [...])
  - Custom domains (custom_domain)
  - Zone/account references
  - KV/R2/D1/Queues bindings
  - Hardcoded IDs vs placeholder IDs
  - Duplicate routes across workers
  - Worker routes overlapping tunnel-owned hostnames

Options:
  --help          Show this help message and exit
  --markdown      Output in Markdown format
  --json          Output in JSON format
  --strict        Exit non-zero on conflicts, duplicates, placeholders

Exit codes:
  0   Clean (or --strict not specified)
  1   Issues found (with --strict)
  2   Error during scan
EOF
}

# ---------- Parse ----------
MODE="human"
STRICT=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)     show_help; exit 0 ;;
    --markdown) MODE="markdown" ;;
    --json)     MODE="json" ;;
    --strict)   STRICT=true ;;
    *)          log_error "Unknown option: $1"; show_help; exit 2 ;;
  esac
  shift
done

# ---------- Scan ----------
log_info "Scanning for Worker/Wrangler route configurations..."

SCAN_START=$(date +%s)

declare -a wrangler_files=()
declare -a worker_tf_files=()

while IFS= read -r -d '' f; do
  wrangler_files+=("$f")
done < <(
  find "$REPO_ROOT" \
    -path '*/node_modules' -prune -o \
    -path '*/.git' -prune -o \
    -path '*/.venv' -prune -o \
    -path '*/.backup' -prune -o \
    -path '*/.terraform' -prune -o \
    -path '*/.wrangler' -prune -o \
    -type f \( -name 'wrangler*.toml' -o -name 'wrangler.toml' \) \
    -print0 2>/dev/null || true
)

while IFS= read -r -d '' f; do
  worker_tf_files+=("$f")
done < <(
  find "$REPO_ROOT" \
    -path '*/node_modules' -prune -o \
    -path '*/.git' -prune -o \
    -path '*/.venv' -prune -o \
    -path '*/.backup' -prune -o \
    -path '*/.terraform' -prune -o \
    -type f -path '*workers*' -name '*.tf' \
    -print0 2>/dev/null || true
)

# ---------- Parse wrangler files ----------
declare -A worker_names      # file -> name
declare -A worker_routes     # file -> route list
declare -A worker_domains    # file -> custom domains
declare -A worker_bindings   # file -> binding summary
declare -A worker_placeholders # file -> placeholder IDs
declare -A worker_hardcoded  # file -> hardcoded IDs
declare -A worker_dev        # file -> workers_dev value
declare -A worker_is_example # file -> true/false
declare -a all_routes=()     # all route patterns found
declare -A route_workers     # route -> worker name list
declare -A route_files       # route -> file list

parse_wrangler() {
  local file="$1"
  local rel="${file#$REPO_ROOT/}"
  local name="" main_js="" dev="" has_routes=false
  local -a routes=()
  local -a bindings=()
  local -a placeholders=()
  local -a hardcoded=()

  name=$(grep -E '^name[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed 's/.*=[[:space:]]*"//;s/".*//' || true)
  main_js=$(grep -E '^main[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed 's/.*=[[:space:]]*"//;s/".*//' || true)
  dev=$(grep -E '^workers_dev[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed 's/.*=[[:space:]]*//' || true)

  worker_names["$rel"]="$name"
  worker_dev["$rel"]="$dev"

  if [[ "$rel" == *.example* ]]; then
    worker_is_example["$rel"]="true"
  else
    worker_is_example["$rel"]="false"
  fi

  # Extract routes (multi-line: routes = [...])
  local in_routes=false
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^routes[[:space:]]*='; then
      in_routes=true
      continue
    fi
    if [[ "$in_routes" == true ]]; then
      if echo "$line" | grep -qE '\]'; then
        in_routes=false
        continue
      fi
      local pat
      pat=$(echo "$line" | grep -oE 'pattern[[:space:]]*=[[:space:]]*"[^"]*"' | sed 's/.*="//;s/"//')
      if [[ -n "$pat" ]]; then
        routes+=("$pat")
        hostname="${pat%%/*}"
        all_routes+=("$hostname")
        if [[ -n "${route_workers[$hostname]:-}" ]]; then
          route_workers["$hostname"]="${route_workers[$hostname]}, $name"
          route_files["$hostname"]="${route_files[$hostname]}, $rel"
        else
          route_workers["$hostname"]="$name"
          route_files["$hostname"]="$rel"
        fi
      fi
    fi
  done < "$file"

  # Also check for single route = "..."
  local single_route
  single_route=$(grep -E '^route[[:space:]]*=' "$file" 2>/dev/null | head -1 | sed 's/.*=[[:space:]]*"//;s/".*//' || true)
  if [[ -n "$single_route" ]]; then
    routes+=("$single_route")
    hostname="${single_route%%/*}"
    all_routes+=("$hostname")
    if [[ -n "${route_workers[$hostname]:-}" ]]; then
      route_workers["$hostname"]="${route_workers[$hostname]}, $name"
      route_files["$hostname"]="${route_files[$hostname]}, $rel"
    else
      route_workers["$hostname"]="$name"
      route_files["$hostname"]="$rel"
    fi
  fi

  worker_routes["$rel"]="${routes[*]:-}"

  # Check for custom_domain
  if grep -qE 'custom_domain' "$file" 2>/dev/null; then
    worker_domains["$rel"]="true"
  fi

  # Check bindings: kv_namespaces, r2_buckets, d1_databases, queues
  local binding_type="" binding_name="" binding_id="" in_block=false
  while IFS= read -r line; do
    if echo "$line" | grep -qE '^\[\[(kv_namespaces|r2_buckets|d1_databases|queues)\]\]'; then
      [[ -n "$binding_name" && -n "$binding_type" ]] && bindings+=("$binding_type:$binding_name")
      binding_type=$(echo "$line" | sed 's/.*\[\[//;s/\]\]//')
      binding_name=""
      binding_id=""
      in_block=true
      continue
    fi
    if [[ "$in_block" == true ]]; then
      if echo "$line" | grep -qE '^binding[[:space:]]*='; then
        binding_name=$(echo "$line" | sed 's/.*=[[:space:]]*"//;s/".*//')
      fi
      if echo "$line" | grep -qE '^id[[:space:]]*='; then
        local raw_id
        raw_id=$(echo "$line" | sed 's/.*=[[:space:]]*"//;s/".*//')
        binding_id="$raw_id"
        if [[ "$raw_id" =~ ^0{32}$ ]] || [[ "$raw_id" =~ ^0{8}-0{4}-0{4}-0{4}-0{12}$ ]]; then
          placeholders+=("$binding_name=$raw_id")
        elif [[ -n "$raw_id" ]]; then
          hardcoded+=("$binding_name=$raw_id")
        fi
      fi
    fi
  done < "$file"

  # Save last binding
  [[ -n "$binding_name" && -n "$binding_type" ]] && bindings+=("$binding_type:$binding_name")

  worker_bindings["$rel"]="${bindings[*]:-}"
  [[ ${#placeholders[@]} -gt 0 ]] && worker_placeholders["$rel"]="${placeholders[*]}"
  [[ ${#hardcoded[@]} -gt 0 ]] && worker_hardcoded["$rel"]="${hardcoded[*]}"
  return 0
}

for f in "${wrangler_files[@]}"; do
  parse_wrangler "$f"
done

# ---------- Parse Terraform worker files ----------
declare -a tf_worker_modules=()

for f in "${worker_tf_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  has_script=$(grep -c 'cloudflare_worker_script' "$f" 2>/dev/null) || true
  [[ -z "$has_script" ]] && has_script=0
  has_route=$(grep -c 'cloudflare_worker_route' "$f" 2>/dev/null) || true
  [[ -z "$has_route" ]] && has_route=0
  if [[ "$has_script" -gt 0 ]] || [[ "$has_route" -gt 0 ]]; then
    tf_worker_modules+=("$rel (script:$has_script, route:$has_route)")
  fi
done

SCAN_DURATION=$(($(date +%s) - SCAN_START))

# ---------- Analysis ----------
declare -a duplicate_routes=()
declare -a tunnel_overlaps=()

# Check duplicate routes
for hostname in "${!route_workers[@]}"; do
  count=$(echo "${route_workers[$hostname]}" | awk -F', ' '{print NF}')
  if [[ "$count" -gt 1 ]]; then
    duplicate_routes+=("$hostname (workers: ${route_workers[$hostname]})")
  fi
done

# Check route vs example exact copies
declare -a exact_copies=()
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" != *.example* ]] && continue

  live="${rel%.example}"
  live="${live%.example}"
  if [[ -f "$REPO_ROOT/$live" ]]; then
    if diff -q "$REPO_ROOT/$live" "$f" &>/dev/null; then
      exact_copies+=("$live → $rel (exact copy)")
    fi
  fi
done

# Check missing examples
declare -a missing_examples=()
for f in "${wrangler_files[@]}"; do
  rel="${f#$REPO_ROOT/}"
  [[ "$rel" == *.example* ]] && continue
  [[ "$rel" == *".toml.bak"* || "$rel" == *".toml.legacy"* ]] && continue

  example_candidates=("${rel}.example" "${rel%.toml}.example.toml")
  found=false
  for ex in "${example_candidates[@]}"; do
    if [[ -f "$REPO_ROOT/$ex" ]]; then
      found=true
      break
    fi
  done
  if [[ "$found" == false ]]; then
    missing_examples+=("$rel")
  fi
done

# Count placeholder IDs
total_placeholders=0
for rel in "${!worker_placeholders[@]}"; do
  vals="${worker_placeholders[$rel]}"
  count=$(echo "$vals" | wc -w)
  total_placeholders=$((total_placeholders + count))
done

# Count hardcoded IDs
total_hardcoded=0
for rel in "${!worker_hardcoded[@]}"; do
  vals="${worker_hardcoded[$rel]}"
  count=$(echo "$vals" | wc -w)
  total_hardcoded=$((total_hardcoded + count))
done

# Overlap with common tunnel hostnames from Phase 5 knowledge
KNOWN_TUNNEL_HOSTNAMES=(
  "app.zeaz.dev" "zveo.zeaz.dev" "zcino.zeaz.dev" "api.zeaz.dev"
  "auth.zeaz.dev" "grafana.zeaz.dev" "loki.zeaz.dev" "admin-wallet.zeaz.dev"
  "zcloud.zeaz.dev" "ztest.zeaz.dev" "office.zeaz.dev" "cctv.zeaz.dev"
  "api-zveo.zeaz.dev" "api-zdash.zeaz.dev" "api-zcfdash.zeaz.dev"
  "api-ztrader.zeaz.dev" "api-zzdash.zeaz.dev" "studio.zeaz.dev"
  "zdash.zeaz.dev" "ztrader.zeaz.dev" "zcfdash.zeaz.dev" "zoffice.zeaz.dev"
  "zaiz.zeaz.dev" "zsticker.zeaz.dev" "zlms.zeaz.dev" "dash.zeaz.dev"
  "zow.zeaz.dev" "ssh.zeaz.dev" "panel.zeaz.dev" "trader.zeaz.dev"
  "ws.trader.zeaz.dev" "risk.zeaz.dev" "memory.zeaz.dev" "agents.zeaz.dev"
  "fcc.zeaz.dev" "release.zeaz.dev" "zkbtrader.zeaz.dev"
  "zzdash.zeaz.dev" "prometheus.zeaz.dev" "admin.zeaz.dev" "tunnel.zeaz.dev"
)

for hostname in "${!route_workers[@]}"; do
  for known in "${KNOWN_TUNNEL_HOSTNAMES[@]}"; do
    if [[ "$hostname" == "$known" ]]; then
      tunnel_overlaps+=("$hostname (worker: ${route_workers[$hostname]}, files: ${route_files[$hostname]})")
    fi
  done
done

ISSUE_COUNT=0
[[ ${#duplicate_routes[@]} -gt 0 ]] && ISSUE_COUNT=$((ISSUE_COUNT + ${#duplicate_routes[@]}))
[[ ${#exact_copies[@]} -gt 0 ]] && ISSUE_COUNT=$((ISSUE_COUNT + ${#exact_copies[@]}))
[[ ${#missing_examples[@]} -gt 0 ]] && ISSUE_COUNT=$((ISSUE_COUNT + ${#missing_examples[@]}))
[[ "$total_placeholders" -gt 0 ]] && ISSUE_COUNT=$((ISSUE_COUNT + 1))
[[ ${#tunnel_overlaps[@]} -gt 0 ]] && ISSUE_COUNT=$((ISSUE_COUNT + ${#tunnel_overlaps[@]}))

# ---------- Output ----------
if [[ "$MODE" == "json" ]]; then
  echo "{"
  echo "  \"scan_timestamp\": $(date +%s),"
  echo "  \"scan_duration_seconds\": $SCAN_DURATION,"
  echo "  \"wrangler_files\": ${#wrangler_files[@]},"
  echo "  \"terraform_worker_modules\": ${#tf_worker_modules[@]},"
  echo "  \"worker_names\": {"
  first=true
  for rel in $(echo "${!worker_names[@]}" | tr ' ' '\n' | sort); do
    $first || echo ","
    first=false
    echo -n "    \"$rel\": \"${worker_names[$rel]}\""
  done
  echo ""
  echo "  },"
  echo "  \"routes\": {"
  first=true
  for hostname in $(echo "${!route_workers[@]}" | tr ' ' '\n' | sort); do
    $first || echo ","
    first=false
    echo -n "    \"$hostname\": { \"worker\": \"${route_workers[$hostname]}\", \"files\": \"${route_files[$hostname]}\" }"
  done
  echo ""
  echo "  },"
  echo "  \"duplicate_routes\": ["
  for i in "${!duplicate_routes[@]}"; do
    comma=","
    [[ $i -eq $((${#duplicate_routes[@]} - 1)) ]] && comma=""
    echo "    \"${duplicate_routes[$i]}\"$comma"
  done
  echo "  ],"
  echo "  \"exact_copies\": ["
  for i in "${!exact_copies[@]}"; do
    comma=","
    [[ $i -eq $((${#exact_copies[@]} - 1)) ]] && comma=""
    echo "    \"${exact_copies[$i]}\"$comma"
  done
  echo "  ],"
  echo "  \"missing_examples\": ["
  for i in "${!missing_examples[@]}"; do
    comma=","
    [[ $i -eq $((${#missing_examples[@]} - 1)) ]] && comma=""
    echo "    \"${missing_examples[$i]}\"$comma"
  done
  echo "  ],"
  echo "  \"tunnel_overlaps\": ["
  for i in "${!tunnel_overlaps[@]}"; do
    comma=","
    [[ $i -eq $((${#tunnel_overlaps[@]} - 1)) ]] && comma=""
    echo "    \"${tunnel_overlaps[$i]}\"$comma"
  done
  echo "  ],"
  echo "  \"placeholders\": $total_placeholders,"
  echo "  \"hardcoded_ids\": $total_hardcoded,"
  echo "  \"issue_count\": $ISSUE_COUNT"
  echo "}"
elif [[ "$MODE" == "markdown" ]]; then
  echo "# Workers Route Scan Report"
  echo ""
  echo "Generated: $(date)"
  echo ""
  echo "## Summary"
  echo ""
  echo "| Metric | Value |"
  echo "|---|---|"
  echo "| Wrangler files scanned | ${#wrangler_files[@]} |"
  echo "| Terraform worker modules | ${#tf_worker_modules[@]} |"
  echo "| Worker names found | ${#worker_names[@]} |"
  echo "| Total routes defined | ${#all_routes[@]} |"
  echo "| Unique route hostnames | ${#route_workers[@]} |"
  echo "| Duplicate routes | ${#duplicate_routes[@]} |"
  echo "| Exact copies (live→example) | ${#exact_copies[@]} |"
  echo "| Missing example files | ${#missing_examples[@]} |"
  echo "| Placeholder IDs | $total_placeholders |"
  echo "| Hardcoded IDs | $total_hardcoded |"
  echo "| Route/Tunnel overlaps | ${#tunnel_overlaps[@]} |"
  echo ""
  echo "## Workers"
  echo ""
  echo "| File | Name | workers_dev | Routes | Bindings | Placeholder IDs |"
  echo "|---|---|---|---|---|---|"
  for rel in $(echo "${!worker_names[@]}" | tr ' ' '\n' | sort); do
    name="${worker_names[$rel]}"
    dev="${worker_dev[$rel]:-}"
    routes="${worker_routes[$rel]:--}"
    bindings="${worker_bindings[$rel]:--}"
    ph="${worker_placeholders[$rel]:--}"
    [[ -z "$routes" ]] && routes="-"
    [[ -z "$bindings" ]] && bindings="-"
    echo "| $rel | $name | $dev | $routes | $bindings | $ph |"
  done
  echo ""
  if [[ ${#duplicate_routes[@]} -gt 0 ]]; then
    echo "## Duplicate Routes"
    echo ""
    for d in "${duplicate_routes[@]}"; do
      echo "- $d"
    done
    echo ""
  fi
  if [[ ${#exact_copies[@]} -gt 0 ]]; then
    echo "## Exact Copies (Live → Example)"
    echo ""
    for c in "${exact_copies[@]}"; do
      echo "- $c"
    done
    echo ""
  fi
  if [[ ${#missing_examples[@]} -gt 0 ]]; then
    echo "## Missing Example Files"
    echo ""
    for m in "${missing_examples[@]}"; do
      echo "- $m"
    done
    echo ""
  fi
  if [[ ${#tunnel_overlaps[@]} -gt 0 ]]; then
    echo "## Route/Tunnel Overlaps"
    echo ""
    echo "These Worker routes overlap with hostnames owned by tunnel ingress:"
    echo ""
    for o in "${tunnel_overlaps[@]}"; do
      echo "- $o"
    done
    echo ""
  fi
  if [[ ${#tf_worker_modules[@]} -gt 0 ]]; then
    echo "## Terraform Worker Modules"
    echo ""
    for m in "${tf_worker_modules[@]}"; do
      echo "- $m"
    done
    echo ""
  fi
  echo "## Bindings Summary"
  echo ""
  echo "| File | Binding | Type | ID Status |"
  echo "|---|---|---|---|"
  for rel in $(echo "${!worker_names[@]}" | tr ' ' '\n' | sort); do
    bindings="${worker_bindings[$rel]:-}"
    ph="${worker_placeholders[$rel]:-}"
    if [[ -n "$bindings" && "$bindings" != "-" ]]; then
      IFS=' ' read -ra b_arr <<< "$bindings"
      for b in "${b_arr[@]}"; do
        btype="${b%%:*}"
        bname="${b#*:}"
        status="ok"
        if echo "$ph" | grep -q "$bname"; then
          status="**PLACEHOLDER**"
        fi
        echo "| $rel | $bname | $btype | $status |"
      done
    fi
  done
  echo ""
  echo "## Terraform/OpenTofu Worker Module Summary"
  echo ""
  echo "| File | Resource | Status |"
  echo "|---|---|---|"
  for m in "${tf_worker_modules[@]}"; do
    echo "| ${m% (*} | cloudflare_worker_script | Skeleton, not wired |"
  done
else
  echo ""
  echo "========== Worker Route Scanner =========="
  echo "  Scan completed in ${SCAN_DURATION}s"
  echo "  Wrangler files: ${#wrangler_files[@]}"
  echo "  TF worker modules: ${#tf_worker_modules[@]}"
  echo "  Worker names: ${#worker_names[@]}"
  echo "  Routes: ${#all_routes[@]} (${#route_workers[@]} unique hostnames)"
  echo ""

  echo "--- Workers ---"
  printf "  %-50s %-20s %s\n" "File" "Name" "Routes"
  printf "  %-50s %-20s %s\n" "----" "----" "------"
  for rel in $(echo "${!worker_names[@]}" | tr ' ' '\n' | sort); do
    name="${worker_names[$rel]}"
    routes="${worker_routes[$rel]:--}"
    printf "  %-50s %-20s %s\n" "$rel" "$name" "$routes"
  done
  echo ""

  echo "--- Issues ---"
  if [[ ${#exact_copies[@]} -gt 0 ]]; then
    for c in "${exact_copies[@]}"; do
      log_warn "Exact copy: $c"
    done
  fi
  if [[ ${#missing_examples[@]} -gt 0 ]]; then
    for m in "${missing_examples[@]}"; do
      log_warn "Missing example: $m"
    done
  fi
  if [[ "$total_placeholders" -gt 0 ]]; then
    for rel in "${!worker_placeholders[@]}"; do
      log_warn "Placeholder IDs in $rel: ${worker_placeholders[$rel]}"
    done
  fi
  if [[ ${#duplicate_routes[@]} -gt 0 ]]; then
    for d in "${duplicate_routes[@]}"; do
      log_warn "Duplicate route: $d"
    done
  fi
  if [[ ${#tunnel_overlaps[@]} -gt 0 ]]; then
    for o in "${tunnel_overlaps[@]}"; do
      log_warn "Route/tunnel overlap: $o"
    done
  fi
  if [[ "$ISSUE_COUNT" -eq 0 ]]; then
    log_ok "No issues found."
  fi
  echo "  Issue count: $ISSUE_COUNT"
  echo "=========================================="
fi

# ---------- Exit ----------
if [[ "$STRICT" == true ]]; then
  if [[ ${#duplicate_routes[@]} -gt 0 ]] || [[ ${#exact_copies[@]} -gt 0 ]] || \
     [[ ${#tunnel_overlaps[@]} -gt 0 ]] || [[ "$total_placeholders" -gt 0 ]]; then
    exit 1
  fi
fi
exit 0
