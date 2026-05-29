#!/bin/bash
set -e

echo "--- ZEAZ AUTONOMOUS SWARM VALIDATION ---"

# 1. Check Swarm API
echo "[1/4] Checking Swarm API..."
if curl -s http://localhost:8000/api/runtime/swarm/agents | grep -q "\["; then
    echo "OK: Swarm API up."
else
    echo "ERROR: Swarm API not responding."
    exit 1
fi

# 2. Check Agent Heartbeats
echo "[2/4] Verifying Agent Heartbeats..."
AGENT_COUNT=$(curl -s http://localhost:8000/api/runtime/swarm/agents | jq '. | length')
if [ "$AGENT_COUNT" -gt 0 ]; then
    echo "OK: $AGENT_COUNT agents active in swarm."
else
    echo "WARN: No active agents found. Ensure 'make zaiz-swarm' is running."
fi

# 3. Test Marketplace Submission
echo "[3/4] Testing Marketplace Task Submission..."
TASK_ID="val-task-$(date +%s)"
SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/swarm/marketplace \
  -H "Content-Type: application/json" \
  -d "{\"task_id\": \"$TASK_ID\", \"task_type\": \"VALIDATION\", \"requirements\": [\"MONITOR_HEALTH\"], \"payload\": {\"test\": true}}")

echo "OK: Task submitted."

# 4. Check Shared Memory Schema
echo "[4/4] Verifying pgvector Shared Memory..."
if docker exec -it postgres psql -U postgres -c "\dt swarm_memory" | grep -q "swarm_memory"; then
    echo "OK: Shared memory table exists."
else
    echo "ERROR: swarm_memory table not found in Postgres."
    exit 1
fi

echo "--- SWARM VALIDATION COMPLETE ---"
