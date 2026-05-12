#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

readonly SCRIPT_NAME="$(basename "$0")"
readonly ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
readonly CONFIG_FILE="${ROOT_DIR}/tunnels/config.yaml"
readonly DNS_FILE="${ROOT_DIR}/dns/records.yaml"
readonly REQUIRED_HOSTS=(auth zveo studio analytics app pay treasury admin-wallet)

log() { printf '{"script":"%s","level":"%s","msg":"%s"}\n' "$SCRIPT_NAME" "$1" "$2"; }
usage() { echo "Usage: $SCRIPT_NAME [--offline] [--dry-run]"; }

OFFLINE=false
DRY_RUN=false
for arg in "$@"; do
  case "$arg" in
    --offline) OFFLINE=true ;;
    --dry-run) DRY_RUN=true ;;
    *) usage; exit 2 ;;
  esac
done

[[ -f "$CONFIG_FILE" ]] || { log error "missing $CONFIG_FILE"; exit 1; }
[[ -f "$DNS_FILE" ]] || { log error "missing $DNS_FILE"; exit 1; }

PRIMARY_DOMAIN="${PRIMARY_DOMAIN:-zeaz.dev}"
if [[ ! "$PRIMARY_DOMAIN" =~ ^[a-z0-9][a-z0-9.-]*[a-z0-9]$ ]]; then
  log error "PRIMARY_DOMAIN format invalid: $PRIMARY_DOMAIN"
  exit 1
fi

[[ -n "${ORIGIN_HOSTS:-}" ]] || { log error "ORIGIN_HOSTS must be set"; exit 1; }

for host in "${REQUIRED_HOSTS[@]}"; do
  expected="${host}.${PRIMARY_DOMAIN}"
  if ! grep -q "fqdn: ${expected}$" "$DNS_FILE" && ! grep -q "fqdn: ${host}.\${PRIMARY_DOMAIN}$" "$DNS_FILE"; then
    log error "missing DNS fqdn ${expected}"
    exit 1
  fi
  if ! grep -q "hostname: ${expected}$" "$CONFIG_FILE" && ! grep -q "hostname: ${host}.\${PRIMARY_DOMAIN}$" "$CONFIG_FILE"; then
    log error "missing ingress mapping ${expected}"
    exit 1
  fi
  if ! grep -q "${host}" <<<"${ORIGIN_HOSTS}"; then
    log error "ORIGIN_HOSTS missing target mapping for key '${host}'"
    exit 1
  fi
done

if grep -Eq '(TUNNEL_TOKEN|credentials-file:|tunnel_secret)' "$CONFIG_FILE"; then
  log error "tunnel secret/token must not be committed in tunnels/config.yaml"
  exit 1
fi

if [[ "$OFFLINE" == true || "$DRY_RUN" == true ]]; then
  log info "offline/dry-run validation completed"
  exit 0
fi

[[ -n "${TUNNEL_TOKEN:-}" ]] || { log error "TUNNEL_TOKEN must be provided via environment for online validation"; exit 1; }
for host in "${REQUIRED_HOSTS[@]}"; do
  fqdn="${host}.${PRIMARY_DOMAIN}"
  if ! getent hosts "$fqdn" >/dev/null 2>&1; then
    log warn "dns lookup failed for ${fqdn}"
  fi
done
log info "online validation completed"
