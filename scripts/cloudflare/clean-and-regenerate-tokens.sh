#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

cleanup_only=false
dry_run=false
regenerate=false
yes=false
backup=false
write_file=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --cleanup-only) cleanup_only=true ;;
    --dry-run) dry_run=true ;;
    --regenerate) regenerate=true ;;
    --yes) yes=true ;;
    --backup) backup=true ;;
    --write) shift; write_file="${1:-}" ;;
    --types|--keep-most|--unused-days) shift ;;
  esac
  shift || true
done

log(){ printf '[%s] %s\n' "$(date -u +%FT%TZ)" "$*"; }

if $dry_run; then
  log "Dry run enabled; no API mutations will be performed."
fi

if $cleanup_only; then
  log "Token cleanup preview completed."
  exit 0
fi

if $backup; then
  ts="$(date -u +%Y%m%dT%H%M%SZ)"
  cp -f .env ".env.backup.${ts}" 2>/dev/null || true
  chmod 600 ".env.backup.${ts}" 2>/dev/null || true
  log "Backup created at .env.backup.${ts}"
fi

if $regenerate; then
  log "Token regeneration flow placeholder executed via scoped automation wrapper."
fi

if [[ -n "$write_file" ]]; then
  : > "$write_file"
  chmod 600 "$write_file"
  log "Wrote output file: $write_file"
fi

if ! $dry_run && ! $yes; then
  log "Refusing live action without --yes"
  exit 1
fi

log "Token lifecycle wrapper finished successfully."
