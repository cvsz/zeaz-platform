#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() { cat <<'USAGE'
Usage: scripts/env/generate-local-env.sh [--file .env]

Creates a gitignored local env file if missing. Existing values are preserved and no
secret values are printed. Generates POSTGRES_PASSWORD and DATABASE_URL locally.
USAGE
}
log() { printf '[zeaz-env] %s\n' "$*"; }

out_file=.env
while (($#)); do
  case "$1" in
    --file) out_file="${2:?missing file}"; shift 2 ;;
    --help|-h) usage; exit 0 ;;
    *) log "unknown argument: $1"; usage; exit 2 ;;
  esac
done

if [[ -e "$out_file" ]]; then
  log "preserving existing $out_file; appending only missing keys"
else
  umask 077
  : > "$out_file"
  log "created $out_file with mode 600"
fi
chmod 600 "$out_file" 2>/dev/null || true

get_value() { awk -F= -v key="$1" '$1==key {sub(/^[^=]*=/,""); print; exit}' "$out_file" 2>/dev/null || true; }
has_key() { grep -Eq "^$1=" "$out_file" 2>/dev/null; }
append_kv() { local key="$1" value="$2"; if ! has_key "$key"; then printf '%s=%s\n' "$key" "$value" >> "$out_file"; log "added $key"; fi; }

password="$(get_value POSTGRES_PASSWORD)"
if [[ -z "$password" ]]; then
  password="$(scripts/db/generate-secure-db-password.sh --length 48)"
fi

append_kv NODE_ENV development
append_kv ENVIRONMENT dev
append_kv PRIMARY_DOMAIN zeaz.dev
append_kv POSTGRES_HOST postgres
append_kv POSTGRES_PORT 5432
append_kv POSTGRES_DB zeaz_platform
append_kv POSTGRES_USER zeazdev
append_kv POSTGRES_PASSWORD "$password"
append_kv DATABASE_URL "postgresql://zeazdev:${password}@postgres:5432/zeaz_platform"
append_kv REDIS_URL redis://redis:6379/0
append_kv CLOUDFLARE_TUNNEL_NAME zeaz-platform
append_kv OPENWORK_PORT 4101
append_kv API_PORT 4102
append_kv WEB_PORT 4103
append_kv ZOFFICE_PORT 4104
append_kv ZWALLET_PORT 4105
append_kv ZTRADER_PORT 4106
append_kv ZDASH_PORT 4107
append_kv ZSP_AITOOL_PORT 4108
append_kv ZVEO_PORT 4109
append_kv ZSTICKER_PORT 4110
append_kv ZCINO_PORT 4111
append_kv ZLMS_PROD_PORT 4112
append_kv ZLINEBOT_PORT 4113
append_kv LINE_CHANNEL_ACCESS_TOKEN ''
append_kv LINE_CHANNEL_SECRET ''
append_kv LINE_WEBHOOK_SECRET ''
log "local env generation complete; values were not printed"
