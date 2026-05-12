#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'printf "{\"level\":\"error\",\"script\":\"backup\",\"line\":%s}\n" "$LINENO" >&2' ERR

: "${BACKUP_DIR:=backups/snapshots}"
: "${ENVIRONMENT:=dev}"
mkdir -p "$BACKUP_DIR"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIR/${ENVIRONMENT}-${ts}.tar.gz"
manifest="$BACKUP_DIR/${ENVIRONMENT}-${ts}.manifest.txt"

paths=(terraform opentofu zero-trust waf dns tunnels policies monitoring security docs scripts)
printf '%s\n' "${paths[@]}" > "$manifest"

tar --exclude='.git' -czf "$archive" "${paths[@]}"
sha256sum "$archive" > "${archive}.sha256"
printf '{"level":"info","script":"backup","archive":"%s"}\n' "$archive"
