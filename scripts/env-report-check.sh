#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# shellcheck source=scripts/cloudflare/lib/env-scope.sh
source "$SCRIPT_DIR/cloudflare/lib/env-scope.sh"

MODE="${1:-advisory}"
case "$MODE" in
  advisory|--advisory) STRICT=false ;;
  strict|--strict) STRICT=true ;;
  *) echo "ERROR: unknown env validation mode: $MODE" >&2; exit 2 ;;
esac

cf_load_cloudflare_env_scope
cd "$PROJECT_ROOT"

PYTHON_BIN="${PYTHON:-python3}"
[[ -x ".venv/bin/python" ]] && PYTHON_BIN=".venv/bin/python"

if [[ "$STRICT" == "true" ]]; then
  exec "$PYTHON_BIN" python/cfstack_validate_env.py --strict
fi

if "$PYTHON_BIN" python/cfstack_validate_env.py --json; then
  exit 0
fi

cat <<'ADVISORY'

Environment validation is incomplete because deployment-specific values are missing or placeholder-only.
This is advisory for project-upgrade-report and does not mean the repository source is broken.

To complete deployment validation, fill .env/.env.cloudflare with real local values, then run:

  python3 python/cfstack_validate_env.py --strict
  make validate-env-strict

Required real values normally include Cloudflare account/zone IDs, scoped tokens, identity provider metadata, SOPS age key, and origin host settings.
ADVISORY

exit 0
