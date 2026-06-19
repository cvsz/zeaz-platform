#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"
# shellcheck source=../lib/gemini-sandbox.sh
source "${PROJECT_ROOT}/scripts/lib/gemini-sandbox.sh"
gemini_init_sandbox_paths "${PROJECT_ROOT}"

ECC_REPO_URL="${ECC_REPO_URL:-https://github.com/affaan-m/ECC.git}"
ECC_REF="${ECC_REF:-main}"
ECC_CACHE_DIR="${ECC_CACHE_DIR:-${GEMINI_CACHE_DIR}}"
ECC_PROFILE="${ECC_PROFILE:-minimal}"
ECC_TARGETS="${ECC_TARGETS:-claude-project}"
ECC_APPLY=false
ECC_JSON=false
ECC_FORCE_REFRESH=false
ECC_ALLOW_FULL=false
EXTRA_ARGS=()

usage() {
  cat <<'USAGE'
Usage: scripts/ai/install-ecc.sh [options]

Safe ECC integration wrapper for cvsz/zeaz-platform.
Default mode is dry-run preview. Nothing is installed unless --apply is passed.

Options:
  --apply                 Apply the ECC install plan. Default is dry-run.
  --dry-run               Force dry-run preview mode.
  --profile NAME          ECC profile. Default: minimal.
  --target NAME           Install target. Can be repeated. Default: claude-project.
  --targets A,B,C         Comma-separated targets.
  --with COMPONENT        Forward an ECC --with component selector. Can repeat.
  --without COMPONENT     Forward an ECC --without component selector. Can repeat.
  --modules IDS           Forward ECC --modules ids.
  --skills IDS            Forward ECC --skills ids.
  --locale CODE           Forward ECC --locale code.
  --ref REF               ECC git ref, branch, tag, or commit. Default: main.
  --repo URL              ECC git repository URL. Default: https://github.com/affaan-m/ECC.git
  --cache-dir PATH        Local ECC clone cache. Default: writable .cache/ecc or /tmp/gemini-pack/cache.
  --json                  Forward ECC --json output.
  --force-refresh         Remove the local ECC cache before cloning.
  --allow-full            Allow --profile full without ECC_ALLOW_FULL_INSTALL=yes.
  -h, --help              Show this help.

Examples:
  # Preview project-local Claude install.
  scripts/ai/install-ecc.sh --profile minimal --target claude-project

  # Apply project-local Claude install.
  scripts/ai/install-ecc.sh --apply --profile minimal --target claude-project

  # Preview Codex home install. This mutates ~/.codex only with --apply.
  scripts/ai/install-ecc.sh --profile minimal --target codex

  # Apply multiple project targets.
  scripts/ai/install-ecc.sh --apply --profile minimal --targets claude-project,antigravity,cursor
USAGE
}

log() {
  printf '[ecc-integrate] %s\n' "$*"
}

fail() {
  printf '[ecc-integrate] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing required command: $1"
}

split_targets() {
  local raw="$1"
  raw="${raw// /}"
  IFS=',' read -r -a TARGET_ARRAY <<< "$raw"
}

