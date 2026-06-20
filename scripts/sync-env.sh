#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# Environment Variable Syncer (Single Source of Truth)
# Synchronizes values from root .env to apps/*/.env and targets defined in packages

log() { printf '[%s] %s\n' "sync-env" "$*"; }
err() { printf '[%s] ERROR: %s\n' "sync-env" "$*" >&2; }

ROOT_ENV=".env"
ROOT_ENV_EXAMPLE=".env.example"

if [[ ! -f "$ROOT_ENV" ]]; then
    err "Root .env file not found. Run 'make setup' or create it manually."
    exit 1
fi

# List of apps and their subdirectories to sync
APPS=(
    "apps/ztrader"
    "apps/ztrader/backend"
    "apps/ztrader/frontend"
    "apps/zsticker"
    "apps/zoffice"
    "apps/zwallet"
    "apps/zwallet/backend"
    "apps/zlms"
    "apps/zdash"
    "apps/zdash/backend"
    "apps/zveo"
    "apps/zeaz-web"
    "apps/zfbauto"
    "apps/zlinebot"
    "apps/zacademy"
)

# Function to append or replace value in target file
sync_var() {
    local key="$1"
    local val="$2"
    local target_file="$3"
    
    # Escape special characters for sed
    local escaped_val
    escaped_val=$(echo "$val" | sed 's/[\/&]/\\&/g')
    
    if grep -q "^${key}=" "$target_file"; then
        # Replace existing value
        sed -i "s/^${key}=.*/${key}=${escaped_val}/" "$target_file"
    else
        # Append new value
        echo "${key}=${val}" >> "$target_file"
    fi
}

log "Starting environment synchronization from root .env..."

# Parse root .env and sync variables to each target app
for app_dir in "${APPS[@]}"; do
    if [[ -d "$app_dir" ]]; then
        target_env="${app_dir}/.env"
        target_env_example="${app_dir}/.env.example"
        
        log "Syncing environment keys for: $app_dir"
        
        # 1. Create target .env and .env.example if they do not exist
        touch "$target_env"
        if [[ -f "$ROOT_ENV_EXAMPLE" && ! -f "$target_env_example" ]]; then
            cp "$ROOT_ENV_EXAMPLE" "$target_env_example"
        fi
        
        # 2. Sync all variables from root .env
        while IFS= read -r line || [[ -n "$line" ]]; do
            # Skip comments and empty lines
            if [[ "$line" =~ ^[[:space:]]*# ]] || [[ -z "$line" ]]; then
                continue
            fi
            
            # Extract key and value
            if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
                key="${BASH_REMATCH[1]}"
                val="${BASH_REMATCH[2]}"
                
                # Strip leading/trailing whitespaces and optional quotes
                key=$(echo "$key" | xargs)
                
                # Sync variable to target app env file
                sync_var "$key" "$val" "$target_env"
            fi
        done < "$ROOT_ENV"
    fi
done

log "Environment synchronization complete across all services."
exit 0
