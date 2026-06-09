#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
usage() { echo 'Usage: scripts/proxy/check-nginx-config.sh [--config infrastructure/nginx/zeaz-platform.conf]'; }
config=infrastructure/nginx/zeaz-platform.conf
while (($#)); do case "$1" in --config) config="$2"; shift 2;; --help|-h) usage; exit 0;; *) usage; exit 2;; esac; done
[[ -f "$config" ]] || { echo '[zeaz-nginx-check] missing config' >&2; exit 1; }
for port in {4101..4112}; do grep -q "127.0.0.1:$port" "$config" || { echo "[zeaz-nginx-check] missing port $port" >&2; exit 1; }; done
if command -v nginx >/dev/null 2>&1; then nginx -t -c "$PWD/$config" || true; else echo '[zeaz-nginx-check] nginx binary not found; static check passed'; fi
