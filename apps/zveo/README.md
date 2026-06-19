# zveo — AI Video Generation Platform

`apps/zveo` is the ZeaZ AI/video service platform for AI-powered content generation, rendering, and publishing workflows.

## Stack

- **Frontend**: Next.js 15 dashboard at port `3018` (dashboard app, hosted at `zveo.zeaz.dev`)
- **API Gateway**: Express API server at port `8080` (routes to provider adapters)
- **Render Workers**: Node.js workers for distributed video rendering (2 replicas)
- **Database**: PostgreSQL 16 (`zveo` database)
- **Cache**: Redis 7-Alpine
- **Storage**: MinIO (S3-compatible, `zveo-renders` bucket)
- **Monitoring**: Prometheus + Grafana
- **Auth**: Shared secret-based auth between services

## Services

| Service | Port | Container |
|---------|------|-----------|
| api-gateway | 8085 | API routing and orchestration |
| render-worker | — | Distributed render jobs (2 replicas) |
| dashboard | 3018 | Next.js UI (hosted at `zveo.zeaz.dev`) |
| postgres | 5436 | Primary database |
| redis | 6382 | Job queue and cache |
| minio | 9005 | S3-compatible object storage |
| prometheus | 9095 | Metrics collection |
| grafana | 3019 | Dashboard visualization |

## Development

```bash
# Start backing services
docker compose --profile node up -d postgres redis minio

# Run database migrations
docker compose --profile node run db-migrate

# Start API gateway locally
cd apps/api-gateway
pnpm install
pnpm dev

# Start dashboard locally
cd apps/dashboard
pnpm install
pnpm dev
```

## Platform contract

- Primary hostname: `zveo.zeaz.dev`
- Secrets must stay in local environment files or approved secret stores and must not be committed.

