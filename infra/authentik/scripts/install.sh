#!/usr/bin/env bash
set -e

echo "Installing Authentik..."
mkdir -p infra/authentik/media
mkdir -p infra/authentik/certs
mkdir -p infra/authentik/custom-templates

if [ ! -f infra/authentik/.env ]; then
  echo "Creating .env from template..."
  cat <<EOF > infra/authentik/.env
PG_PASS=$(openssl rand -base64 32)
PG_USER=authentik
PG_DB=authentik
AUTHENTIK_SECRET_KEY=$(openssl rand -base64 48)
AUTHENTIK_ERROR_REPORTING__ENABLED=false
EOF
fi

docker network create proxy || true
docker compose -f infra/authentik/compose.yaml pull
docker compose -f infra/authentik/compose.yaml up -d

echo "Authentik started."
