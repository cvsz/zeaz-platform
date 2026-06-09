#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { cat <<'USAGE'
Usage: scripts/db/migrate-all.sh [--dry-run]

Runs discovered migration commands where supported. Defaults to dry-run unless
CONFIRM_MIGRATE=yes is set.
USAGE
}
log() { printf '[zeaz-migrate] %s\n' "$*"; }
dry_run=true
while (($#)); do case "$1" in --dry-run) dry_run=true; shift;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
[[ "${CONFIRM_MIGRATE:-}" == yes ]] && dry_run=false
mapfile -t prisma_dirs < <(find apps -path '*/node_modules' -prune -o -name schema.prisma -printf '%h\n' | sort -u)
mapfile -t sql_dirs < <(find apps -path '*/node_modules' -prune -o -type d -name migrations -print | sort)
for d in "${prisma_dirs[@]}"; do log "Prisma migrations detected at $d"; $dry_run && continue; (cd "$d" && npx prisma migrate deploy); done
for d in "${sql_dirs[@]}"; do log "SQL migrations detected at $d (operator review required)"; done
$dry_run && log "dry-run complete; set CONFIRM_MIGRATE=yes to execute supported migration runners"
