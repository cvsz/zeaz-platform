#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

PASS=0
FAIL=0

check() {
  local desc="$1"
  shift
  if "$@" >/dev/null 2>&1; then
    echo "  PASS: $desc"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $desc"
    FAIL=$((FAIL + 1))
  fi
}

echo "=== zDash Monorepo Verification ==="
echo ""

check "apps/zdash exists" test -d apps/zdash
check "apps/zdash/backend exists" test -d apps/zdash/backend
check "apps/zdash/frontend exists" test -d apps/zdash/frontend
check "apps/zdash/Makefile exists" test -f apps/zdash/Makefile
check "apps/zdash/CHANGELOG.md exists" test -f apps/zdash/CHANGELOG.md
check "no nested .git" test '!' -d apps/zdash/.git
check "no nested .venv" test '!' -d apps/zdash/.venv
check "no nested node_modules" test '!' -d apps/zdash/node_modules
check "no .env tracked" sh -c '! git ls-files | grep -Eq "(^|/)\\.env($|/)"'
check "root Makefile has zdash-validate-fast" grep -q "^zdash-validate-fast" Makefile
check "root Makefile has zdash-server-start" grep -q "^zdash-server-start" Makefile
check "root README mentions apps/zdash" grep -q "apps/zdash" README.md
check "phase51-validate target exists" grep -q "^phase51-validate" Makefile

echo ""
echo "--- Results ---"
echo "  PASS: $PASS  |  FAIL: $FAIL"
if [ "$FAIL" -gt 0 ]; then
  echo "  STATUS: FAILED"
  exit 1
else
  echo "  STATUS: PASSED"
fi
