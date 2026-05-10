#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ACTION="${1:-plan}"
ENVIRONMENT="${2:-dev}"
ENV_DIR="${ROOT_DIR}/terraform/envs/${ENVIRONMENT}"

usage() {
  cat <<'USAGE'
Usage: scripts/install.sh [plan|apply|destroy] [dev|staging|prod]
USAGE
}

resolve_tf_bin() {
  if command -v tofu >/dev/null 2>&1; then
    printf '%s\n' "tofu"
    return 0
  fi

  if command -v terraform >/dev/null 2>&1; then
    printf '%s\n' "terraform"
    return 0
  fi

  return 1
}

case "${ACTION}" in
  plan|apply|destroy)
    ;;
  *)
    echo "ERROR: unsupported action '${ACTION}'." >&2
    usage >&2
    exit 64
    ;;
esac

if [[ ! -d "${ENV_DIR}" ]]; then
  echo "ERROR: terraform environment directory not found: ${ENV_DIR}" >&2
  exit 66
fi

if ! TF_BIN="$(resolve_tf_bin)"; then
  echo "ERROR: neither 'tofu' nor 'terraform' is installed or available in PATH." >&2
  echo "Install OpenTofu or Terraform, then re-run this script." >&2
  exit 127
fi

"${ROOT_DIR}/scripts/validate.sh"

"${TF_BIN}" -chdir="${ENV_DIR}" init -input=false

case "${ACTION}" in
  plan)
    "${TF_BIN}" -chdir="${ENV_DIR}" plan -input=false
    ;;
  apply)
    "${TF_BIN}" -chdir="${ENV_DIR}" apply -input=false -auto-approve
    ;;
  destroy)
    "${TF_BIN}" -chdir="${ENV_DIR}" destroy -input=false -auto-approve
    ;;
esac
