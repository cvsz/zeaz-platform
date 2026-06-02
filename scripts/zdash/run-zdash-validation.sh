#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
ZDASH_DIR="${ROOT_DIR}/apps/zdash"

if [[ ! -d "${ZDASH_DIR}" ]]; then
  echo "ERROR: apps/zdash not found"
  exit 1
fi

if [[ ! -f "${ZDASH_DIR}/Makefile" ]]; then
  echo "ERROR: apps/zdash/Makefile not found"
  exit 1
fi

echo "=== zDash validation bootstrap ==="

if [[ ! -x "${ZDASH_DIR}/backend/.venv/bin/python" ]]; then
  echo "backend/.venv missing; creating local venv"
  python3 -m venv "${ZDASH_DIR}/backend/.venv"
  "${ZDASH_DIR}/backend/.venv/bin/python" -m pip install --upgrade pip setuptools wheel

  (
    cd "${ZDASH_DIR}/backend"
    ./.venv/bin/pip install -e '.[dev]'
  )
fi

if [[ ! -d "${ZDASH_DIR}/frontend/node_modules" ]]; then
  echo "frontend/node_modules missing; installing frontend dependencies"
  (
    cd "${ZDASH_DIR}/frontend"
    npm ci --legacy-peer-deps --no-audit --fund=false
  )
fi

echo "=== running apps/zdash make validate-fast ==="
(
  cd "${ZDASH_DIR}"
  make validate-fast
)
