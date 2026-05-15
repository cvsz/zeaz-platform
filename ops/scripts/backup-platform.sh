#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="/opt/backups/platform/$(date +%Y-%m-%d)"
mkdir -p "$BACKUP_DIR"

echo "== Zeaz platform backup =="

if command -v pg_dump >/dev/null 2>&1; then
  sudo -u postgres pg_dump zwallet | gzip > "$BACKUP_DIR/zwallet.sql.gz" || true
  sudo -u postgres pg_dump zveo | gzip > "$BACKUP_DIR/zveo.sql.gz" || true
fi

if [ -d /etc/cloudflared ]; then
  tar -czf "$BACKUP_DIR/cloudflared.tar.gz" /etc/cloudflared >/dev/null 2>&1 || true
fi

if [ -d /etc/systemd/system ]; then
  tar -czf "$BACKUP_DIR/systemd-zeaz.tar.gz" \
    /etc/systemd/system/zwallet* \
    /etc/systemd/system/zveo* \
    /etc/systemd/system/cloudflared.service \
    >/dev/null 2>&1 || true
fi

for env_file in /etc/zveo.env /etc/zwallet.env; do
  if [ -f "$env_file" ]; then
    cp "$env_file" "$BACKUP_DIR/$(basename "$env_file").bak"
  fi
done

for repo in /opt/zveo /opt/zwallet /opt/cloudflare-platform; do
  if [ -d "$repo/.git" ]; then
    git -C "$repo" rev-parse HEAD > "$BACKUP_DIR/$(basename "$repo")-commit.txt" || true
  fi
done

find /opt/backups/platform -mindepth 1 -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +

echo "Backup complete: $BACKUP_DIR"
