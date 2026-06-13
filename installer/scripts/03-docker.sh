#!/usr/bin/env bash
set -Eeuo pipefail

curl -fsSL https://get.docker.com | sh

systemctl enable docker
systemctl start docker
