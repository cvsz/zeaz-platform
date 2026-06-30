#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

usage() {
  cat <<'EOF'
Usage: CONFIRM_RESTORE=yes bash scripts/restore.sh <backup_dir>

Restores Postgres and Redis state from a previously created backup directory.
EOF
}

if [[ "${1:-}" == "--help" ]]; then
  usage
  exit 0
fi

if [[ "${CONFIRM_RESTORE:-no}" != "yes" ]]; then
  echo '{"ok":false,"error":"set_CONFIRM_RESTORE=yes"}'
  exit 1
fi

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
service_dir="$(cd "${script_dir}/.." && pwd)"
compose_file="${service_dir}/docker-compose.yaml"
backup_dir="${1:-}"
if [[ -z "$backup_dir" || ! -d "$backup_dir" ]]; then
  echo '{"ok":false,"error":"backup_dir_missing"}'
  exit 1
fi

sql_dump="${backup_dir}/litellm-postgres.sql"
redis_dump="${backup_dir}/litellm-redis.rdb"

if [[ ! -f "$sql_dump" || ! -f "$redis_dump" ]]; then
  echo '{"ok":false,"error":"backup_files_missing"}'
  exit 1
fi

docker compose -f "$compose_file" exec -T litellm-postgres \
  psql -U "${LITELLM_DB_USER:-litellm}" -d "${LITELLM_DB_NAME:-litellm}" \
  < "$sql_dump"

docker compose -f "$compose_file" cp "$redis_dump" litellm-redis:/data/dump.rdb
docker compose -f "$compose_file" restart litellm-redis

echo "{\"ok\":true,\"backup_dir\":\"${backup_dir}\"}"
