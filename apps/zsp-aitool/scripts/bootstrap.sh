#!/usr/bin/env bash
set -Eeuo pipefail

RUNTIME=${1:-gemini}

echo "Bootstrapping zsp-aitool for runtime: $RUNTIME"

case $RUNTIME in
  gemini)
    bash zsp-agent-agy-bootstrap-safe.sh
    ;;
  claude)
    bash zsp-agent-claude-bootstrap-safe.sh
    ;;
  codex)
    bash zsp-agent-codex-bootstrap-safe.sh
    ;;
  *)
    echo "Unknown runtime: $RUNTIME"
    exit 1
    ;;
esac
