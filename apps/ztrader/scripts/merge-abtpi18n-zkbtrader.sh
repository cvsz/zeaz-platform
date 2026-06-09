#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
ZTRADER="$ROOT/apps/ztrader"
ABTP="$ROOT/apps/ABTPi18n"
ZKB="$ROOT/apps/zkbtrader"
REPORT_DIR="$ZTRADER/reports/merge"
DRY_RUN="${DRY_RUN:-true}"
APPLY_DELETE_SOURCE="${APPLY_DELETE_SOURCE:-false}"

copy_dir() {
  local src="$1"
  local dst="$2"
  if [ ! -e "$src" ]; then
    echo "SKIP missing: ${src#$ROOT/}"
    return 0
  fi
  echo "MAP ${src#$ROOT/} -> ${dst#$ROOT/}"
  if [ "$DRY_RUN" = "true" ]; then
    return 0
  fi
  mkdir -p "$dst"
  rsync -a --exclude '.git' --exclude 'node_modules' --exclude '.venv' --exclude 'venv' --exclude '__pycache__' --exclude '.pytest_cache' --exclude '.ruff_cache' "$src"/ "$dst"/
}

copy_file() {
  local src="$1"
  local dst="$2"
  if [ ! -f "$src" ]; then
    echo "SKIP missing: ${src#$ROOT/}"
    return 0
  fi
  echo "MAP ${src#$ROOT/} -> ${dst#$ROOT/}"
  if [ "$DRY_RUN" = "true" ]; then
    return 0
  fi
  mkdir -p "$(dirname "$dst")"
  cp -p "$src" "$dst"
}

write_report() {
  mkdir -p "$REPORT_DIR"
  {
    echo "# zTrader Source Merge Report"
    echo
    echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
    echo "Dry run: $DRY_RUN"
    echo
    echo "## Source stacks"
    echo
    echo "- apps/ABTPi18n"
    echo "- apps/zkbtrader"
    echo
    echo "## Target stack"
    echo
    echo "- apps/ztrader"
    echo
    echo "## Policy"
    echo
    echo "Source apps are retained by default. Set APPLY_DELETE_SOURCE=true only after validation and owner approval."
  } > "$REPORT_DIR/ztrader-source-merge-report.md"
}

main() {
  cd "$ROOT"
  mkdir -p "$REPORT_DIR"

  echo "zTrader source merge"
  echo "ROOT=$ROOT"
  echo "DRY_RUN=$DRY_RUN"
  echo "APPLY_DELETE_SOURCE=$APPLY_DELETE_SOURCE"
  echo

  find apps/ABTPi18n -type f 2>/dev/null | sort > "$REPORT_DIR/abtp-files.txt" || true
  find apps/zkbtrader -type f 2>/dev/null | sort > "$REPORT_DIR/zkbtrader-files.txt" || true
  find apps/ztrader -type f 2>/dev/null | sort > "$REPORT_DIR/ztrader-files-before.txt" || true
  diff -qr apps/ABTPi18n apps/ztrader > "$REPORT_DIR/abtp-vs-ztrader.diff" 2>/dev/null || true
  diff -qr apps/zkbtrader apps/ztrader > "$REPORT_DIR/zkbtrader-vs-ztrader.diff" 2>/dev/null || true

  # ABTPi18n mapping
  copy_dir "$ABTP/configs" "$ZTRADER/config/abtpi18n"
  copy_dir "$ABTP/core" "$ZTRADER/backend/src/ztrader/abt/core"
  copy_dir "$ABTP/strategies" "$ZTRADER/backend/src/ztrader/strategies/abtpi18n"
  copy_dir "$ABTP/monitoring" "$ZTRADER/backend/src/ztrader/monitoring/abtpi18n"
  copy_dir "$ABTP/scripts" "$ZTRADER/scripts/abtpi18n"
  copy_dir "$ABTP/tests" "$ZTRADER/backend/tests/abtpi18n"
  copy_file "$ABTP/package.json" "$ZTRADER/merge-sources/abtpi18n/package.json"
  copy_file "$ABTP/pyproject.toml" "$ZTRADER/merge-sources/abtpi18n/pyproject.toml"
  copy_file "$ABTP/verify.sh" "$ZTRADER/scripts/abtpi18n/verify.sh"
  copy_file "$ABTP/validate-release.sh" "$ZTRADER/scripts/abtpi18n/validate-release.sh"
  copy_file "$ABTP/release.sh" "$ZTRADER/scripts/abtpi18n/release.sh"

  # zkbtrader mapping
  copy_dir "$ZKB/src" "$ZTRADER/backend/src/ztrader/zkb"
  copy_dir "$ZKB/harness" "$ZTRADER/harness/zkbtrader"
  copy_dir "$ZKB/tests" "$ZTRADER/backend/tests/zkbtrader"
  copy_dir "$ZKB/reports" "$ZTRADER/reports/zkbtrader"
  copy_dir "$ZKB/scripts" "$ZTRADER/scripts/zkbtrader"
  copy_dir "$ZKB/alembic" "$ZTRADER/backend/alembic/zkbtrader_source"
  copy_file "$ZKB/alembic.ini" "$ZTRADER/backend/alembic/zkbtrader_source/alembic.ini"
  copy_file "$ZKB/Dockerfile.api" "$ZTRADER/merge-sources/zkbtrader/Dockerfile.api"
  copy_file "$ZKB/Dockerfile.worker" "$ZTRADER/merge-sources/zkbtrader/Dockerfile.worker"
  copy_file "$ZKB/pyproject.toml" "$ZTRADER/merge-sources/zkbtrader/pyproject.toml"
  copy_file "$ZKB/Makefile" "$ZTRADER/merge-sources/zkbtrader/Makefile"

  # Keep runtime safety default aligned with compose.
  if [ "$DRY_RUN" != "true" ]; then
    python3 - <<'PY'
from pathlib import Path
p = Path('apps/ztrader/backend/src/ztrader/core/config.py')
s = p.read_text()
s = s.replace('GLOBAL_KILL_SWITCH: bool = False', 'GLOBAL_KILL_SWITCH: bool = True')
p.write_text(s)
PY
  fi

  find apps/ztrader -type f 2>/dev/null | sort > "$REPORT_DIR/ztrader-files-after.txt" || true
  write_report

  echo
  echo "Report directory: ${REPORT_DIR#$ROOT/}"
  echo "Next validation:"
  echo "  cd apps/ztrader"
  echo "  make validate-local"
  echo "  make merge-report"

  if [ "$APPLY_DELETE_SOURCE" = "true" ]; then
    echo "Source cleanup requested but not performed by this script. Use the final validated cleanup command in the merge plan."
  fi
}

main "$@"
