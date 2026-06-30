#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: CONFIRM_BACKUP=yes bash scripts/backup.sh [output_dir]

Creates a Postgres dump and Redis snapshot copy for the LiteLLM stack.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${CONFIRM_BACKUP:-no}" != "yes" ]]; then
  echo '{"ok":false,"error":"set_CONFIRM_BACKUP=yes"}'
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
service_dir="$(cd "${script_dir}/.." && pwd)"
compose_file="${service_dir}/docker-compose.yaml"
output_dir="${1:-./backups/$(date -u +%Y%m%dT%H%M%SZ)}"
mkdir -p "$output_dir"

docker compose -f "$compose_file" exec -T litellm-postgres \
  pg_dump -U "${LITELLM_DB_USER:-litellm}" "${LITELLM_DB_NAME:-litellm}" \
  > "${output_dir}/litellm-postgres.sql"

docker compose -f "$compose_file" exec -T litellm-redis \
  sh -lc 'redis-cli save >/dev/null && cat /data/dump.rdb' \
  > "${output_dir}/litellm-redis.rdb"

echo "{\"ok\":true,\"output_dir\":\"${output_dir}\"}"
