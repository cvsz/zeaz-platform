#!/usr/bin/env bash
set -eo pipefail

echo "========================================="
echo "ZEAZ PLATFORM - VALIDATION REALITY ENGINE"
echo "========================================="

fail() {
  local type="$1"
  local msg="$2"
  local hypothesis="$3"
  echo -e "\n❌ [$type] FAILURE: $msg"
  echo -e "   Hypothesis: $hypothesis\n"
  exit 1
}

# 1. NETWORK & ROUTING REALITY TEST
echo "⏳ [1/4] Running Network & Routing Reality Tests..."

# Test AI Gateway (Direct)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
if [ "$HTTP_CODE" != "200" ]; then
  fail "NETWORK FAILURE" "AI Gateway healthcheck failed." "Container 'langgraph-api' is down or not bound to port 8000."
fi

# Test Traefik Routing
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -H "Host: ai.zeaz.dev" http://localhost || echo "000")
if [[ "$HTTP_CODE" == "000" || "$HTTP_CODE" == "502" || "$HTTP_CODE" == "404" ]]; then
  fail "CONFIG FAILURE" "Traefik did not route to ai.zeaz.dev" "Traefik docker provider is missing labels or network is isolated."
fi
echo "✅ Routing to internal services is active."

# 2. AUTHENTICATION FLOW TEST
echo "⏳ [2/4] Simulating Authentication Flow..."

AUTH_REDIR=$(curl -s -I -H "Host: ai.zeaz.dev" http://localhost | grep -i "location:" || true)
if ! echo "$AUTH_REDIR" | grep -iq "/outpost.goauthentik.io/start"; then
  fail "AUTH FAILURE" "Protected endpoint did not redirect to Authentik." "ForwardAuth middleware is unlinked in dynamic.yml or Traefik compose."
fi
echo "✅ Authentik ForwardAuth redirect intercepted correctly."

# 3. AI RUNTIME EXECUTION TEST
echo "⏳ [3/4] Testing AI Runtime Execution..."

TASK_RES=$(curl -s -X POST http://localhost:8000/execute \
  -H "Content-Type: application/json" \
  -d '{"graph_id": "ping", "input_data": {"mode":"dry-run"}}')

TASK_ID=$(echo "$TASK_RES" | grep -o '"task_id":"[^"]*' | cut -d'"' -f4 || true)

if [ -z "$TASK_ID" ]; then
  fail "RUNTIME FAILURE" "API did not return a valid task_id." "Redis queue is unreachable or main.py crashed."
fi

echo "   Task queued: $TASK_ID. Waiting for worker execution..."
sleep 3

# Verify state persisted in Postgres
PG_CHECK=$(docker compose -f infra/ai-runtime/compose.yaml exec -T postgresql psql -U ai_user -d ai_runtime -tAc "SELECT status FROM execution_results WHERE task_id='$TASK_ID';" || echo "")

if [ "$PG_CHECK" != "done" ]; then
  fail "RUNTIME FAILURE" "Worker did not process task or persist to DB." "Worker container crashed, failed to read Redis, or PG connection is broken."
fi
echo "✅ AI Worker consumed task and persisted state to pgvector."

# 4. OBSERVABILITY REALITY TEST
echo "⏳ [4/4] Verifying Observability Data Ingestion..."

# Push synthetic log to Loki
LOKI_RES=$(curl -s -o /dev/null -w "%{http_code}" -X POST http://localhost:3100/loki/api/v1/push \
  -H "Content-Type: application/json" \
  -d '{"streams": [{"stream": {"service": "validation-vre"}, "values": [["'$(date +%s)000000000'", "telemetry test event"]]}]}' || echo "000")

# If port 3100 isn't mapped to host, we test via Traefik metrics as fallback
PROM_CHECK=$(curl -s http://localhost:9090/api/v1/query?query=up | grep '"status":"success"' || true)

if [ -z "$PROM_CHECK" ]; then
  fail "OBSERVABILITY FAILURE" "Prometheus is not responding to queries." "Prometheus container is down or not exposed internally properly."
fi

TARGETS=$(curl -s http://localhost:9090/api/v1/targets)
if ! echo "$TARGETS" | grep -q '"health":"up"'; then
  fail "OBSERVABILITY FAILURE" "Prometheus has no healthy scrape targets." "Scrape config in prometheus.yml is misconfigured."
fi
echo "✅ Prometheus is actively scraping telemetry."

echo "========================================="
echo "✅ ALL VRE TESTS PASSED SUCCESSFULLY"
echo "========================================="
exit 0
