#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT"

fail=0

echo "=== cvsz apps merge validation ==="

echo
echo "--- nested git check ---"
nested="$(find apps -mindepth 2 -maxdepth 2 -type d -name .git -print | sort || true)"
if [ -n "$nested" ]; then
  echo "$nested"
  echo "FAIL: nested .git directories remain"
  fail=1
else
  echo "PASS: no nested .git directories under apps/*"
fi

echo
echo "--- forbidden tracked files ---"
forbidden="$(git ls-files | grep -E '(^|/)(\.env|\.env\.local|\.env\.production|\.env\.cloudflare|.*\.tfstate|.*\.tfvars|.*\.tfplan|.*\.sqlite|.*\.db|.*\.log)$' || true)"
if [ -n "$forbidden" ]; then
  echo "$forbidden"
  echo "FAIL: forbidden tracked runtime files"
  fail=1
else
  echo "PASS: no forbidden tracked runtime files"
fi

echo
echo "--- import source check ---"
while IFS= read -r appdir; do
  app="$(basename "$appdir")"
  case "$app" in
    api|web) continue ;;
  esac
  if [ -f "$appdir/IMPORT_SOURCE.md" ]; then
    echo "PASS: $app"
  else
    echo "FAIL: missing $appdir/IMPORT_SOURCE.md"
    fail=1
  fi
done < <(find apps -mindepth 1 -maxdepth 1 -type d | sort)

echo
echo "--- stale zDash domains ---"
if grep -RInE 'api\.zdash\.zeaz\.dev|zdash-api\.zeaz\.dev|dash\.zeaz\.dev' apps/zdash scripts configs terraform docs \
  --exclude-dir=node_modules \
  --exclude-dir=.venv \
  --exclude-dir=dist \
  --exclude-dir=build \
  --exclude-dir=.terraform \
  --exclude-dir=generated \
  2>/dev/null; then
  echo "FAIL: stale zDash domain references found"
  fail=1
else
  echo "PASS: no stale zDash domain references"
fi

echo
echo "--- merge plan refresh ---"
python3 scripts/apps/plan-cvsz-apps-merge.py

if [ "$fail" -ne 0 ]; then
  echo "cvsz apps merge validation failed"
  exit 1
fi

echo "PASS: cvsz apps merge validation clean"
