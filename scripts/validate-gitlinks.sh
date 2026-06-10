#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_NAME="$(basename "$0")"

usage() {
  cat <<USAGE
Usage: $SCRIPT_NAME [--help]

Validate that committed Git submodule gitlinks are declared in .gitmodules.
This protects GitHub Actions checkout cleanup from failing on orphaned gitlinks.

Options:
  --help  Show this help message.
USAGE
}

log() {
  local level="$1"
  shift
  printf '[%s] %s\n' "$level" "$*"
}

on_error() {
  local exit_code=$?
  log "ERROR" "gitlink validation failed at line ${BASH_LINENO[0]} with exit code ${exit_code}"
  exit "$exit_code"
}

trap on_error ERR

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ $# -gt 0 ]]; then
  usage >&2
  exit 2
fi

if ! git rev-parse --show-toplevel >/dev/null 2>&1; then
  log "ERROR" "not inside a Git repository"
  exit 2
fi

repo_root="$(git rev-parse --show-toplevel)"
cd "$repo_root"

mapfile -t gitlinks < <(git ls-files -s | awk '$1 == "160000" { print $4 }')

if [[ ${#gitlinks[@]} -eq 0 ]]; then
  log "INFO" "no committed gitlinks found"
  exit 0
fi

if [[ ! -f .gitmodules ]]; then
  log "ERROR" "found committed gitlinks but .gitmodules is missing"
  printf '  - %s\n' "${gitlinks[@]}" >&2
  exit 1
fi

missing=0
for path in "${gitlinks[@]}"; do
  if ! git config --file .gitmodules --get-regexp '^submodule\..*\.path$' 2>/dev/null | awk '{ print $2 }' | grep -Fx -- "$path" >/dev/null; then
    log "ERROR" "gitlink is missing a .gitmodules path entry: $path"
    missing=1
    continue
  fi

  url_key="$(git config --file .gitmodules --get-regexp '^submodule\..*\.path$' 2>/dev/null | awk -v target="$path" '$2 == target { sub(/\.path$/, ".url", $1); print $1; exit }')"
  if [[ -z "$url_key" ]] || [[ -z "$(git config --file .gitmodules --get "$url_key" || true)" ]]; then
    log "ERROR" "gitlink is missing a .gitmodules url entry: $path"
    missing=1
  fi
done

if [[ "$missing" -ne 0 ]]; then
  exit 1
fi

log "INFO" "all committed gitlinks are declared in .gitmodules"
