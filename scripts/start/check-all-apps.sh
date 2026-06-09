#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ cat <<'USAGE'
Usage: check-all-apps.sh [--local-only]

Checks canonical local app HTTP endpoints without requiring external domains.
USAGE
}
local_only=0
while [ "$#" -gt 0 ]; do case "$1" in --local-only) local_only=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
rc=0
while IFS='|' read -r app domain port dir; do
  url="http://127.0.0.1:$port/health"
  if command -v curl >/dev/null 2>&1; then
    code="$(curl -fsS -m 3 -o /dev/null -w '%{http_code}' "$url" 2>/dev/null || true)"
    if [ -n "$code" ] && [ "$code" != 000 ]; then echo "OK $app $url HTTP $code"; else echo "WARN $app not reachable at $url"; rc=1; fi
  else echo "WARN curl missing; skipped $app"; fi
  if [ "$local_only" -ne 1 ] && [ "$domain" != internal ] && command -v curl >/dev/null 2>&1; then curl -fsSI -m 5 "https://$domain" >/dev/null 2>&1 || echo "WARN domain check failed for $domain"; fi
done < <(scripts/ports/list-all-ports.sh --plain)
exit "$rc"
