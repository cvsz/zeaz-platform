#!/usr/bin/env bash
set -Eeuo pipefail

# ============================================================
# TFC Agent Native ZERO-DOCKER Installer
#
# No Docker commands.
# No heredoc.
# No command substitution.
# No backticks.
#
# Required:
#   export TFC_AGENT_TOKEN="YOUR_AGENT_POOL_TOKEN"
#
# Optional:
#   export TFC_AGENT_NAME="zeaz-platform-agent-01"
#   export TFC_AGENT_VERSION="1.28.12"
#   export TFC_AGENT_AUTO_UPDATE="minor"
#   export TFC_AGENT_LOG_LEVEL="info"
#   export TFC_ADDRESS="https://app.terraform.io"
# ============================================================

if [ -z "${TFC_AGENT_TOKEN:-}" ]; then
  echo "ERROR: Missing TFC_AGENT_TOKEN"
  echo "Run first:"
  echo "  export TFC_AGENT_TOKEN='YOUR_AGENT_POOL_TOKEN'"
  exit 1
fi

TFC_AGENT_VERSION="${TFC_AGENT_VERSION:-1.28.12}"
TFC_AGENT_NAME="${TFC_AGENT_NAME:-zeaz-platform-agent-01}"
TFC_AGENT_AUTO_UPDATE="${TFC_AGENT_AUTO_UPDATE:-minor}"
TFC_AGENT_LOG_LEVEL="${TFC_AGENT_LOG_LEVEL:-info}"
TFC_ADDRESS="${TFC_ADDRESS:-https://app.terraform.io}"

INSTALL_DIR="/opt/tfc-agent"
STATE_DIR="/var/lib/tfc-agent"
CONFIG_DIR="/etc/tfc-agent"
ENV_FILE="/etc/tfc-agent/tfc-agent.env"
SERVICE_FILE="/etc/systemd/system/tfc-agent.service"
TMP_DIR="/tmp/tfc-agent-zero-docker"
ZIP_FILE="tfc-agent_${TFC_AGENT_VERSION}_linux_amd64.zip"
SUM_FILE="tfc-agent_${TFC_AGENT_VERSION}_SHA256SUMS"
ZIP_URL="https://releases.hashicorp.com/tfc-agent/${TFC_AGENT_VERSION}/${ZIP_FILE}"
SUM_URL="https://releases.hashicorp.com/tfc-agent/${TFC_AGENT_VERSION}/${SUM_FILE}"

echo "==> Install packages"
sudo apt-get update
sudo apt-get install -y curl unzip ca-certificates
sudo update-ca-certificates

echo "==> Create tfc-agent user"
if id tfc-agent >/dev/null 2>&1; then
  echo "User tfc-agent already exists"
else
  sudo useradd --system --home-dir "${STATE_DIR}" --create-home --shell /usr/sbin/nologin tfc-agent
fi

echo "==> Create directories"
sudo install -d -o tfc-agent -g tfc-agent -m 0755 "${INSTALL_DIR}"
sudo install -d -o tfc-agent -g tfc-agent -m 0750 "${STATE_DIR}"
sudo install -d -o root -g root -m 0755 "${CONFIG_DIR}"

echo "==> Prepare temp directory"
rm -rf "${TMP_DIR}"
mkdir -p "${TMP_DIR}"

echo "==> Download TFC Agent"
curl -fsSL -o "${TMP_DIR}/${ZIP_FILE}" "${ZIP_URL}"
curl -fsSL -o "${TMP_DIR}/${SUM_FILE}" "${SUM_URL}"

echo "==> Verify checksum"
grep "${ZIP_FILE}" "${TMP_DIR}/${SUM_FILE}" > "${TMP_DIR}/SHA256SUMS.filtered"
cd "${TMP_DIR}"
sha256sum -c SHA256SUMS.filtered

echo "==> Extract"
unzip -o "${ZIP_FILE}"

