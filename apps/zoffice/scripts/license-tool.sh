#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
APP_DIR="$ROOT/app"
STATUS_DIR="${VO_STATUS_DIR:-$ROOT/.runtime/data}"
mkdir -p "$STATUS_DIR"

usage() {
  cat <<'EOF'
zOffice license operator tool

Usage:
  bash scripts/license-tool.sh status
  bash scripts/license-tool.sh doctor
  bash scripts/license-tool.sh activate <valid-license-key>
  bash scripts/license-tool.sh deactivate
  bash scripts/license-tool.sh feature <feature-name>
  bash scripts/license-tool.sh agent-limit

Notes:
  - This tool does not generate, forge, or bypass license keys.
  - Activation requires a valid key accepted by the configured license provider.
  - Local receipts are integrity-checked and bound to this installation.
  - Local developer/internal mode is controlled separately by the app runtime.
EOF
}

cmd="${1:-status}"
shift || true

cd "$APP_DIR"
case "$cmd" in
  status)
    VO_STATUS_DIR="$STATUS_DIR" python3 license.py status
    ;;
  doctor)
    VO_STATUS_DIR="$STATUS_DIR" python3 license.py doctor
    ;;
  activate)
    key="${1:-}"
    if [ -z "$key" ]; then
      echo "ERROR: valid license key argument required" >&2
      exit 2
    fi
    VO_STATUS_DIR="$STATUS_DIR" python3 license.py activate "$key"
    ;;
  deactivate)
    VO_STATUS_DIR="$STATUS_DIR" python3 license.py deactivate
    ;;
  feature)
    feature="${1:-}"
    if [ -z "$feature" ]; then
      echo "ERROR: feature name required" >&2
      exit 2
    fi
    VO_STATUS_DIR="$STATUS_DIR" python3 - "$feature" <<'PY'
import json
import sys
from license import check_feature
feature = sys.argv[1]
print(json.dumps({"feature": feature, "enabled": bool(check_feature(feature))}, indent=2))
PY
    ;;
  agent-limit)
    VO_STATUS_DIR="$STATUS_DIR" python3 - <<'PY'
import json
from license import get_agent_limit
print(json.dumps({"maxAgents": get_agent_limit()}, indent=2))
PY
    ;;
  help|-h|--help)
    usage
    ;;
  *)
    usage >&2
    exit 2
    ;;
esac
