#!/usr/bin/env bash
echo "[REPAIR] Resetting LangGraph worker and queue"
# Flush redis queue if stagnant and restart worker
docker compose -f ../ai-runtime/compose.yaml exec -T redis redis-cli flushall
docker compose -f ../ai-runtime/compose.yaml restart langgraph-worker
