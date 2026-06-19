#!/bin/bash
set -e

echo "--- ZEAZ COGNITIVE SCHEDULER VALIDATION ---"

# 1. Check API
echo "[1/4] Checking Scheduler API..."
if curl -s http://localhost:8000/api/runtime/scheduler/topology/health | grep -q "{}"; then
    echo "OK: Scheduler API up."
else
    echo "ERROR: Scheduler API not responding correctly."
    exit 1
fi

# 2. Submit Task
echo "[2/4] Submitting Test Task..."
TASK_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/scheduler/tasks \
  -H "Content-Type: application/json" \
  -d '{"action_type": "VALIDATION", "tenant_id": "val-test"}')

TASK_ID=$(echo "$TASK_RESPONSE" | jq -r .task_id)

if [ "$TASK_ID" != "null" ]; then
    echo "OK: Task submitted with ID $TASK_ID"
else
    echo "ERROR: Task submission failed: $TASK_RESPONSE"
    exit 1
fi

# 3. Check Lineage (Journaling)
echo "[3/4] Verifying Execution Journal (Lineage)..."
sleep 1
LINEAGE=$(curl -s http://localhost:8000/api/runtime/scheduler/tasks/$TASK_ID/lineage)

if echo "$LINEAGE" | grep -q "SUBMIT"; then
    echo "OK: Submission journaled."
else
    echo "ERROR: Submission not found in journal."
    exit 1
fi

# 4. Topology Snapshot Update
echo "[4/4] Testing Topology Snapshot Update..."
UPDATE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/scheduler/topology/snapshot \
  -H "Content-Type: application/json" \
  -d '{"provider_id": "vertex-ai", "current_load": 0.5, "active_tasks": 10, "queue_depth": 5, "latency_ms": 120}')

if echo "$UPDATE_RESPONSE" | grep -q "UPDATED"; then
    echo "OK: Snapshot updated."
else
    echo "ERROR: Snapshot update failed."
    exit 1
fi

echo "--- SCHEDULER VALIDATION COMPLETE ---"
