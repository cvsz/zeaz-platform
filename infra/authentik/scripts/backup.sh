#!/usr/bin/env bash
set -e

echo "Backing up Authentik database..."
mkdir -p backups/authentik
BACKUP_FILE="backups/authentik/db_$(date +%Y%m%d_%H%M%S).sql.gz"

docker compose -f infra/authentik/compose.yaml exec -T postgresql pg_dump -U authentik authentik | gzip > $BACKUP_FILE

echo "Backup completed: $BACKUP_FILE"
