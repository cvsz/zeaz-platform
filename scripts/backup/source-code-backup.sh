#!/usr/bin/env bash
# ============================================================
# source-code-backup.sh — Backup only source code from /home/zeazdev
# ============================================================
# This script creates a tar.gz archive of the source code in
# /home/zeazdev, excluding dependencies, virtual environments,
# build artifacts, cache, and heavy git history.
# ============================================================
set -Eeuo pipefail

BACKUP_DIR="/home/zeazdev/backups/source_code"
DATE_TAG="$(date +%Y-%m-%d_%H-%M-%S)"
ARCHIVE_NAME="source-code-backup-${DATE_TAG}.tar.gz"
DEST_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

mkdir -p "$BACKUP_DIR"

echo "======================================================"
echo "Starting Source Code Backup"
echo "Destination: ${DEST_PATH}"
echo "======================================================"

# Create the archive
tar -czvf "$DEST_PATH" \
  --exclude="*/node_modules/*" \
  --exclude="*/.venv/*" \
  --exclude="*/venv/*" \
  --exclude="*/__pycache__/*" \
  --exclude="*/.git/objects/*" \
  --exclude="*/.next/*" \
  --exclude="*/dist/*" \
  --exclude="*/build/*" \
  --exclude="*/.cache/*" \
  --exclude="*/.npm/*" \
  --exclude="*/.cargo/*" \
  --exclude="*/.rustup/*" \
  --exclude="*/.bun/*" \
  --exclude="*/.pnpm-store/*" \
  --exclude="*/.local/share/*" \
  --exclude="*.tar.gz" \
  --exclude="*.zip" \
  --exclude="*.iso" \
  --exclude="*.sqlite3" \
  --exclude="*.db" \
  --exclude="*/tmp/*" \
  --exclude="*/logs/*" \
  -C /home zeazdev

echo "======================================================"
echo "Backup Complete!"
echo "Archive Size: $(du -sh "$DEST_PATH" | cut -f1)"
echo "Path: $DEST_PATH"
echo "======================================================"
