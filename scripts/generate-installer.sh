#!/usr/bin/env bash
set -Eeuo pipefail

PROJECT_NAME="${1:-zeaz-platform}"

echo "[*] Generating ${PROJECT_NAME} installer bundle..."

mkdir -p \
  installer/bootstrap \
  installer/installers/postgres \
  installer/installers/redis \
  installer/installers/ollama \
  installer/release

###############################################################################
# MAIN INSTALLER
###############################################################################

cat > installer/install.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_FILE="/tmp/zeaz-install.log"

log() {
  echo "[$(date -u +%FT%TZ)] $*" | tee -a "$LOG_FILE"
}

run_step() {
  local script="$1"

  if [[ ! -f "$script" ]]; then
    log "skip $script"
    return
  fi

  chmod +x "$script"

  log "running $script"

  "$script"
}

run_step "$ROOT_DIR/validate.sh"

for s in \
  "$ROOT_DIR/bootstrap/ubuntu.sh" \
  "$ROOT_DIR/bootstrap/docker.sh" \
  "$ROOT_DIR/bootstrap/node.sh" \
  "$ROOT_DIR/bootstrap/python.sh" \
  "$ROOT_DIR/bootstrap/security.sh"
do
  run_step "$s"
done

for s in \
  "$ROOT_DIR/installers/postgres/install.sh" \
  "$ROOT_DIR/installers/redis/install.sh" \
  "$ROOT_DIR/installers/ollama/install.sh"
do
  run_step "$s"
done

log "completed"
EOF

###############################################################################
# VALIDATOR
###############################################################################

cat > installer/validate.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

source /etc/os-release

[[ "$ID" == "ubuntu" ]] || {
  echo "ubuntu only"
  exit 1
}

echo "validation passed"
EOF

###############################################################################
# UBUNTU
###############################################################################

cat > installer/bootstrap/ubuntu.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt-get update

apt-get install -y \
  curl \
  wget \
  git \
  unzip \
  jq \
  make \
  vim \
  htop \
  ca-certificates \
  software-properties-common
EOF

###############################################################################
# DOCKER
###############################################################################

cat > installer/bootstrap/docker.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

if command -v docker >/dev/null; then
  exit 0
fi

curl -fsSL https://get.docker.com | sh

systemctl enable docker
systemctl start docker
EOF

###############################################################################
# NODE
###############################################################################

cat > installer/bootstrap/node.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

curl -fsSL https://deb.nodesource.com/setup_22.x | bash -

apt-get install -y nodejs
EOF

###############################################################################
# PYTHON
###############################################################################

cat > installer/bootstrap/python.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt-get install -y \
  python3 \
  python3-pip \
  python3-venv
EOF

###############################################################################
# SECURITY
###############################################################################

cat > installer/bootstrap/security.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt-get install -y \
  ufw \
  fail2ban

ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp

ufw --force enable

systemctl enable fail2ban
EOF

###############################################################################
# POSTGRES
###############################################################################

cat > installer/installers/postgres/install.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt-get install -y postgresql

systemctl enable postgresql
systemctl restart postgresql
EOF

###############################################################################
# REDIS
###############################################################################

cat > installer/installers/redis/install.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

apt-get install -y redis-server

systemctl enable redis-server
systemctl restart redis-server
EOF

###############################################################################
# OLLAMA
###############################################################################

cat > installer/installers/ollama/install.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

if command -v ollama >/dev/null; then
  exit 0
fi

curl -fsSL https://ollama.com/install.sh | sh

systemctl enable ollama
systemctl restart ollama

ollama pull llama3
EOF

###############################################################################
# PACKAGE
###############################################################################

cat > installer/release/package.sh <<'EOF'
#!/usr/bin/env bash
set -Eeuo pipefail

VERSION="$(date +%Y%m%d-%H%M%S)"

mkdir -p dist

tar -czf \
  "dist/release-${VERSION}.tar.gz" \
  installer

sha256sum \
  "dist/release-${VERSION}.tar.gz" \
  > "dist/release-${VERSION}.sha256"

echo "done"
EOF

###############################################################################
# MAKEFILE
###############################################################################

cat > Makefile <<'EOF'
.PHONY: install package validate

install:
	sudo ./installer/install.sh

validate:
	sudo ./installer/validate.sh

package:
	./installer/release/package.sh
EOF

###############################################################################
# EXECUTABLE
###############################################################################

find installer -type f -name "*.sh" -exec chmod +x {} \;

echo
echo "[✓] Installer generated"
echo
echo "Run:"
echo "sudo ./installer/install.sh"
echo
