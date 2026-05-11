#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_NAME="$(basename "$0")"
readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly CONFIG_FILE="${ROOT_DIR}/tunnels/config.yaml"
readonly DNS_FILE="${ROOT_DIR}/dns/records.yaml"
log() { printf '{"script":"%s","level":"%s","msg":"%s"}\n' "$SCRIPT_NAME" "$1" "$2"; }
usage() { echo "Usage: $SCRIPT_NAME [--offline]"; }
OFFLINE=false
if [[ "${1:-}" == "--offline" ]]; then OFFLINE=true; elif [[ $# -gt 0 ]]; then usage; exit 2; fi

[[ -f "$CONFIG_FILE" ]] || { log error "missing $CONFIG_FILE"; exit 1; }
[[ -f "$DNS_FILE" ]] || { log error "missing $DNS_FILE"; exit 1; }

mapfile -t dns_hosts < <(awk '/fqdn:/ {print $2}' "$DNS_FILE")
for host in "${dns_hosts[@]}"; do
  if ! grep -q "hostname: ${host}$" "$CONFIG_FILE"; then
    log error "missing ingress mapping for ${host}"
    exit 1
  fi
done

if grep -Eq '(TUNNEL_TOKEN|credentials-file:|tunnel_secret)' "$CONFIG_FILE"; then
  log error "tunnel secret/token must not be committed in tunnels/config.yaml"
  exit 1
fi

if [[ "$OFFLINE" == true ]]; then
  log info "offline validation completed"
  exit 0
fi

[[ -n "${TUNNEL_TOKEN:-}" ]] || { log error "TUNNEL_TOKEN must be provided via environment for online validation"; exit 1; }
for host in auth zveo studio analytics app pay treasury admin-wallet; do
  fqdn="${host}.${PRIMARY_DOMAIN:-zeaz.dev}"
  if ! getent hosts "$fqdn" >/dev/null 2>&1; then
    log warn "dns lookup failed for ${fqdn}"
  fi
done
log info "online validation completed"
