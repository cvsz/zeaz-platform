#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
trap 'log "Error on line $LINENO"' ERR

# Common utility functions
log() { printf '[%s] %s\n' "install.sh" "$*"; }
warn() { printf '[%s] WARN: %s\n' "install.sh" "$*" >&2; }
die() { printf '[%s] ERROR: %s\n' "install.sh" "$*" >&2; exit 1; }

usage() {
  cat <<USAGE
Usage:
  scripts/install.sh [module] [options]

Modules:
  web-deps        Install web dependencies safely
  omega-addons    Install Omega Master addons
  ai-assets       Scan and install AI assets
  ecc             Integrate ECC

Options:
  -h, --help      Show this help
USAGE
}

if [[ $# -lt 1 ]]; then
  usage
  exit 1
fi

MODULE="$1"
shift

case "$MODULE" in
  web-deps)     bash scripts/installers/web-deps.sh "$@" ;;
  omega-addons) bash scripts/installers/omega-addons.sh "$@" ;;
  ai-assets)    bash scripts/installers/ai-assets.sh "$@" ;;
  ecc)          bash scripts/installers/ecc.sh "$@" ;;
  *)            die "Unknown module: $MODULE" ;;
esac
