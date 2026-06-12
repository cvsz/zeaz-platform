# ZEAZ Omega Migration Guide

## From Vanilla OpenWork to ZEAZ Omega

### Step 1: Verify Current State

```bash
# Ensure OpenWork is running
cd /home/zeazdev/zeaz-platform/apps/openwork
make status

# Check Node.js version
node --version  # Must be 20+

# Check pnpm version
pnpm --version  # Must be 9+
```

### Step 2: Install ZEAZ Extension

```bash
# Navigate to ZEAZ
cd apps/openwork/zeaz

# Install dependencies
pnpm install

# Verify the installation
pnpm typecheck

# Run tests
pnpm test
pnpm test:coverage
```

### Step 3: Configure Environment

```bash
# Copy environment template if needed
cp .env.example .env

# Set LLM API keys
export ANTHROPIC_API_KEY=sk-...
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...

# Set ZEAZ configuration
export ZEAZ_LOG_LEVEL=info
export ZEAZ_ENABLE_HEALTH_CHECKS=true
```

### Step 4: Integration Points

#### With OpenWork Den API
```
den-api routes → ZEAZ LLM Router for inference
den-web dashboard → ZEAZ status endpoint for monitoring
```

#### With ZEAZ Platform Runtime
```
runtime/self_healing_runtime.py → RuntimeAdapter
runtime/policy_engine.py → Policy validation in agent execution
runtime/event_bus.py → Workflow event publishing
```

### Step 5: Start ZEAZ

```bash
# Development mode
pnpm dev

# Or with Docker
docker compose -f installer/docker-compose.yml up -d
```

### Step 6: Verify Integration

```bash
# Check system status
curl http://localhost:8799/health

# Execute test task
# (via bootstrap.ts or API)

# Check LLM routing
# (via routeLLM method)
```

## Breaking Changes

**None.** ZEAZ is a fully additive extension:

| Area | Change | Impact |
|------|--------|--------|
| OpenWork core | Unmodified | None |
| pnpm workspace | New zeaz/ entry | Only if explicitly added |
| API ports | New: 8799 | No overlap with OpenWork |
| Environment | New ZEAZ_* vars | Optional |
| Dependencies | New @zeaz/* packages | Isolated in zeaz/ |

## Feature Comparison

| Feature | OpenWork | OpenWork + ZEAZ |
|---------|----------|-----------------|
| LLM Routing | Static | Multi-provider with fallback |
| Agent System | - | 9 specialized agents |
| MCP Providers | Built-in | 10+ extensible providers |
| Memory | Session-only | Persistent, tag-indexed |
| Workflows | - | 5 autonomous workflows |
| Cost Optimization | - | Per-request token budgeting |
| Health Monitoring | Basic | Provider-level health checks |
| Autonomous Ops | - | Self-healing runtime integration |

## Troubleshooting

### ZEAZ won't start
```bash
# Check Node version
node -e "console.log(process.version)"

# Verify dependencies
cd apps/openwork/zeaz && pnpm install --frozen-lockfile

# Check TypeScript compilation
pnpm typecheck
```

### LLM routing fails
```bash
# Check API keys are set
echo "ANTHROPIC_API_KEY: ${ANTHROPIC_API_KEY:+set}"
echo "OPENAI_API_KEY: ${OPENAI_API_KEY:+set}"

# Test provider health
# (via LLMRouter.getStatus())
```

### MCP tools not found
```bash
# List registered providers
# (via MCPServer.listProviders())

# Search for specific tool
# (via MCPServer.searchTools())
```
