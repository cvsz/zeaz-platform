#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: migrate-all.sh [--dry-run] [--execute]

Discovers app migration scripts and runs them only when --execute and
CONFIRM_MIGRATE=yes are supplied. Default is dry-run.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: migration runner failed at line $LINENO"' ERR
execute=0
while [ "$#" -gt 0 ]; do case "$1" in --dry-run) execute=0; shift;; --execute) execute=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
mapfile -t pkgs < <(find apps -maxdepth 3 -name package.json -not -path '*/node_modules/*' 2>/dev/null | sort)
found=0
for pkg in "${pkgs[@]}"; do
  dir="$(dirname "$pkg")"
  scripts="$(python3 - <<PY "$pkg"
import json,sys
try: d=json.load(open(sys.argv[1])); print('\n'.join(k for k in (d.get('scripts') or {}) if any(w in k.lower() for w in ['migrate','db:push','prisma'])))
except Exception: pass
PY
)"
  [ -n "$scripts" ] || continue
  found=1
  while IFS= read -r script; do
    [ -n "$script" ] || continue
    log "found migration-capable script: $dir -> $script"
    if [ "$execute" -eq 1 ]; then
      [ "${CONFIRM_MIGRATE:-no}" = yes ] || { echo "ERROR: CONFIRM_MIGRATE=yes required" >&2; exit 1; }
      (cd "$dir" && if command -v pnpm >/dev/null 2>&1; then pnpm run "$script"; else npm run "$script"; fi)
    fi
  done <<< "$scripts"
done
[ "$found" -eq 1 ] || log "No migration scripts detected"
