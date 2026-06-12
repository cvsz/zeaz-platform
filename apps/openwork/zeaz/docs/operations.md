# ZEAZ Omega Operations Guide

## Monitoring

### Key Metrics

| Metric | Description | Health Threshold |
|--------|-------------|-----------------|
| `agents.active` | Number of busy agents | < 5 |
| `llm.latency_p50` | P50 LLM response time | < 2000ms |
| `llm.error_rate` | LLM provider error rate | < 5% |
| `mcp.invocations` | MCP tool calls per minute | < 1000 |
| `memory.size` | Memory store entry count | < 10000 |
| `workflows.failed` | Failed workflow executions | < 1% |

### Logs

```bash
# View ZEAZ logs
docker compose -f installer/docker-compose.yml logs -f zeaz-orchestrator

# View LLM routing logs
docker compose -f installer/docker-compose.yml logs -f zeaz-orchestrator | grep LLMRouter

# View agent execution logs
docker compose -f installer/docker-compose.yml logs -f zeaz-orchestrator | grep "AgentRegistry"
```

## LLM Provider Management

```typescript
// Check provider health
const status = orchestrator.llmRouter.getStatus()
// Returns: [{ providerId: 'claude', status: 'healthy', latencyMs: 1200 }, ...]

// Route with specific provider
const route = await orchestrator.llmRouter.route({
  messages: [...],
  preferredProvider: 'claude',
  maxCost: 0.001,
})
```

## MCP Provider Management

```typescript
// List all providers
const providers = mcpServer.listProviders()

// Search tools
const tools = mcpServer.searchTools('deploy')

// Invoke tool
const result = await mcpServer.invokeTool('cloudflare', 'deploy_worker', {
  name: 'my-worker',
  code: 'export default { fetch() { ... } }',
})

// View invocation history
const history = mcpServer.getInvocations(10)
```

## Workflow Operations

```bash
# List registered workflows
curl http://localhost:8799/workflows

# Execute a workflow
curl -X POST http://localhost:8799/workflows/security-audit/execute

# Check execution status
curl http://localhost:8799/executions/{executionId}
```

## Memory Management

```typescript
// Query memory with prefix
const sessions = await memory.query({
  prefix: 'session',
  limit: 100,
  sortBy: 'timestamp',
  ascending: false,
})

// Get memory stats
const stats = await memory.getStats()
// Returns: { totalEntries, totalSizeBytes, topTags, ... }

// Set with TTL (1 hour)
await memory.set('temp-key', data, ['temp'], 3600000)
```

## Scaling

### Horizontal Scaling
- Deploy multiple ZEAZ instances behind a load balancer
- Share state via Redis (configured in docker-compose.yml)
- Each instance is stateless for agent execution

### Vertical Scaling
- Increase `maxAgents` for parallel execution capacity
- Adjust LLM provider rate limits
- Increase Redis connection pool size

## Backup and Recovery

```bash
# Backup ZEAZ memory
docker exec zeaz-redis redis-cli SAVE
cp /var/lib/docker/volumes/zeaz-redis-data/_data/dump.rdb /backup/

# Restore
cp /backup/dump.rdb /var/lib/docker/volumes/zeaz-redis-data/_data/
docker restart zeaz-redis
```
