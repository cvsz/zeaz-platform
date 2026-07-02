#!/usr/bin/env bash

set -euo pipefail

# Configuration Defaults
PROXY_PORT=4000
CONFIG_DIR="${HOME}/.config/gemini-local"
VENV_DIR="${CONFIG_DIR}/venv"
LITELLM_BIN="${VENV_DIR}/bin/litellm"
ENV_FILE="${CONFIG_DIR}/env.sh"
LITELLM_CONFIG="${CONFIG_DIR}/config.yaml"

printf "==================================================\n"
printf " Gemini Local Connection Installer (v3 - Proxy Fix) \n"
printf "==================================================\n\n"

# 1. Ensure configuration directory exists
mkdir -p "$CONFIG_DIR"

# 2. Check for Ollama presence
printf "[*] Checking local Ollama service...\n"
if ! curl -s http://localhost:11434/api/tags > /dev/null; then
    printf "[ERROR] Ollama is not running on http://localhost:11434\n"
    printf "Please start Ollama and try again.\n"
    exit 1
fi

# 3. Retrieve and parse local models
printf "[*] Fetching available local models...\n"
AVAILABLE_MODELS=$(curl -s http://localhost:11434/api/tags | grep -o '"name":"[^"]*' | grep -o '[^"]*$' || true)

if [ -z "$AVAILABLE_MODELS" ]; then
    printf "[ERROR] No models found in Ollama. Run 'ollama run <model>' first.\n"
    exit 1
fi

printf "\nAvailable local models:\n"
select LOCAL_MODEL in $AVAILABLE_MODELS; do
    if [ -n "$LOCAL_MODEL" ]; then
        printf "[*] Selected model: %s\n" "$LOCAL_MODEL"
        break
    fi
done

# 4. Install LiteLLM proxy layer inside an isolated venv
printf "\n[*] Verifying LiteLLM installation...\n"
if [ ! -f "$LITELLM_BIN" ]; then
    printf "[*] LiteLLM not found. Setting up isolated Python venv...\n"
    
    if ! python3 -m venv --help > /dev/null 2>&1; then
        printf "[ERROR] The 'venv' module is missing.\n"
        printf "Please run: sudo apt install python3-venv (or python3.12-venv)\n"
        exit 1
    fi

    python3 -m venv "$VENV_DIR"
    printf "[*] Installing LiteLLM proxy into virtual environment...\n"
    "$VENV_DIR/bin/pip" install --quiet 'litellm[proxy]'
else
    printf "[*] LiteLLM is already installed in the virtual environment. Ensuring proxy dependencies...\n"
    "$VENV_DIR/bin/pip" install --quiet 'litellm[proxy]'
fi

# 5. Generate LiteLLM configuration mapping Gemini models to the local model
printf "[*] Generating LiteLLM configuration at %s...\n" "$LITELLM_CONFIG"
cat << EOF > "$LITELLM_CONFIG"
model_list:
  - model_name: ${LOCAL_MODEL}
    litellm_params:
      model: ollama/${LOCAL_MODEL}

model_group_alias:
  "gemini-2.5-flash-lite": "${LOCAL_MODEL}"
  "gemini-3.5-flash": "${LOCAL_MODEL}"
  "gemini-3-flash-preview": "${LOCAL_MODEL}"
EOF

# 6. Generate Environment Wrapper script
printf "[*] Creating environment entrypoint wrapper at %s...\n" "$ENV_FILE"
cat << EOF > "$ENV_FILE"
#!/usr/bin/env bash
export GOOGLE_GEMINI_BASE_URL="http://localhost:${PROXY_PORT}"
export GEMINI_API_KEY="sk-local-sovereign-identity-key"
printf "[*] Environment variables loaded. Redirecting Gemini SDK traffic to local proxy.\n"
EOF

chmod +x "$ENV_FILE"

# 7. Generate execution controller script
LAUNCHER="${HOME}/.local/bin/gemini-local-proxy"
mkdir -p "$(dirname "$LAUNCHER")"

printf "[*] Creating background service controller at %s...\n" "$LAUNCHER"
cat << EOF > "$LAUNCHER"
#!/usr/bin/env bash
set -e
printf "[*] Starting LiteLLM Proxy on port ${PROXY_PORT} using local model: ${LOCAL_MODEL}...\n"
exec "${LITELLM_BIN}" --config "${LITELLM_CONFIG}" --port ${PROXY_PORT} --host 127.0.0.1
EOF

chmod +x "$LAUNCHER"

printf "\n==================================================\n"
printf " Setup Completed Successfully!\n"
printf "==================================================\n"
printf "To launch the proxy backend service, run:\n"
printf "  %s\n\n" "$LAUNCHER"
printf "To inject the configuration into your current shell session:\n"
printf "  source %s\n" "$ENV_FILE"
printf "==================================================\n"
