#!/usr/bin/env bash
set -euo pipefail

# Phase 18: Cloudflare Environment Boundary Scanner
# Detects cross-environment drift and ownership violations in configuration intent YAMLs.

ENV_DIR="infra/cloudflare/environments"
FORMAT="text"
STRICT=0

show_help() {
    cat <<EOF
Usage: $(basename "$0") [options]

Options:
  --help        Show this help message
  --markdown    Output results in Markdown table format
  --json        Output results in JSON format
  --strict      Exit with non-zero status if any violations are found

Description:
  Scans YAML files in $ENV_DIR for:
  - Duplicate hostnames across environments
  - Production domains (*.zeaz.dev) leaked into dev/staging
  - Missing mandatory fields (owner, environment)
  - Missing 'env:' tags in worker_routes
EOF
}

# Parse arguments
while [[ $# -gt 0 ]]; do
    case "$1" in
        --help) show_help; exit 0 ;;
        --markdown) FORMAT="markdown"; shift ;;
        --json) FORMAT="json"; shift ;;
        --strict) STRICT=1; shift ;;
        *) echo "Unknown option: $1"; show_help; exit 1 ;;
    esac
done

if [[ ! -d "$ENV_DIR" ]]; then
    echo "Error: $ENV_DIR not found."
    exit 1
fi

VIOLATIONS=()
ENV_FILES=("$ENV_DIR"/*.yml)

check_mandatory_fields() {
    local file="$1"
    for field in "environment" "owner"; do
        if ! grep -q "^$field:" "$file"; then
            VIOLATIONS+=("[$file] Missing mandatory field: $field")
        fi
    done
}

check_worker_tags() {
    local file="$1"
    # Basic check for 'env:' inside worker_routes block
    if grep -q "worker_routes:" "$file"; then
        # This is a simple heuristic: if worker_routes exists, check if 'env:' follows
        if ! grep -q "env:" "$file"; then
            VIOLATIONS+=("[$file] Missing 'env:' tag in worker_routes")
        fi
    fi
}

check_prod_leak() {
    local file="$1"
    local base=$(basename "$file")
    if [[ "$base" == "dev.yml" || "$base" == "staging.yml" ]]; then
        # Check for .zeaz.dev without a qualifying prefix that looks like dev/staging
        # For simplicity, flag any .zeaz.dev unless it's in a comment or looks okay
        # Actually the prompt says: Prod domain hostnames present in dev or staging YAML
        # We'll flag any .zeaz.dev that isn't clearly prefixed with 'dev-' or 'staging-' 
        # based on the examples in the YAMLs I created.
        
        # Simpler: flag any .zeaz.dev that matches the production list exactly or matches the pattern.
        # But wait, prod.yml hostnames are the source of truth for what is "prod".
        return
    fi
}

# 1. Collect all hostnames and their sources
declare -A HOSTNAME_MAP
PROD_HOSTNAMES=()

for file in "${ENV_FILES[@]}"; do
    env_name=$(grep "^environment:" "$file" | cut -d' ' -f2 || echo "unknown")
    
    # Extract hostnames (lines starting with - under hostnames:)
    # This is a bit brittle for bash, but works for our simple YAMLs
    in_hostnames=0
    while IFS= read -r line; do
        if [[ "$line" =~ ^hostnames: ]]; then in_hostnames=1; continue; fi
        if [[ $in_hostnames -eq 1 ]]; then
            if [[ "$line" =~ ^[[:space:]]*-[[:space:]]+(.*) ]]; then
                hostname="${BASH_REMATCH[1]}"
                HOSTNAME_MAP["$hostname"]+="$file "
                if [[ "$file" == *"prod.yml" ]]; then
                    PROD_HOSTNAMES+=("$hostname")
                fi
            elif [[ "$line" =~ ^[a-z_]+: ]]; then
                in_hostnames=0
            fi
        fi
    done < "$file"
done

# 2. Detect duplicates
for hostname in "${!HOSTNAME_MAP[@]}"; do
    files=(${HOSTNAME_MAP[$hostname]})
    if [[ ${#files[@]} -gt 1 ]]; then
        VIOLATIONS+=("Duplicate hostname '$hostname' found in: ${files[*]}")
    fi
done

# 3. Detect prod leak in dev/staging
for hostname in "${!HOSTNAME_MAP[@]}"; do
    files=(${HOSTNAME_MAP[$hostname]})
    for file in "${files[@]}"; do
        if [[ "$file" == *"dev.yml" || "$file" == *"staging.yml" ]]; then
            # If hostname is exactly in prod list or matches *.zeaz.dev and doesn't have dev/staging in it
            if [[ "$hostname" == *.zeaz.dev ]]; then
                # Exceptions for staging.zeaz.dev or dev-api.zeaz.dev
                if [[ ! "$hostname" =~ (dev|staging) ]]; then
                    VIOLATIONS+=("[$file] Production domain leak: $hostname")
                fi
            fi
        fi
    done
done

# 4. Mandatory fields and tags
for file in "${ENV_FILES[@]}"; do
    check_mandatory_fields "$file"
    check_worker_tags "$file"
done

# Output results
if [[ "$FORMAT" == "markdown" ]]; then
    echo "# Cloudflare Environment Boundary Scan Results"
    echo ""
    if [[ ${#VIOLATIONS[@]} -eq 0 ]]; then
        echo "✅ No violations found."
    else
        echo "| File | Violation |"
        echo "|------|-----------|"
        for v in "${VIOLATIONS[@]}"; do
            # Split by first ']'
            file=$(echo "$v" | cut -d']' -f1 | sed 's/\[//')
            msg=$(echo "$v" | cut -d']' -f2- | sed 's/^ //')
            if [[ "$v" != *"["* ]]; then
                file="Global"
                msg="$v"
            fi
            echo "| $file | $msg |"
        done
    fi
elif [[ "$FORMAT" == "json" ]]; then
    # Simple JSON construction
    echo "{"
    echo "  \"violations\": ["
    for i in "${!VIOLATIONS[@]}"; do
        echo -n "    \"${VIOLATIONS[$i]}\""
        [[ $i -lt $((${#VIOLATIONS[@]} - 1)) ]] && echo "," || echo ""
    done
    echo "  ],"
    echo "  \"status\": $([[ ${#VIOLATIONS[@]} -eq 0 ]] && echo "\"clean\"" || echo "\"violation\"")"
    echo "}"
else
    if [[ ${#VIOLATIONS[@]} -eq 0 ]]; then
        echo "OK: No boundary violations found."
    else
        echo "VIOLATIONS FOUND:"
        for v in "${VIOLATIONS[@]}"; do
            echo " - $v"
        done
    fi
fi

if [[ $STRICT -eq 1 && ${#VIOLATIONS[@]} -gt 0 ]]; then
    exit 1
fi
exit 0
