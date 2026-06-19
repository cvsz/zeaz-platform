#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT="${1:-omega-platform}"

echo "[*] Generating ${PROJECT}"

mkdir -p \
  "${PROJECT}/bin" \
  "${PROJECT}/scripts" \
  "${PROJECT}/compose/core" \
  "${PROJECT}/compose/monitoring" \
  "${PROJECT}/compose/ai" \
  "${PROJECT}/compose/security" \
  "${PROJECT}/configs" \
  "${PROJECT}/data"

###############################################################################
# ROOT INSTALLER
###############################################################################

cat > "${PROJECT}/install.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"

chmod +x "$ROOT"/scripts/*.sh

"$ROOT/scripts/01-prereqs.sh"
"$ROOT/scripts/02-security.sh"
"$ROOT/scripts/03-docker.sh"
"$ROOT/scripts/04-k3s.sh"
"$ROOT/scripts/05-directories.sh"
"$ROOT/scripts/06-stack.sh"

echo
echo "Omega Installation Complete"
echo
EOF

###############################################################################
# PREREQS
###############################################################################

cat > "${PROJECT}/scripts/01-prereqs.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt update

apt install -y \
  curl \
  wget \
  git \
  jq \
  unzip \
  zip \
  make \
  htop \
  vim \
  net-tools \
  ca-certificates
EOF

###############################################################################
# SECURITY
###############################################################################

cat > "${PROJECT}/scripts/02-security.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt install -y \
  ufw \
  fail2ban

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

ufw --force enable

systemctl enable fail2ban
systemctl start fail2ban
EOF

###############################################################################
# DOCKER
###############################################################################

cat > "${PROJECT}/scripts/03-docker.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

curl -fsSL https://get.docker.com | sh

systemctl enable docker
systemctl start docker
EOF

###############################################################################
# K3S
###############################################################################

cat > "${PROJECT}/scripts/04-k3s.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

curl -sfL https://get.k3s.io | sh -

mkdir -p ~/.kube

sudo cp /etc/rancher/k3s/k3s.yaml ~/.kube/config

sudo chown $(id -u):$(id -g) ~/.kube/config
EOF

###############################################################################
# DIRECTORIES
###############################################################################

cat > "${PROJECT}/scripts/05-directories.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

mkdir -p \
  /opt/omega/postgres \
  /opt/omega/redis \
  /opt/omega/grafana \
  /opt/omega/prometheus \
  /opt/omega/loki \
  /opt/omega/authentik \
  /opt/omega/ollama \
  /opt/omega/openwebui
EOF

###############################################################################
# STACK DEPLOY
###############################################################################

cat > "${PROJECT}/scripts/06-stack.sh" <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

docker compose \
  -f compose/core/docker-compose.yml \
  -f compose/monitoring/docker-compose.yml \
  -f compose/ai/docker-compose.yml \
  up -d
EOF

###############################################################################
# CORE STACK
###############################################################################

cat > "${PROJECT}/compose/core/docker-compose.yml" <<'EOF'
services:

  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_USER: omega
      POSTGRES_PASSWORD: omega_password
      POSTGRES_DB: omega
    volumes:
      - /opt/omega/postgres:/var/lib/postgresql/data

  redis:
    image: redis:7
    restart: unless-stopped
    command: redis-server --appendonly yes
    volumes:
      - /opt/omega/redis:/data

  traefik:
    image: traefik:v3
    restart: unless-stopped
    command:
      - --api.dashboard=true
      - --providers.docker=true
      - --entrypoints.web.address=:80
      - --entrypoints.websecure.address=:443
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
EOF

###############################################################################
# MONITORING
###############################################################################

cat > "${PROJECT}/compose/monitoring/docker-compose.yml" <<'EOF'
services:

  prometheus:
    image: prom/prometheus
    restart: unless-stopped

  grafana:
    image: grafana/grafana
    restart: unless-stopped
    ports:
      - "3000:3000"

  loki:
    image: grafana/loki
    restart: unless-stopped

  node-exporter:
    image: prom/node-exporter
    restart: unless-stopped
EOF

###############################################################################
# AI STACK
###############################################################################

cat > "${PROJECT}/compose/ai/docker-compose.yml" <<'EOF'
services:

  ollama:
    image: ollama/ollama
    restart: unless-stopped
    ports:
      - "11434:11434"
    volumes:
      - /opt/omega/ollama:/root/.ollama

  openwebui:
    image: ghcr.io/open-webui/open-webui:main
    restart: unless-stopped
    ports:
      - "8080:8080"
    environment:
      OLLAMA_BASE_URL: http://ollama:11434
EOF

###############################################################################
# MAKEFILE
###############################################################################

cat > "${PROJECT}/Makefile" <<'EOF'
install:
	sudo ./install.sh

up:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	up -d

down:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	down

logs:
	docker compose \
	-f compose/core/docker-compose.yml \
	-f compose/monitoring/docker-compose.yml \
	-f compose/ai/docker-compose.yml \
	logs -f
EOF

chmod +x "${PROJECT}/install.sh"
chmod +x "${PROJECT}/scripts/"*.sh

echo
echo "Generated:"
echo "${PROJECT}"
echo
echo "Run:"
echo "cd ${PROJECT}"
echo "sudo ./install.sh"
