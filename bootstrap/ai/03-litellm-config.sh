#!/usr/bin/env bash
set -Eeuo pipefail
mkdir -p /etc/litellm
cat >/etc/litellm/config.yaml <<'EOF'
model_list:
  - model_name: gpt-oss
    litellm_params:
      model: ollama/gpt-oss:20b
      api_base: http://127.0.0.1:11434
  - model_name: qwen
    litellm_params:
      model: ollama/qwen3:14b
      api_base: http://127.0.0.1:11434
EOF
