#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'echo "ERROR: ${0##*/} failed at line $LINENO" >&2' ERR
usage(){ echo 'Usage: check-nginx-config.sh [--config PATH]'; }
config=infrastructure/nginx/zeaz-platform.conf
while [ "$#" -gt 0 ]; do case "$1" in --config) config="${2:?missing config}"; shift 2;; --help|-h) usage; exit 0;; *) echo "ERROR: unknown argument $1" >&2; exit 2;; esac; done
[ -f "$config" ] || { echo "ERROR: missing $config" >&2; exit 1; }
for host in zow.zeaz.dev api-zcfdash.zeaz.dev zcfdash.zeaz.dev zoffice.zeaz.dev app.zeaz.dev ztrader.zeaz.dev dash.zeaz.dev zaiz.zeaz.dev zveo.zeaz.dev zsticker.zeaz.dev zcino.zeaz.dev zlms.zeaz.dev; do
  grep -q "server_name $host" "$config" || { echo "ERROR: missing nginx host $host" >&2; exit 1; }
done
if command -v nginx >/dev/null 2>&1; then echo "INFO: nginx found; standalone include syntax inspection only"; fi
echo "nginx config offline validation passed"