while (($#)); do
  case "$1" in
    --apply) ECC_APPLY=true ;;
    --dry-run) ECC_APPLY=false ;;
    --profile)
      shift
      ECC_PROFILE="${1:?missing --profile value}"
      ;;
    --target)
      shift
      if [[ -z "${1:-}" ]]; then fail "missing --target value"; fi
      if [[ "${ECC_TARGETS}" == "claude-project" ]]; then
        ECC_TARGETS="$1"
      else
        ECC_TARGETS="${ECC_TARGETS},$1"
      fi
      ;;
    --targets)
      shift
      ECC_TARGETS="${1:?missing --targets value}"
      ;;
    --with)
      shift
      EXTRA_ARGS+=(--with "${1:?missing --with value}")
      ;;
    --without)
      shift
      EXTRA_ARGS+=(--without "${1:?missing --without value}")
      ;;
    --modules)
      shift
      EXTRA_ARGS+=(--modules "${1:?missing --modules value}")
      ;;
    --skills)
      shift
      EXTRA_ARGS+=(--skills "${1:?missing --skills value}")
      ;;
    --locale)
      shift
      EXTRA_ARGS+=(--locale "${1:?missing --locale value}")
      ;;
    --ref)
      shift
      ECC_REF="${1:?missing --ref value}"
      ;;
    --repo)
      shift
      ECC_REPO_URL="${1:?missing --repo value}"
      ;;
    --cache-dir)
      shift
      ECC_CACHE_DIR="${1:?missing --cache-dir value}"
      ;;
    --json) ECC_JSON=true ;;
    --force-refresh) ECC_FORCE_REFRESH=true ;;
    --allow-full) ECC_ALLOW_FULL=true ;;
    -h|--help)
      usage
      exit 0
      ;;
    *) fail "unknown argument: $1" ;;
  esac
  shift
done

ECC_CACHE_DIR="$(gemini_get_writable_dir "${ECC_CACHE_DIR}" "${GEMINI_PACK_ROOT}/ecc")"

if [[ "${ECC_PROFILE}" == "full" && "${ECC_APPLY}" == "true" && "${ECC_ALLOW_FULL}" != "true" && "${ECC_ALLOW_FULL_INSTALL:-no}" != "yes" ]]; then
  fail "profile full is intentionally guarded. Use --allow-full or ECC_ALLOW_FULL_INSTALL=yes after reviewing docs/ecc-integration.md"
fi

require_cmd git
require_cmd node
require_cmd npm

if [[ "${ECC_FORCE_REFRESH}" == "true" ]]; then
  rm -rf "${ECC_CACHE_DIR}"
fi

mkdir -p "$(dirname "${ECC_CACHE_DIR}")"

if [[ -d "${ECC_CACHE_DIR}/.git" ]]; then
  log "refreshing ECC cache at ${ECC_CACHE_DIR}"
  git -C "${ECC_CACHE_DIR}" fetch --tags --prune origin
else
  log "cloning ECC from ${ECC_REPO_URL} into ${ECC_CACHE_DIR}"
  git clone "${ECC_REPO_URL}" "${ECC_CACHE_DIR}"
fi

git -C "${ECC_CACHE_DIR}" checkout --detach "${ECC_REF}"

split_targets "${ECC_TARGETS}"
if [[ ${#TARGET_ARRAY[@]} -eq 0 ]]; then
  fail "no targets selected"
fi

log "ECC ref: $(git -C "${ECC_CACHE_DIR}" rev-parse --short HEAD)"
log "project root: ${PROJECT_ROOT}"
log "cache dir: ${ECC_CACHE_DIR}"
log "profile: ${ECC_PROFILE}"
log "targets: ${ECC_TARGETS}"

for target in "${TARGET_ARRAY[@]}"; do
  [[ -n "${target}" ]] || continue
  cmd=("${ECC_CACHE_DIR}/install.sh" --target "${target}" --profile "${ECC_PROFILE}")
  cmd+=("${EXTRA_ARGS[@]}")
  if [[ "${ECC_APPLY}" != "true" ]]; then
    cmd+=(--dry-run)
  fi
  if [[ "${ECC_JSON}" == "true" ]]; then
    cmd+=(--json)
  fi

  log "running ECC installer for target=${target} mode=$([[ "${ECC_APPLY}" == "true" ]] && printf apply || printf dry-run)"
  (
    cd "${PROJECT_ROOT}"
    "${cmd[@]}"
  )
done

if [[ "${ECC_APPLY}" != "true" ]]; then
  log "dry-run only. Re-run with --apply after reviewing the plan."
else
  log "ECC integration completed. Review git status before committing any generated project-local files."
fi
