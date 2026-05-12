#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'printf "{\"level\":\"error\",\"script\":\"restore\",\"line\":%s}\n" "$LINENO" >&2' ERR

archive="${1:?usage: restore.sh <backup-tar.gz>}"
checksum_file="${archive}.sha256"
rollback_dir="backups/restore-rollback/$(date -u +%Y%m%dT%H%M%SZ)"
mkdir -p "$rollback_dir"

[[ -f "$archive" ]]
[[ -f "$checksum_file" ]]
sha256sum -c "$checksum_file"

for p in terraform opentofu zero-trust waf dns tunnels policies monitoring security docs scripts; do
  if [[ -e "$p" ]]; then
    cp -a "$p" "$rollback_dir/"
  fi
done

tar -xzf "$archive"
printf '{"level":"info","script":"restore","archive":"%s","rollback":"%s"}\n' "$archive" "$rollback_dir"
