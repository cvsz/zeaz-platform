#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

ROOT="${PROJECT_ROOT:-}"
if [[ -z "$ROOT" ]]; then
  ROOT="$PWD"
  while [[ "$ROOT" != "/" ]]; do
    if [[ -d "$ROOT/.git" || -f "$ROOT/Makefile" || -f "$ROOT/.env.example" ]]; then
      break
    fi
    ROOT="$(dirname "$ROOT")"
  done
fi
[[ "$ROOT" != "/" ]] || ROOT="$PWD"
cd "$ROOT"

DRY_RUN=false
APPLY=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --apply) APPLY=true; shift ;;
    --help|-h)
      cat <<'USAGE'
Usage: bash scripts/refactor-cloudflare-vars.sh --dry-run|--apply

Migrates legacy Cloudflare environment variable names from CF_* to CLOUDFLARE_*
in active tracked text files. Ignored/generated backup folders are skipped.

Examples:
  bash scripts/refactor-cloudflare-vars.sh --dry-run
  bash scripts/refactor-cloudflare-vars.sh --apply
USAGE
      exit 0
      ;;
    *) echo "ERROR: unknown option: $1" >&2; exit 1 ;;
  esac
done

if [[ "$DRY_RUN" != "true" && "$APPLY" != "true" ]]; then
  echo "ERROR: pass --dry-run or --apply" >&2
  exit 1
fi

mapfile -t files < <(
  git ls-files \
    ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' ':!*.pdf' ':!*.zip' \
    ':!.backup/**' ':!.cloudflare-backups/**' ':!.cache/**' ':!reports/**' \
    2>/dev/null || true
)

if [[ "${#files[@]}" -eq 0 ]]; then
  echo "No tracked files found."
  exit 0
fi

replacements=(
  'CLOUDFLARE_ACCOUNT_ID:CLOUDFLARE_ACCOUNT_ID'
  'CLOUDFLARE_ZONE_ID:CLOUDFLARE_ZONE_ID'
  'CLOUDFLARE_BOOTSTRAP_TOKEN:CLOUDFLARE_BOOTSTRAP_TOKEN'
  'CLOUDFLARE_DNS_TOKEN:CLOUDFLARE_DNS_TOKEN'
  'CLOUDFLARE_ZT_TOKEN:CLOUDFLARE_ZT_TOKEN'
  'CLOUDFLARE_WORKERS_TOKEN:CLOUDFLARE_WORKERS_TOKEN'
  'CLOUDFLARE_WAF_TOKEN:CLOUDFLARE_WAF_TOKEN'
  'CLOUDFLARE_TUNNEL_TOKEN:CLOUDFLARE_TUNNEL_TOKEN'
  'CLOUDFLARE_R2_TOKEN:CLOUDFLARE_R2_TOKEN'
  'CLOUDFLARE_AUDIT_TOKEN:CLOUDFLARE_AUDIT_TOKEN'
  'CLOUDFLARE_AI_GATEWAY_TOKEN:CLOUDFLARE_AI_GATEWAY_TOKEN'
  'CLOUDFLARE_AI_GATEWAY_SLUG:CLOUDFLARE_AI_GATEWAY_SLUG'
)

changed=0
for file in "${files[@]}"; do
  [[ -f "$file" ]] || continue
  if ! grep -Iq . "$file"; then
    continue
  fi

  original="$(cat "$file")"
  updated="$original"
  for pair in "${replacements[@]}"; do
    old="${pair%%:*}"
    new="${pair#*:}"
    updated="${updated//${old}/${new}}"
  done

  if [[ "$updated" != "$original" ]]; then
    changed=$((changed + 1))
    if [[ "$DRY_RUN" == "true" ]]; then
      echo "WOULD_UPDATE $file"
    else
      printf '%s' "$updated" > "$file"
      echo "UPDATED $file"
    fi
  fi
done

if [[ "$DRY_RUN" == "true" ]]; then
  echo "Dry run complete. Files needing update: $changed"
else
  echo "Migration complete. Files updated: $changed"
  bash scripts/check-no-cf-vars.sh
fi