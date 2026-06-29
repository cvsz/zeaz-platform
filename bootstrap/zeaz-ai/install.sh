#!/usr/bin/env bash
set -Eeuo pipefail

echo '[ZEAZ] Verifying Docker'
command -v docker >/dev/null

echo '[ZEAZ] Verifying Ollama'
command -v ollama >/dev/null

ollama pull gpt-oss:20b || true
ollama pull qwen3:14b || true
ollama pull qwen2.5-coder:14b || true

echo '[ZEAZ] Bootstrap complete'
