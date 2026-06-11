#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# =============================================================================
# local-state-backup.sh — Create compressed backup of Terraform/OpenTofu state
#                         and configuration examples.
#
# Usage:
#   ./scripts/backup/local-state-backup.sh [--env ENV] [--dry-run]
#
# Options:
#   --env ENV    Environment label (default: "dev")
#   --dry-run    Print what would be done without creating archive
#   --help       Show this help message and exit
#
# Features:
#   - Creates timestamped tar.gz archive in backups/snapshots/
#   - Archives terraform/ configs, opentofu/ configs, example env files,
#     monitoring configs, and zero-trust configs
#   - Excludes .terraform/, node_modules/, __pycache__/, real .env files,
#     .tfstate files, and non-example .tfvars files
#   - Writes SHA256 checksum alongside archive
#   - No destructive operations, safe to run anywhere
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
REPO_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
SNAPSHOT_DIR="$REPO_DIR/backups/snapshots"

ENV="dev"
DRY_RUN=false

# ---------------------------------------------------------------------------
# Help
# ---------------------------------------------------------------------------
show_help() {
  sed -n '/^# ----/,/^# =====/p' "$0" | sed 's/^# \?//g'
  exit 0
}

# ---------------------------------------------------------------------------
# Parse arguments
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --help)
      show_help
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --env)
      if [[ -z "${2:-}" ]]; then
        echo "ERROR: --env requires a value" >&2
        exit 1
      fi
      ENV="$2"
      shift 2
      ;;
    *)
      echo "ERROR: Unknown option: $1" >&2
      echo "Usage: $0 [--env ENV] [--dry-run]" >&2
      exit 1
      ;;
  esac
done

# ---------------------------------------------------------------------------
# Cleanup trap
# ---------------------------------------------------------------------------
cleanup() {
  local exit_code=$?
  # Nothing to clean up currently, but trap is reserved for safety
  exit "$exit_code"
}
trap cleanup EXIT INT TERM

# ---------------------------------------------------------------------------
# Timestamp and archive name
# ---------------------------------------------------------------------------
TIMESTAMP=$(date -u +"%Y%m%dT%H%M%SZ")
ARCHIVE_NAME="local-state-backup-${ENV}-${TIMESTAMP}"
ARCHIVE_FILE="${ARCHIVE_NAME}.tar.gz"
CHECKSUM_FILE="${ARCHIVE_NAME}.sha256"

ARCHIVE_PATH="$SNAPSHOT_DIR/$ARCHIVE_FILE"
CHECKSUM_PATH="$SNAPSHOT_DIR/$CHECKSUM_FILE"

echo "[local-state-backup] Environment: $ENV"
echo "[local-state-backup] Timestamp:   $TIMESTAMP"

if [[ "$DRY_RUN" == true ]]; then
  echo "[local-state-backup] *** DRY RUN — no files will be created ***"
fi

# ---------------------------------------------------------------------------
# Build file list
# ---------------------------------------------------------------------------
INCLUDE_PATTERNS=()

# Terraform config files (excluding .terraform/ and state)
while IFS= read -r -d '' f; do
  INCLUDE_PATTERNS+=("$f")
done < <(
  find "$REPO_DIR/terraform" \
    -type f \( -name "*.tf" -o -name "*.tfvars.example" \) \
    -not -path "*/.terraform/*" \
    -not -name "*.tfstate" \
    -not -name "*.tfstate.*" \
    -print0 2>/dev/null || true
)

# OpenTofu config files
if [[ -d "$REPO_DIR/opentofu" ]]; then
  while IFS= read -r -d '' f; do
    INCLUDE_PATTERNS+=("$f")
  done < <(
    find "$REPO_DIR/opentofu" \
      -type f \( -name "*.tf" -o -name "*.tfvars.example" -o -name "*.tofu" \) \
      -not -path "*/.terraform/*" \
      -not -name "*.tfstate" \
      -not -name "*.tfstate.*" \
      -print0 2>/dev/null || true
  )
fi

# Example env files
for f in \
  "$REPO_DIR/.env.example" \
  "$REPO_DIR/.env.cloudflare.example"; do
  if [[ -f "$f" ]]; then
    INCLUDE_PATTERNS+=("$f")
  fi
done

# Monitoring configs
if [[ -d "$REPO_DIR/monitoring" ]]; then
  while IFS= read -r -d '' f; do
    INCLUDE_PATTERNS+=("$f")
  done < <(
    find "$REPO_DIR/monitoring" \
      -type f \
      -not -path "*/node_modules/*" \
      -not -path "*/__pycache__/*" \
      -print0 2>/dev/null || true
  )
fi

# Zero-trust configs
if [[ -d "$REPO_DIR/zero-trust" ]]; then
  while IFS= read -r -d '' f; do
    INCLUDE_PATTERNS+=("$f")
  done < <(
    find "$REPO_DIR/zero-trust" \
      -type f \
      -not -path "*/node_modules/*" \
      -not -path "*/__pycache__/*" \
      -print0 2>/dev/null || true
  )
fi

# Remove duplicates
mapfile -t UNIQUE_FILES < <(printf "%s\n" "${INCLUDE_PATTERNS[@]}" | sort -u)

# ---------------------------------------------------------------------------
# Preview
# ---------------------------------------------------------------------------
echo ""
echo "[local-state-backup] Files to archive: ${#UNIQUE_FILES[@]}"
if [[ ${#UNIQUE_FILES[@]} -gt 0 ]]; then
  printf "  %s\n" "${UNIQUE_FILES[@]}"
fi

# ---------------------------------------------------------------------------
# Create archive (unless dry-run)
# ---------------------------------------------------------------------------
if [[ "$DRY_RUN" == true ]]; then
  echo ""
  echo "[local-state-backup] Would create:  $ARCHIVE_PATH"
  echo "[local-state-backup] Would create:  $CHECKSUM_PATH"
  echo "[local-state-backup] Dry-run complete."
  exit 0
fi

# Ensure snapshot directory exists
mkdir -p "$SNAPSHOT_DIR"

echo ""
echo "[local-state-backup] Creating archive..."

# Build tar.gz from the file list, stripping the repo prefix for portability
tar -czf "$ARCHIVE_PATH" \
  --transform "s|^$REPO_DIR/||" \
  "${UNIQUE_FILES[@]}" 2>/dev/null

echo "[local-state-backup] Archive created: $ARCHIVE_PATH"

# Write SHA256 checksum
sha256sum "$ARCHIVE_PATH" > "$CHECKSUM_PATH"
echo "[local-state-backup] Checksum written: $CHECKSUM_PATH"

ARCHIVE_SIZE=$(stat -c%s "$ARCHIVE_PATH" 2>/dev/null || stat -f%z "$ARCHIVE_PATH" 2>/dev/null)
echo "[local-state-backup] Archive size: $ARCHIVE_SIZE bytes"
echo "[local-state-backup] Backup complete."
