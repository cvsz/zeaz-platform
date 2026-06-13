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