echo "==> Install binaries"
sudo install -o tfc-agent -g tfc-agent -m 0755 tfc-agent "${INSTALL_DIR}/tfc-agent"
sudo install -o tfc-agent -g tfc-agent -m 0755 tfc-agent-core "${INSTALL_DIR}/tfc-agent-core"

echo "==> Write environment file"
ENV_TMP="${TMP_DIR}/tfc-agent.env"
: > "${ENV_TMP}"
printf '%s\n' "TFC_AGENT_TOKEN=${TFC_AGENT_TOKEN}" >> "${ENV_TMP}"
printf '%s\n' "TFC_AGENT_NAME=${TFC_AGENT_NAME}" >> "${ENV_TMP}"
printf '%s\n' "TFC_AGENT_AUTO_UPDATE=${TFC_AGENT_AUTO_UPDATE}" >> "${ENV_TMP}"
printf '%s\n' "TFC_AGENT_LOG_LEVEL=${TFC_AGENT_LOG_LEVEL}" >> "${ENV_TMP}"
printf '%s\n' "TFC_ADDRESS=${TFC_ADDRESS}" >> "${ENV_TMP}"
sudo install -o root -g root -m 0600 "${ENV_TMP}" "${ENV_FILE}"

echo "==> Write systemd service"
SERVICE_TMP="${TMP_DIR}/tfc-agent.service"
: > "${SERVICE_TMP}"
printf '%s\n' "[Unit]" >> "${SERVICE_TMP}"
printf '%s\n' "Description=HCP Terraform Agent" >> "${SERVICE_TMP}"
printf '%s\n' "After=network-online.target" >> "${SERVICE_TMP}"
printf '%s\n' "Wants=network-online.target" >> "${SERVICE_TMP}"
printf '%s\n' "" >> "${SERVICE_TMP}"
printf '%s\n' "[Service]" >> "${SERVICE_TMP}"
printf '%s\n' "Type=simple" >> "${SERVICE_TMP}"
printf '%s\n' "User=tfc-agent" >> "${SERVICE_TMP}"
printf '%s\n' "Group=tfc-agent" >> "${SERVICE_TMP}"
printf '%s\n' "WorkingDirectory=/var/lib/tfc-agent" >> "${SERVICE_TMP}"
printf '%s\n' "EnvironmentFile=/etc/tfc-agent/tfc-agent.env" >> "${SERVICE_TMP}"
printf '%s\n' "ExecStart=/opt/tfc-agent/tfc-agent" >> "${SERVICE_TMP}"
printf '%s\n' "Restart=always" >> "${SERVICE_TMP}"
printf '%s\n' "RestartSec=10" >> "${SERVICE_TMP}"
printf '%s\n' "KillSignal=SIGTERM" >> "${SERVICE_TMP}"
printf '%s\n' "TimeoutStopSec=300" >> "${SERVICE_TMP}"
printf '%s\n' "NoNewPrivileges=true" >> "${SERVICE_TMP}"
printf '%s\n' "PrivateTmp=true" >> "${SERVICE_TMP}"
printf '%s\n' "" >> "${SERVICE_TMP}"
printf '%s\n' "[Install]" >> "${SERVICE_TMP}"
printf '%s\n' "WantedBy=multi-user.target" >> "${SERVICE_TMP}"
sudo install -o root -g root -m 0644 "${SERVICE_TMP}" "${SERVICE_FILE}"

echo "==> Enable and start systemd service"
sudo systemctl daemon-reload
sudo systemctl enable tfc-agent.service
sudo systemctl restart tfc-agent.service

echo "==> Status"
sudo systemctl --no-pager --full status tfc-agent.service || true

echo ""
echo "DONE: TFC Agent is installed without Docker."
echo ""
echo "Logs:"
echo "  sudo journalctl -u tfc-agent -f"
echo ""
echo "Status:"
echo "  sudo systemctl status tfc-agent --no-pager"
