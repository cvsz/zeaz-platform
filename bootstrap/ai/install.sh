#!/usr/bin/env bash

set -Eeuo pipefail

trap 'echo "[ERROR] line=$LINENO cmd=$BASH_COMMAND"' ERR

VERSION="2.1.0"

log() {
    printf "\n[ZEAZ-AI] %s\n\n" "$*"
}

require_root() {
    [[ $EUID -eq 0 ]] || {
        echo "Run as root"
        exit 1
    }
}

require_root

# =====================================================
# Detect Environment
# =====================================================

CPU=$(nproc)

RAM_GB=$(
free -g |
awk '/Mem:/ {print $2}'
)

IP=$(
hostname -I |
awk '{print $1}'
)

log "CPU=${CPU}"
log "RAM=${RAM_GB}GB"

# =====================================================
# Docker Heal
# =====================================================

if ! systemctl is-active --quiet docker; then

    log "Healing Docker"

    systemctl enable docker
    systemctl restart docker

fi

docker info >/dev/null

# =====================================================
# Ollama Heal
# =====================================================

if ! systemctl is-active --quiet ollama; then

    log "Healing Ollama"

    systemctl restart ollama

fi

curl -fsS http://127.0.0.1:11434/api/tags >/dev/null

# =====================================================
# Model Heal
# =====================================================

ensure_model() {

    local MODEL="$1"

    if ! ollama list |
        awk '{print $1}' |
        grep -qx "$MODEL"
    then

        log "Pulling ${MODEL}"

        ollama pull "$MODEL"

    fi
}

ensure_model gpt-oss:20b
ensure_model qwen3:14b
ensure_model qwen2.5-coder:14b

# =====================================================
# GPT OSS Optimized Alias
# =====================================================

if ! ollama list |
    grep -q '^gpt-oss:20b-8k'
then

cat >/tmp/gptoss.modelfile <<'EOF'
FROM gpt-oss:20b

PARAMETER num_ctx 8192
PARAMETER temperature 0.7
EOF

ollama create gpt-oss:20b-8k \
-f /tmp/gptoss.modelfile

fi

# =====================================================
# Port Auto Detection
# =====================================================

find_free_port() {

    local PORT="$1"

    while ss -ltn |
        awk '{print $4}' |
        grep -q ":${PORT}$"
    do
        PORT=$((PORT + 1))
    done

    echo "$PORT"
}

OPENWEBUI_PORT=$(find_free_port 3001)

LITELLM_PORT=$(find_free_port 4000)

# =====================================================
# LiteLLM Heal
# =====================================================

mkdir -p /etc/litellm

cat >/etc/litellm/config.yaml <<EOF
model_list:

  - model_name: gpt-oss
    litellm_params:
      model: ollama/gpt-oss:20b-8k
      api_base: http://127.0.0.1:11434

  - model_name: qwen
    litellm_params:
      model: ollama/qwen3:14b
      api_base: http://127.0.0.1:11434

  - model_name: coder
    litellm_params:
      model: ollama/qwen2.5-coder:14b
      api_base: http://127.0.0.1:11434
EOF

if [[ ! -d /opt/litellm ]]; then

    python3 -m venv /opt/litellm

    /opt/litellm/bin/pip install -U pip

    /opt/litellm/bin/pip install "litellm[proxy]"

fi

cat >/etc/systemd/system/litellm.service <<EOF
[Unit]
Description=LiteLLM
After=network.target ollama.service

[Service]
ExecStart=/opt/litellm/bin/litellm \
 --host 0.0.0.0 \
 --port ${LITELLM_PORT} \
 --config /etc/litellm/config.yaml

Restart=always

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable litellm
systemctl restart litellm

# =====================================================
# OpenWebUI Heal
# =====================================================

docker rm -f openwebui >/dev/null 2>&1 || true

docker volume create openwebui-data >/dev/null 2>&1 || true

docker pull ghcr.io/open-webui/open-webui:main

docker run -d \
 --name openwebui \
 --restart unless-stopped \
 -p ${OPENWEBUI_PORT}:8080 \
 -e WEBUI_AUTH=False \
 -v openwebui-data:/app/backend/data \
 ghcr.io/open-webui/open-webui:main

# =====================================================
# Health Check
# =====================================================

sleep 15

curl -fsS http://127.0.0.1:11434/api/tags >/dev/null

curl -fsS http://127.0.0.1:${LITELLM_PORT}/v1/models >/dev/null

docker ps | grep openwebui >/dev/null

# =====================================================
# Summary
# =====================================================

cat <<EOF

======================================================
ZEAZ AI MASTER OMEGA ULTIMATE READY
======================================================

Host IP      : ${IP}

OpenWebUI    : http://${IP}:${OPENWEBUI_PORT}

LiteLLM      : http://${IP}:${LITELLM_PORT}

Ollama       : http://${IP}:11434

Models:

$(ollama list)

======================================================
EOF
