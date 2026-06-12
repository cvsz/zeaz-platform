# ZEAZ Omega Deployment

## Prerequisites

- Node.js 20+
- pnpm 9+
- Docker & Docker Compose (for containerized deployment)
- Access to LLM API keys (ANTHROPIC_API_KEY, OPENAI_API_KEY, GEMINI_API_KEY, etc.)

## Quick Start

```bash
# 1. Navigate to ZEAZ extension
cd apps/openwork/zeaz

# 2. Install dependencies
pnpm install

# 3. Start development mode
pnpm dev

# 4. Run tests
pnpm test
pnpm test:coverage
```

## Production Deployment

### Option A: Docker Compose (Recommended)

```bash
# Start all services
docker compose -f installer/docker-compose.yml up -d

# Check health
curl http://localhost:8799/health

# View logs
docker compose -f installer/docker-compose.yml logs -f
```

### Option B: Manual Deployment

```bash
# Build
pnpm build

# Set environment variables
export ANTHROPIC_API_KEY=sk-...
export OPENAI_API_KEY=sk-...
export GEMINI_API_KEY=...

# Start
node dist/index.js
```

### Option C: Integration with OpenWork

```bash
# From OpenWork root
cd apps/openwork

# Add zeaz workspace to pnpm workspace
echo 'packages:
  - "zeaz/*"' >> pnpm-workspace.yaml

# Install
cd zeaz && pnpm install
```

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `ANTHROPIC_API_KEY` | No | - | Claude API key |
| `OPENAI_API_KEY` | No | - | GPT-5 API key |
| `GEMINI_API_KEY` | No | - | Gemini API key |
| `DEEPSEEK_API_KEY` | No | - | DeepSeek API key |
| `QWEN_API_KEY` | No | - | Qwen API key |
| `OLLAMA_BASE_URL` | No | http://localhost:11434 | Ollama endpoint |
| `ZEAZ_LOG_LEVEL` | No | info | Log level (debug/info/warn/error) |
| `ZEAZ_ENABLE_HEALTH_CHECKS` | No | true | Enable LLM provider health checks |
| `ZEAZ_AUTO_SYNC_MCP` | No | true | Auto-sync MCP marketplace |

## Deployment Architecture

```
                  ┌─────────────┐
                  │  Load       │
                  │  Balancer   │
                  └──────┬──────┘
                         │
          ┌──────────────┼──────────────┐
          │              │              │
   ┌──────┴──────┐ ┌────┴──────┐ ┌────┴──────┐
   │  ZEAZ       │ │  ZEAZ     │ │  ZEAZ     │
   │  Instance 1 │ │  Instance2│ │  Instance3│
   └──────┬──────┘ └────┬──────┘ └────┬──────┘
          │              │              │
          └──────────────┼──────────────┘
                         │
          ┌──────────────┴──────────────┐
          │         Redis               │
          │       (Shared State)        │
          └──────────────┬──────────────┘
                         │
          ┌──────────────┴──────────────┐
          │      PostgreSQL             │
          │     (Persistence)           │
          └─────────────────────────────┘
```

## Health Check Endpoint

```json
GET /health
{
  "status": "healthy",
  "agents": 9,
  "llmProviders": 6,
  "mcpProviders": 10,
  "activeTasks": 0,
  "memorySize": 42,
  "workflows": 5,
  "runtimeConnected": true
}
```
