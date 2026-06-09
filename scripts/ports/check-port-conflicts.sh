#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ cat <<'USAGE'
Usage: check-port-conflicts.sh [--check-listeners]

Checks canonical ZEAZ ports for duplicate declarations and, optionally, local listeners.
USAGE
}
listeners=0
while [ "$#" -gt 0 ]; do case "$1" in --check-listeners) listeners=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
mapfile -t ports < <(scripts/ports/list-all-ports.sh --plain | awk -F'|' '{print $3}')
dups="$(printf '%s\n' "${ports[@]}" | sort | uniq -d)"
if [ -n "$dups" ]; then echo "ERROR: duplicate canonical ports: $dups" >&2; exit 1; fi
echo "Canonical port map has no duplicates (${#ports[@]} ports)."
if [ "$listeners" -eq 1 ]; then
  if command -v ss >/dev/null 2>&1; then
    for p in "${ports[@]}"; do ss -ltn "sport = :$p" | tail -n +2 | sed "s/^/LISTENER $p /" || true; done
  elif command -v lsof >/dev/null 2>&1; then
    for p in "${ports[@]}"; do lsof -iTCP:"$p" -sTCP:LISTEN || true; done
  else echo "WARN: ss/lsof unavailable; listener check skipped"; fi
fi
