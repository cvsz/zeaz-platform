#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

PROJECT_REF="${SUPABASE_PROJECT_REF:-}"
BASE_URL="${SUPABASE_MCP_BASE_URL:-https://mcp.supabase.com/mcp}"
OUT_FILE="${SUPABASE_MCP_CONFIG_OUT:-.agent/supabase-mcp.json}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
die(){ log "ERROR: $*" >&2; exit 1; }

[[ -n "$PROJECT_REF" ]] || die "SUPABASE_PROJECT_REF is required"
[[ "$PROJECT_REF" =~ ^[A-Za-z0-9_-]+$ ]] || die "SUPABASE_PROJECT_REF contains invalid characters"

mkdir -p "$(dirname "$OUT_FILE")"
chmod 700 "$(dirname "$OUT_FILE")" 2>/dev/null || true

python3 - "$PROJECT_REF" "$BASE_URL" "$OUT_FILE" <<'PY'
from __future__ import annotations

import json
import sys
from pathlib import Path
from urllib.parse import urlencode

project_ref, base_url, out_file = sys.argv[1:4]
url = f"{base_url}?{urlencode({'project_ref': project_ref})}"

config = {
    "mcpServers": {
        "supabase": {
            "type": "http",
            "url": url,
            "headers": {
                "Authorization": "Bearer ${SUPABASE_ACCESS_TOKEN}"
            },
        }
    }
}

path = Path(out_file)
path.write_text(json.dumps(config, indent=2) + "\n", encoding="utf-8")
PY

chmod 600 "$OUT_FILE"
log "wrote local Supabase MCP config: $OUT_FILE"
log "token placeholder preserved: SUPABASE_ACCESS_TOKEN"
