# ZEAZ Omega Rollback Plan

## Rollback Strategy

ZEAZ Omega is designed as an **additive extension** to OpenWork. Rolling back means removing the ZEAZ layer while preserving the unchanged OpenWork core.

## Rollback Scenarios

### Scenario 1: Full Removal

```bash
# 1. Stop ZEAZ services
docker compose -f apps/openwork/zeaz/installer/docker-compose.yml down

# 2. Remove ZEAZ workspace from pnpm-workspace.yaml
# Edit pnpm-workspace.yaml to remove zeaz/ entry

# 3. Remove ZEAZ directory
rm -rf apps/openwork/zeaz/

# 4. Remove ZEAZ environment references
# Check .env, .env.example for ZEAZ_* variables

# 5. Restart OpenWork
cd apps/openwork
pnpm install
```

### Scenario 2: Disable Only (Keep Code)

```typescript
// In bootstrap.ts - simply don't call zeaz.init()
// Or wrap in feature flag
const zeazEnabled = process.env.ZEAZ_ENABLED === 'true'
if (zeazEnabled) {
  await zeaz.init()
}
```

### Scenario 3: Per-Component Rollback

```typescript
// Disable specific components in orchestrator
const config = {
  agents: false,      // Skip agent registration
  llmRouter: true,    // Keep LLM routing
  mcpServer: true,    // Keep MCP marketplace
  memory: true,       // Keep memory system
  workflows: false,   // Skip workflows
}
```

## Data Migration Plan

### Memory Data
- ZEAZ memory is in-memory (ephemeral)
- No persistent data migration needed
- If Redis-backed: `docker volume rm zeaz_redis_data`

### Workflow State
- Workflow executions are ephemeral
- In-progress executions will fail on rollback
- Drain before rollback: wait for active=0

## Rollback Verification

After rollback, verify:

```bash
# 1. OpenWork still runs
cd apps/openwork && pnpm dev

# 2. No ZEAZ dependencies in lockfile
grep -r "zeaz" pnpm-lock.yaml || echo "No ZEAZ deps found"

# 3. OpenWork tests still pass
pnpm test:health

# 4. Core OpenWork functionality works
curl http://localhost:8790/health
```

## Recovery Time Objectives

| Component | Rollback Time | Data Loss |
|-----------|--------------|-----------|
| Full ZEAZ removal | < 5 minutes | None (ephemeral) |
| Disable only | < 1 minute | None |
| Workflows only | < 2 minutes | In-progress workflows |
| MCP providers | < 1 minute | Invocation logs |

## Rollback Safety

1. **Zero changes to OpenWork core**: No OpenWork files were modified
2. **No database migrations**: ZEAZ uses in-memory or Redis (no schema changes)
3. **No port conflicts**: ZEAZ uses port 8799 (not in OpenWork's range)
4. **No dependency conflicts**: ZEAZ has minimal, standard dependencies
5. **Graceful shutdown**: SIGINT/SIGTERM handlers in bootstrap.ts
