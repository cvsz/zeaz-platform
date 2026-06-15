#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'printf "{\"level\":\"error\",\"script\":\"backup\",\"line\":%s}\n" "$LINENO" >&2' ERR

: "${BACKUP_DIR:=${BACKUP_OUTPUT_DIR:-backups/snapshots}}"
: "${BACKUP_REPORT_DIR:=reports/backup}"
: "${ENVIRONMENT:=dev}"
mkdir -p "$BACKUP_DIR"
mkdir -p "$BACKUP_REPORT_DIR"

ts="$(date -u +%Y%m%dT%H%M%SZ)"
archive="$BACKUP_DIR/${ENVIRONMENT}-${ts}.tar.gz"
manifest="$BACKUP_DIR/${ENVIRONMENT}-${ts}.manifest.txt"
report="$BACKUP_REPORT_DIR/${ENVIRONMENT}-${ts}.json"

paths=(terraform opentofu zero-trust waf dns tunnels policies monitoring security docs scripts)

include_paths=()
skipped_paths=()
for path in "${paths[@]}"; do
  if [[ -e "$path" ]]; then
    include_paths+=("$path")
  else
    skipped_paths+=("$path")
  fi
done

printf '%s\n' "${include_paths[@]}" > "$manifest"

if [[ ${#include_paths[@]} -eq 0 ]]; then
  printf '{"level":"error","script":"backup","error":"no backup targets found","skipped_paths":"%s"}\n' "${skipped_paths[*]}" >&2
  exit 1
fi

tar --exclude='.git' -czf "$archive" "${include_paths[@]}"
sha256sum "$archive" > "${archive}.sha256"

python3 - "$archive" "$manifest" "$report" "$ENVIRONMENT" "$ts" "${include_paths[@]}" <<'PY'
import json
import pathlib
import sys

archive, manifest, report, environment, timestamp, *included = sys.argv[1:]
data = {
    "level": "info",
    "script": "backup",
    "environment": environment,
    "timestamp": timestamp,
    "archive": archive,
    "manifest": manifest,
    "included_paths": included,
}
pathlib.Path(report).write_text(json.dumps(data, indent=2, sort_keys=True) + "\n", encoding="utf-8")
print(json.dumps({"level": "info", "script": "backup", "archive": archive, "report": report}))
PY
