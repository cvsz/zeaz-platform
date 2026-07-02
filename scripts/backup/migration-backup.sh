#!/usr/bin/env bash
# ============================================================
# migration-backup.sh — Backup source code for Server Migration
# ============================================================
# This script creates a tar.gz archive of the source code in
# /home/zeazdev. 
#
# IMPORTANT FOR MIGRATION: 
# It PRESERVES .git history so repositories remain fully functional
# on the new server. It only excludes heavy dependencies, caches,
# and build artifacts.
# ============================================================
set -Eeuo pipefail

BACKUP_DIR="/home/zeazdev/backups/migration"
DATE_TAG="$(date +%Y-%m-%d_%H-%M-%S)"
ARCHIVE_NAME="migration-source-backup-${DATE_TAG}.tar.gz"
DEST_PATH="${BACKUP_DIR}/${ARCHIVE_NAME}"

mkdir -p "$BACKUP_DIR"

echo "======================================================"
echo "Starting Migration Source Code Backup"
echo "Destination: ${DEST_PATH}"
echo "======================================================"

# Create the archive
tar -czvf "$DEST_PATH" \
  --exclude="*/node_modules/*" \
  --exclude="*/.venv/*" \
  --exclude="*/venv/*" \
  --exclude="*/__pycache__/*" \
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
  --exclude="*/.docker/*" \
  --exclude="*/.dotnet/*" \
  --exclude="*/.nvm/*" \
  -C /home zeazdev

echo "======================================================"
echo "Migration Backup Complete!"
echo "Archive Size: $(du -sh "$DEST_PATH" | cut -f1)"
echo "Path: $DEST_PATH"
echo "======================================================"
