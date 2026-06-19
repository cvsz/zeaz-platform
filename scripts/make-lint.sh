#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -f "$ROOT/Makefile" || -f "$ROOT/.env.example" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"
cd "$ROOT"

PYTHON_BIN="${PYTHON:-python3}"
TF_ROOT="${TF_ROOT:-terraform}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }

log "running shellcheck"
bash scripts/shellcheck-tracked.sh

log "running YAML validation"
if [[ -f scripts/validate-yaml.py ]]; then
  "$PYTHON_BIN" scripts/validate-yaml.py
else
  warn "scripts/validate-yaml.py missing; skipped"
fi

log "running TFLint"
if command -v tflint >/dev/null 2>&1; then
  if [[ -d "$TF_ROOT" ]]; then
    tflint --recursive --chdir="$TF_ROOT"
  else
    warn "$TF_ROOT missing; TFLint skipped"
  fi
else
  warn "tflint not installed; skipped"
fi

log "lint complete"
