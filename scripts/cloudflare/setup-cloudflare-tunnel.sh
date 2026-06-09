#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage(){ cat <<'USAGE'
Usage: setup-cloudflare-tunnel.sh [--dry-run]

Validates local cloudflared configuration. Mutating setup requires
CONFIRM_TUNNEL_SETUP=yes and is otherwise refused.
USAGE
}
log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
trap 'log "ERROR: tunnel setup failed at line $LINENO"' ERR
dry=0
while [ "$#" -gt 0 ]; do case "$1" in --dry-run) dry=1; shift;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
scripts/cloudflare/check-cloudflare-config.sh
if [ "$dry" -eq 1 ]; then log "dry-run complete; no Cloudflare changes made"; exit 0; fi
[ "${CONFIRM_TUNNEL_SETUP:-no}" = yes ] || { echo "ERROR: CONFIRM_TUNNEL_SETUP=yes required for tunnel setup" >&2; exit 1; }
command -v cloudflared >/dev/null 2>&1 || { echo "ERROR: cloudflared not found" >&2; exit 127; }
log "cloudflared is available; run reviewed tunnel create/route commands manually with local secrets"
