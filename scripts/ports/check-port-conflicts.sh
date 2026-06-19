#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/ports/check-port-conflicts.sh'; }
[[ "${1:-}" =~ ^(--help|-h)$ ]] && { usage; exit 0; }
ports=$(scripts/ports/list-all-ports.sh | awk -F, 'NR>1{print $4}' | sort)
duplicates=$(printf '%s\n' "$ports" | uniq -d)
if [[ -n "$duplicates" ]]; then
  printf '[zeaz-port-check] duplicate canonical ports found:\n%s\n' "$duplicates" >&2
  exit 1
fi
printf '[zeaz-port-check] canonical port map has no duplicate ports\n'
if command -v ss >/dev/null 2>&1; then
  scripts/ports/list-all-ports.sh | awk -F, 'NR>1{print $1","$4}' | while IFS=, read -r app port; do
    if ss -ltn "sport = :$port" | awk 'NR>1{found=1} END{exit !found}'; then
      printf '[zeaz-port-check] warning: port %s for %s is currently listening\n' "$port" "$app"
    fi
  done
fi
