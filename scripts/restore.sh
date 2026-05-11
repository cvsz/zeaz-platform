#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "restore failed" >&2' ERR
: "${BACKUP_FILE:?BACKUP_FILE is required}"
tar -xzf "$BACKUP_FILE" -C .
