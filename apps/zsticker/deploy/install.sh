#!/bin/bash
# install.sh - Automated Deployment Script for Ubuntu 22.04 VPS
set -e

echo "=== System Update ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== Installing Docker & Docker Compose ==="
if ! command -v docker &> /dev/null; then
    sudo apt-get install -y ca-certificates curl gnupg
    sudo install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    sudo chmod a+r /etc/apt/keyrings/docker.gpg
    
    echo \
      "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
      "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | \
      sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
      
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
else
    echo "Docker is already installed."
fi

echo "=== Setting up Systemd Service ==="
# Assuming the repo is cloned in /opt/zsticker
REPO_DIR="/opt/zsticker"

if [ ! -d "$REPO_DIR" ]; then
    echo "Warning: $REPO_DIR does not exist. Please clone the repository there."
else
    sudo cp $REPO_DIR/deploy/line-sticker.service /etc/systemd/system/
    sudo systemctl daemon-reload
    sudo systemctl enable line-sticker
    echo "Service installed and enabled!"
fi

echo "=== Installation Complete ==="
echo "1. Clone your repo to /opt/zsticker if you haven't already."
echo "2. Copy your .env and credentials.json into the directory."
echo "3. Run 'sudo systemctl start line-sticker' to launch the bot."
