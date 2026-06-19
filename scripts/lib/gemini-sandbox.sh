#!/usr/bin/env bash
# shellcheck shell=bash
# Shared helpers for running ZeaZ scripts inside read-only or partially read-only
# AI sandboxes. Source this file from Bash scripts that need to create cache,
# log, config, or generated files without assuming the repository is writable.

GEMINI_PACK_ROOT="${GEMINI_PACK_ROOT:-${GEMINI_SANDBOX_FALLBACK_ROOT:-/tmp/gemini-pack}}"

_gemini_timestamp() {
  date -u '+%Y-%m-%dT%H:%M:%SZ' 2>/dev/null || date
}

gemini_log() {
  local level="${1:-INFO}"
  shift || true
  printf '[%s] [%s] %s\n' "$(_gemini_timestamp)" "$level" "$*" >&2
}

gemini_get_writable_dir() {
  local target_dir="${1:?target directory required}"
  local fallback_dir="${2:-${GEMINI_PACK_ROOT}}"
  local probe=""

  if [[ -n "$target_dir" ]]; then
    mkdir -p "$target_dir" 2>/dev/null || true
    if [[ -d "$target_dir" ]]; then
      probe="$(mktemp "${target_dir%/}/.writable.XXXXXX" 2>/dev/null || true)"
      if [[ -n "$probe" ]]; then
        rm -f "$probe"
        printf '%s\n' "$target_dir"
        return 0
      fi
    fi
  fi

  mkdir -p "$fallback_dir"
  printf '%s\n' "$fallback_dir"
}

gemini_repo_root() {
  local fallback="${1:-$PWD}"
  if command -v git >/dev/null 2>&1 && git rev-parse --show-toplevel >/dev/null 2>&1; then
    git rev-parse --show-toplevel
  else
    printf '%s\n' "$fallback"
  fi
}

gemini_init_sandbox_paths() {
  local project_root="${1:-$(gemini_repo_root "$PWD") }"
  project_root="${project_root% }"

  GEMINI_PACK_ROOT="${GEMINI_PACK_ROOT:-/tmp/gemini-pack}"
  GEMINI_CACHE_DIR="$(gemini_get_writable_dir "${GEMINI_CACHE_DIR:-${project_root}/.cache/ecc}" "${GEMINI_PACK_ROOT}/cache")"
  GEMINI_LOG_DIR="$(gemini_get_writable_dir "${GEMINI_LOG_DIR:-${project_root}/.logs}" "${GEMINI_PACK_ROOT}/logs")"

  export GEMINI_PACK_ROOT GEMINI_CACHE_DIR GEMINI_LOG_DIR
  chmod 700 "$GEMINI_PACK_ROOT" "$GEMINI_CACHE_DIR" "$GEMINI_LOG_DIR" 2>/dev/null || true
}

gemini_resolve_output_file() {
  local requested_file="${1:?output file path required}"
  local fallback_name="${2:-$(basename "$requested_file")}"
  local requested_parent
  local writable_parent

  requested_parent="$(dirname "$requested_file")"
  writable_parent="$(gemini_get_writable_dir "$requested_parent" "$GEMINI_PACK_ROOT")"

  if [[ "$writable_parent" == "$requested_parent" ]]; then
    printf '%s\n' "$requested_file"
  else
    printf '%s\n' "${writable_parent%/}/${fallback_name}"
  fi
}

gemini_start_file_log() {
  local log_file="${1:-${GEMINI_LOG_DIR:-${GEMINI_PACK_ROOT}/logs}/script.log}"
  mkdir -p "$(dirname "$log_file")"
  exec > >(tee -a "$log_file") 2>&1
  gemini_log INFO "started script execution; cache=${GEMINI_CACHE_DIR:-unset}; log=${log_file}"
}
