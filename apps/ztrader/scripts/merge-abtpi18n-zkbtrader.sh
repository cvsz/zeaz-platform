#!/usr/bin/env bash
set -Eeuo pipefail

# ztrader Merge Script: ABTPi18n + zkbtrader -> ztrader
# This script implements the mapping defined in docs/architecture/ZTRADER_MERGE_DESIGN.md

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
TARGET_APP="apps/ztrader"
SOURCE_ABT="apps/ABTPi18n"
SOURCE_ZKB="apps/zkbtrader"

DRY_RUN=${DRY_RUN:-true}

log() {
    echo "[$(date +'%Y-%m-%dT%H:%M:%S%z')] $*"
}

if [ "$DRY_RUN" = "true" ]; then
    log "DRY RUN MODE: No files will be copied."
else
    log "APPLY MODE: Executing migration..."
fi

# Define mappings (SOURCE -> TARGET) relative to ROOT_DIR
declare -A MAPPINGS=(
    ["$SOURCE_ABT/configs"]="$TARGET_APP/config/abtpi18n"
    ["$SOURCE_ABT/core"]="$TARGET_APP/backend/src/ztrader/abt/core"
    ["$SOURCE_ABT/strategies"]="$TARGET_APP/backend/src/ztrader/strategies/abtpi18n"
    ["$SOURCE_ABT/monitoring"]="$TARGET_APP/backend/src/ztrader/monitoring/abtpi18n"
    ["$SOURCE_ABT/scripts"]="$TARGET_APP/scripts/abtpi18n"
    ["$SOURCE_ABT/tests"]="$TARGET_APP/backend/tests/abtpi18n"
    ["$SOURCE_ABT/tools"]="$TARGET_APP/backend/src/ztrader/abt/tools"
    ["$SOURCE_ABT/apps/backend/src"]="$TARGET_APP/backend/src/ztrader/abt"
    ["$SOURCE_ZKB/src"]="$TARGET_APP/backend/src/ztrader/zkb"
    ["$SOURCE_ZKB/harness"]="$TARGET_APP/harness/zkbtrader"
    ["$SOURCE_ZKB/tests"]="$TARGET_APP/backend/tests/zkbtrader"
    ["$SOURCE_ZKB/reports"]="$TARGET_APP/reports/zkbtrader"
    ["$SOURCE_ZKB/scripts"]="$TARGET_APP/scripts/zkbtrader"
    ["$SOURCE_ZKB/alembic"]="$TARGET_APP/backend/alembic/zkbtrader_source"
)

# Metadata capture
METADATA_DIR="$TARGET_APP/merge-sources"
if [ "$DRY_RUN" = "false" ]; then
    mkdir -p "$ROOT_DIR/$METADATA_DIR"
    cp "$ROOT_DIR/$SOURCE_ABT/package.json" "$ROOT_DIR/$METADATA_DIR/abtpi18n-package.json" || true
    cp "$ROOT_DIR/$SOURCE_ZKB/package.json" "$ROOT_DIR/$METADATA_DIR/zkbtrader-package.json" || true
fi

for src in "${!MAPPINGS[@]}"; do
    dest="${MAPPINGS[$src]}"
    
    if [ -d "$ROOT_DIR/$src" ]; then
        if [ "$DRY_RUN" = "true" ]; then
            log "PLAN: Copy $src -> $dest"
        else
            log "COPY: $src -> $dest"
            mkdir -p "$ROOT_DIR/$dest"
            cp -r "$ROOT_DIR/$src/." "$ROOT_DIR/$dest/"
        fi
    else
        log "WARN: Source directory $src not found. Skipping."
    fi
done

if [ "$DRY_RUN" = "false" ]; then
    log "Migration applied successfully."
else
    log "Dry run completed."
fi
