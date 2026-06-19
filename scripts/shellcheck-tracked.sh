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

if ! command -v shellcheck >/dev/null 2>&1; then
  echo "shellcheck missing; skipped"
  exit 0
fi

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  mapfile -t files < <(git ls-files 'scripts/*.sh' 'scripts/**/*.sh' 'ops/*.sh' 'ops/**/*.sh')
else
  mapfile -t files < <(find scripts ops -type f -name '*.sh' 2>/dev/null | sort)
fi

if [[ "${#files[@]}" -eq 0 ]]; then
  echo "no tracked shell scripts found"
  exit 0
fi

# Project reports fail on Shellcheck errors only. Warnings and info remain
# visible during local development but do not block a source-health report.
shellcheck -S error "${files[@]}"
