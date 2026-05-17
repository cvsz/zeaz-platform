#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

# no-op in this repository unless .next output exists
if [[ -d .next/server/chunks ]]; then
  mapfile -t chunks < <(find .next/server/chunks -maxdepth 1 -type f | head -n 5)
  for chunk in "${chunks[@]:-}"; do
    [[ -n "$chunk" ]] || continue
    ln -sfn "chunks/$(basename "$chunk")" ".next/server/$(basename "$chunk")"
  done
  echo "Linked Next.js server chunks into .next/server"
else
  echo "No .next/server/chunks directory found; skipping link step"
fi
