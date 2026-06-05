#!/usr/bin/env bash
set -euo pipefail

# Deterministic dependency graph + lockfile drift guard.
go mod tidy

if ! git diff --exit-code -- go.mod go.sum >/dev/null; then
  echo "dependency drift detected: go.mod/go.sum changed after go mod tidy"
  git --no-pager diff -- go.mod go.sum
  exit 1
fi

echo "dependency drift guard passed"
