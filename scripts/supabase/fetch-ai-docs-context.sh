#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

OUT_DIR="${SUPABASE_DOCS_CACHE_DIR:-.cache/supabase-ai-tools}"
LLMS_URL="${SUPABASE_LLMS_URL:-https://supabase.com/llms.txt}"
GUIDES_URL="${SUPABASE_GUIDES_URL:-https://supabase.com/llms/guides.txt}"

log(){ printf '[%s] %s\n' "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$*"; }
warn(){ log "WARN: $*" >&2; }
die(){ log "ERROR: $*" >&2; exit 1; }
has(){ command -v "$1" >/dev/null 2>&1; }

has curl || die "curl is required"
mkdir -p "$OUT_DIR"
chmod 700 "$OUT_DIR" 2>/dev/null || true

fetch(){
  local url="$1" out="$2"
  log "fetching $url"
  curl -fsSL "$url" -o "$out"
  chmod 600 "$out" 2>/dev/null || true
}

fetch "$LLMS_URL" "$OUT_DIR/llms.txt"
fetch "$GUIDES_URL" "$OUT_DIR/guides.txt"

{
  echo "# Supabase AI Tools Context Extract"
  echo
  echo "Generated: $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo
  echo "## Matching guide lines"
  grep -Ein 'AI & Vectors|Model context protocol|Supabase MCP|mcp-lite|MCP server|Security risks|project_ref|Edge Functions|pgvector|semantic search|hybrid search' "$OUT_DIR/guides.txt" || true
} > "$OUT_DIR/supabase-ai-tools-extract.md"
chmod 600 "$OUT_DIR/supabase-ai-tools-extract.md" 2>/dev/null || true

log "cached Supabase docs in $OUT_DIR"
log "extract written: $OUT_DIR/supabase-ai-tools-extract.md"
