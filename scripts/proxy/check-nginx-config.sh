#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ echo 'Usage: check-nginx-config.sh [--config PATH]'; }

config=infra/nginx/zeaz-platform.conf
while [ "$#" -gt 0 ]; do
  case "$1" in
    --config) config="${2:?missing config}"; shift 2;;
    --help|-h) usage; exit 0;;
    *) echo "ERROR: unknown argument $1" >&2; exit 2;;
  esac
done

[ -f "$config" ] || { echo "ERROR: missing $config" >&2; exit 1; }
[ -x scripts/ports/list-all-ports.sh ] || { echo "ERROR: missing executable scripts/ports/list-all-ports.sh" >&2; exit 1; }

while IFS='|' read -r app domain port path; do
  [ -n "$app" ] || continue
  [ "$domain" != internal ] || continue
  grep -q "server_name $domain" "$config" || { echo "ERROR: missing nginx host $domain" >&2; exit 1; }
  grep -q "127.0.0.1:$port" "$config" || { echo "ERROR: missing nginx upstream port $port for $app" >&2; exit 1; }
done < <(scripts/ports/list-all-ports.sh --plain)

if ! grep -q 'proxy_set_header Upgrade \$http_upgrade' "$config"; then
  echo "ERROR: missing WebSocket upgrade header" >&2
  exit 1
fi

if ! grep -q 'client_max_body_size' "$config"; then
  echo "ERROR: missing client_max_body_size guard" >&2
  exit 1
fi

if command -v nginx >/dev/null 2>&1; then
  echo "INFO: nginx found; standalone include syntax inspection only"
fi

echo "nginx config offline validation passed"
