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
