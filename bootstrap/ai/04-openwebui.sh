#!/usr/bin/env bash
set -Eeuo pipefail
docker rm -f openwebui >/dev/null 2>&1 || true
docker volume create openwebui >/dev/null 2>&1 || true
docker run -d --name openwebui --restart unless-stopped -p 3000:8080 -v openwebui:/app/backend/data ghcr.io/open-webui/open-webui:main
