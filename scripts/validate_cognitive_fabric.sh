#!/bin/bash
set -e

echo "--- ZEAZ COGNITIVE FABRIC V2 VALIDATION ---"

# 1. Check ADC and Environment
echo "[1/5] Checking Google Application Default Credentials..."
if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ] && [ ! -f "$HOME/.config/gcloud/application_default_credentials.json" ]; then
    echo "WARN: ADC not found. Vertex AI may fail."
else
    echo "OK: ADC found."
fi

# 2. Check API Health
echo "[2/5] Checking API Gateway Health..."
if curl -s http://localhost:8000/api/runtime/llm/health | grep -q "vertex-ai"; then
    echo "OK: API Gateway up and provider registered."
else
    echo "ERROR: API Gateway or provider not found."
    exit 1
fi

# 3. Test Inference (Gemini 2.5)
echo "[3/5] Testing Gemini 2.5 Inference..."
RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/llm/completion \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Hello Zeaz Meta OS", "tenant_id": "val-test"}')

if echo "$RESPONSE" | grep -q "text"; then
    echo "OK: Inference successful."
else
    echo "ERROR: Inference failed: $RESPONSE"
    exit 1
fi

# 4. Validate Token Accounting
echo "[4/5] Validating Token Budget Engine..."
if curl -s http://localhost:8000/api/runtime/llm/metrics | grep -q "val-test"; then
    echo "OK: Usage recorded correctly."
else
    echo "ERROR: Usage not found in metrics."
    exit 1
fi

# 5. Check State Machine Transitions
echo "[5/5] Checking Provider State Machine..."
if curl -s http://localhost:8000/api/runtime/llm/health | grep -q "\"state\": \"HEALTHY\""; then
    echo "OK: Provider is in HEALTHY state."
else
    echo "WARN: Provider is not HEALTHY."
fi

echo "--- VALIDATION COMPLETE ---"
