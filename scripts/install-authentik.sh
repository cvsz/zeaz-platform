#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'

AUTH_DIR="/opt/authentik"

sudo mkdir -p "${AUTH_DIR}"

cd "${AUTH_DIR}"

if ! command -v docker >/dev/null 2>&1; then
echo "Docker not installed"
exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
echo "Docker Compose missing"
exit 1
fi

POSTGRES_PASSWORD=$(openssl rand -hex 32)
AUTHENTIK_SECRET_KEY=$(openssl rand -hex 64)

cat > .env <<EOF
PG_PASS=${POSTGRES_PASSWORD}
AUTHENTIK_SECRET_KEY=${AUTHENTIK_SECRET_KEY}
EOF

cat > docker-compose.yml <<'EOF'
services:

  postgresql:
    image: postgres:16
    restart: unless-stopped
    environment:
      POSTGRES_USER: authentik
      POSTGRES_PASSWORD: ${PG_PASS}
      POSTGRES_DB: authentik
    volumes:
      - postgres:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: unless-stopped

  server:
    image: ghcr.io/goauthentik/server
    restart: unless-stopped
    command: server
    ports:
      - "9000:9000"
      - "9443:9443"
    environment:
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: authentik
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    depends_on:
      - postgresql
      - redis

  worker:
    image: ghcr.io/goauthentik/server
    restart: unless-stopped
    command: worker
    environment:
      AUTHENTIK_SECRET_KEY: ${AUTHENTIK_SECRET_KEY}
      AUTHENTIK_REDIS__HOST: redis
      AUTHENTIK_POSTGRESQL__HOST: postgresql
      AUTHENTIK_POSTGRESQL__USER: authentik
      AUTHENTIK_POSTGRESQL__NAME: authentik
      AUTHENTIK_POSTGRESQL__PASSWORD: ${PG_PASS}
    depends_on:
      - postgresql
      - redis

volumes:
  postgres:
EOF

docker compose pull

docker compose up -d

echo
echo "Authentik starting..."
echo
echo "URL: http://$(hostname -I | awk '{print $1}'):9000"
echo
echo "Check:"
echo "docker compose ps"
echo "docker compose logs -f server"
