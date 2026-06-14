#!/usr/bin/env bash
# Generic agent runner script
AGENT_NAME=$1
shift
TASK=$@

echo "Executing agent: $AGENT_NAME"
echo "Task: $TASK"

# Here we can add logic to route to specific app-level runtimes
# For now, it provides a hook point to integrate with ai-factory core
./apps/zai-factory/bin/ai-factory.js --agent "$AGENT_NAME" "$TASK"
