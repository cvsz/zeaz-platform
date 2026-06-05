#!/usr/bin/env bash
# =============================================================================
# Stage the opencode harness (agents + commands) into scripts/harness/ so the
# installer can copy them to ~/.config/opencode/{agents,commands} on a fresh
# machine. Run this once after pulling new agents/commands.
#
# Usage:
#   ./scripts/stage-harness.sh                   # stage from default sources
#   ./scripts/stage-harness.sh --source=DIR      # stage from DIR
# =============================================================================
set -euo pipefail
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &>/dev/null && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/.." &>/dev/null && pwd)"
STAGE="$REPO_ROOT/scripts/harness"
SOURCE="${HOME}/.config/opencode"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --source=*) SOURCE="${1#*=}" ;;
    --out=*)    STAGE="${1#*=}" ;;
    -h|--help)
      sed -n '3,12p' "$0"; exit 0 ;;
    *) echo "unknown flag: $1" >&2; exit 2 ;;
  esac
  shift
done

if [[ ! -d "$SOURCE/agents" || ! -d "$SOURCE/commands" ]]; then
  echo "source missing agents/ or commands/: $SOURCE" >&2
  echo "hint: pass --source=DIR" >&2
  exit 1
fi

mkdir -p "$STAGE/agents" "$STAGE/commands"
cp -n "$SOURCE/agents/"*.md   "$STAGE/agents/"   2>/dev/null || true
cp -n "$SOURCE/commands/"*.md "$STAGE/commands/" 2>/dev/null || true

a=$(find "$STAGE/agents"   -name '*.md' 2>/dev/null | wc -l)
c=$(find "$STAGE/commands" -name '*.md' 2>/dev/null | wc -l)
echo "staged $a agents + $c commands -> $STAGE"
