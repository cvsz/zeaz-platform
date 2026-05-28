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

legacy_regex='\bCF_(ACCOUNT_ID|ZONE_ID|BOOTSTRAP_TOKEN|DNS_TOKEN|ZT_TOKEN|WORKERS_TOKEN|WAF_TOKEN|TUNNEL_TOKEN|R2_TOKEN|AUDIT_TOKEN|AI_GATEWAY_TOKEN|AI_GATEWAY_SLUG)\b'

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  files_cmd=(git grep -n -E "$legacy_regex" -- ':!*.png' ':!*.jpg' ':!*.jpeg' ':!*.gif' ':!*.webp' ':!*.ico' ':!*.pdf' ':!*.zip' ':!.backup/**' ':!.cloudflare-backups/**' ':!.cache/**' ':!reports/**')
else
  files_cmd=(grep -RInE "$legacy_regex" . --exclude-dir=.git --exclude-dir=.backup --exclude-dir=.cloudflare-backups --exclude-dir=.cache --exclude-dir=reports)
fi

set +e
output="$("${files_cmd[@]}" 2>/dev/null)"
rc=$?
set -e

if [[ "$rc" -eq 0 && -n "$output" ]]; then
  cat <<'MSG'
ERROR: legacy CF_* Cloudflare environment variables remain in active tracked files.
Use canonical CLOUDFLARE_* names instead.

MSG
  printf '%s\n' "$output"
  exit 1
fi

if [[ "$rc" -gt 1 ]]; then
  echo "ERROR: scan failed" >&2
  exit "$rc"
fi

echo "No legacy CF_* Cloudflare env variables found in active files."
