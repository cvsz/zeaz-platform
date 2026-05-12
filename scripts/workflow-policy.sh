#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

STRICT_TOOLS="${STRICT_TOOLS:-false}"
CODEX_CLOUD="${CODEX_CLOUD:-false}"
PROJECT_ROOT="${PROJECT_ROOT:-}"

usage() {
  cat <<USAGE
Usage: $(basename "$0") [--help]

Validate GitHub Actions workflow policy requirements offline.
USAGE
}

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }

find_root() {
  local d="${PROJECT_ROOT:-${PWD}}"

  while [[ "$d" != "/" ]]; do
    if [[ -d "$d/.git" ]] ||
       [[ -d "$d/terraform" ]] ||
       [[ -f "$d/.env.example" ]] ||
       [[ -f "$d/python/cfstack_validate_env.py" ]] ||
       [[ -f "$d/package.json" ]]; then
      printf '%s\n' "$d"
      return 0
    fi

    d="$(dirname "$d")"
  done

  return 1
}

cleanup() {
  local rc=$?
  if [[ $rc -ne 0 ]]; then
    printf '{"level":"ERROR","script":"%s","msg":"workflow policy validation failed","exit_code":%d}\n' "$(basename "$0")" "$rc" >&2
  fi
}
trap cleanup EXIT

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

ROOT_DIR="$(find_root)" || die "unable to determine repository root; set PROJECT_ROOT explicitly"
WORKFLOW_DIR="${ROOT_DIR}/.github/workflows"

if [[ ! -d "${WORKFLOW_DIR}" ]]; then
  die "workflow directory not found: ${WORKFLOW_DIR}"
fi

fail_count=0

declare -A normalized_name_to_file=()
while IFS= read -r workflow_file; do
  [[ -z "$workflow_file" ]] && continue

  if ! rg -q '^permissions:' "$workflow_file"; then
    printf '{"level":"ERROR","file":"%s","msg":"missing top-level permissions"}\n' "${workflow_file#${ROOT_DIR}/}" >&2
    fail_count=$((fail_count + 1))
  fi

  if ! rg -q 'timeout-minutes:' "$workflow_file"; then
    printf '{"level":"ERROR","file":"%s","msg":"missing job timeout-minutes"}\n' "${workflow_file#${ROOT_DIR}/}" >&2
    fail_count=$((fail_count + 1))
  fi

  if rg -q '^\s*push:' "$workflow_file" && rg -q 'apply|destroy' "$workflow_file"; then
    printf '{"level":"ERROR","file":"%s","msg":"mutating workflow must not run on push"}\n' "${workflow_file#${ROOT_DIR}/}" >&2
    fail_count=$((fail_count + 1))
  fi

  workflow_base="$(basename "$workflow_file")"
  normalized_name="${workflow_base%.yml}"
  normalized_name="${normalized_name%.yaml}"
  normalized_name="$(printf '%s' "$normalized_name" | sed -E 's/[-_](test(ing)?|validation|generation|gen)$//')"

  if [[ -n "${normalized_name_to_file[$normalized_name]:-}" ]]; then
    printf '{"level":"ERROR","file":"%s","msg":"duplicate/overlapping workflow family","conflicts_with":"%s"}\n' \
      "${workflow_file#${ROOT_DIR}/}" "${normalized_name_to_file[$normalized_name]#${ROOT_DIR}/}" >&2
    fail_count=$((fail_count + 1))
  else
    normalized_name_to_file[$normalized_name]="$workflow_file"
  fi

done < <(find "$WORKFLOW_DIR" -maxdepth 1 -type f \( -name '*.yml' -o -name '*.yaml' \) | sort)

if [[ $fail_count -gt 0 ]]; then
  printf '{"level":"ERROR","msg":"workflow policy violations","count":%d}\n' "$fail_count" >&2
  exit 1
fi

log "INFO: workflow policy validation passed"
printf '{"level":"INFO","msg":"workflow policy validation passed","codex_cloud":"%s","strict_tools":"%s"}\n' "$CODEX_CLOUD" "$STRICT_TOOLS"
