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

search_workflows() {
  local pattern="$1"
  shift || true

  if command -v rg >/dev/null 2>&1; then
    rg "$@" "$pattern"
    return $?
  fi

  grep -E "$@" "$pattern"
}

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

# Repository hygiene checks
if [[ -d "${ROOT_DIR}/scripts/cloudflare/cloudflare" ]]; then
  printf '{"level":"ERROR","path":"%s","msg":"nested duplicate token script directory is not allowed"}\n' "scripts/cloudflare/cloudflare" >&2
  fail_count=$((fail_count + 1))
fi

if ! awk '
  $0 ~ /^shell-validate:/ { in_target=1; next }
  in_target && $0 ~ /^\t@find scripts -type f -name '\''\*\.sh'\'' -print0 \| xargs -0 shellcheck$/ { found=1; exit 0 }
  in_target && $0 !~ /^\t/ { in_target=0 }
  END { exit(found ? 0 : 1) }
' "${ROOT_DIR}/Makefile"; then
  printf '{"level":"ERROR","file":"Makefile","msg":"shell-validate must use find|xargs for portability"}\n' >&2
  fail_count=$((fail_count + 1))
fi

for backend_file in dev.backend.hcl local.example.hcl s3.example.hcl; do
  if [[ -f "${ROOT_DIR}/terraform/backend/${backend_file}" && ! -f "${ROOT_DIR}/opentofu/backend/${backend_file}" ]]; then
    printf '{"level":"ERROR","file":"opentofu/backend/%s","msg":"missing backend parity file for opentofu"}\n' "${backend_file}" >&2
    fail_count=$((fail_count + 1))
  fi
done

declare -A normalized_name_to_file=()
while IFS= read -r workflow_file; do
  [[ -z "$workflow_file" ]] && continue

  if ! search_workflows "$workflow_file" -q '^permissions:'; then
    printf '{"level":"ERROR","file":"%s","msg":"missing top-level permissions"}\n' "${workflow_file#"${ROOT_DIR}"/}" >&2
    fail_count=$((fail_count + 1))
  fi

  if ! search_workflows "$workflow_file" -q 'timeout-minutes:'; then
    printf '{"level":"ERROR","file":"%s","msg":"missing job timeout-minutes"}\n' "${workflow_file#"${ROOT_DIR}"/}" >&2
    fail_count=$((fail_count + 1))
  fi

  if search_workflows "$workflow_file" -q '^[[:space:]]*push:' && search_workflows "$workflow_file" -q 'apply|destroy'; then
    printf '{"level":"ERROR","file":"%s","msg":"mutating workflow must not run on push"}\n' "${workflow_file#"${ROOT_DIR}"/}" >&2
    fail_count=$((fail_count + 1))
  fi

  if search_workflows "$workflow_file" -q 'run:[[:space:]]*make validate([[:space:]]|$)' && ! search_workflows "$workflow_file" -q 'opentofu/setup-opentofu@v1'; then
    printf '{"level":"ERROR","file":"%s","msg":"workflows running make validate must install OpenTofu"}\n' "${workflow_file#"${ROOT_DIR}"/}" >&2
    fail_count=$((fail_count + 1))
  fi

  workflow_base="$(basename "$workflow_file")"
  normalized_name="${workflow_base%.yml}"
  normalized_name="${normalized_name%.yaml}"
  normalized_name="$(printf '%s' "$normalized_name" | sed -E 's/[-_](test(ing)?|validation|generation|gen)$//')"

  if [[ -n "${normalized_name_to_file[$normalized_name]:-}" ]]; then
    printf '{"level":"ERROR","file":"%s","msg":"duplicate/overlapping workflow family","conflicts_with":"%s"}\n' \
      "${workflow_file#"${ROOT_DIR}"/}" "${normalized_name_to_file[$normalized_name]#"${ROOT_DIR}"/}" >&2
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
