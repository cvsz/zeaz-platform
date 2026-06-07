# Operations Runbook

## Service prerequisites

| Dependency | Required for | Notes |
| --- | --- | --- |
| PostgreSQL | Catalog and tracking persistence | Apply migrations before starting the backend. |
| Redis | Catalog cache | Required by the backend startup path. |
| NATS | Optional click event publication | Only required when `NATS_URL` is set. |
| Node.js/npm | Frontend development/build | Uses Next.js App Router and package-lock based installs. |
| Go toolchain | Backend, CLIs, node components | Module target is defined in `go.mod`. |

## Local backend startup

1. Start PostgreSQL and Redis.
2. Apply migrations in order from `migrations/`.
3. Export any non-default configuration needed for your local services.
4. Run the backend:

```bash
go run ./...
```

For a narrower backend-only launch, run:

```bash
go run .
```

## Local frontend startup

```bash
cd frontend
npm install
npm run dev
```

Set `CATALOG_API_URL=http://localhost:8080` to proxy live catalog data through the frontend route. Leave it unset to use the local mock catalog.

## Configuration reference

| Variable | Default | Production guidance |
| --- | --- | --- |
| `APP_ENV` | `development` | Use `production`, `staging`, or an environment-specific value outside local development. |
| `HTTP_ADDRESS` | `:8080` | Bind behind an ingress or service mesh. |
| `POSTGRES_DSN` | local development DSN | Store in a secret manager; require TLS where supported. |
| `POSTGRES_MAX_CONNS` | `10` | Size with database pool budget and pod replicas. |
| `POSTGRES_MIN_CONNS` | `1` | Keep low for bursty workloads. |
| `POSTGRES_MAX_CONN_LIFETIME` | `1h` | Keep below database/proxy idle connection limits. |
| `REDIS_ADDRESS` | `localhost:6379` | Use managed Redis or an HA deployment. |
| `REDIS_PASSWORD` | empty | Store in secret manager. |
| `REDIS_DB` | `0` | Prefer isolated Redis instances or prefixes for enterprise tenancy. |
| `JWT_SECRET` | development-only value | Required outside development; rotate with an explicit token invalidation plan. |
| `JWT_ISSUER` | `game-catalog-service` | Use environment-specific issuer strings. |
| `JWT_ACCESS_TOKEN_TTL` | `24h` | Shorten for production and rely on upstream identity refresh. |
| `DEMO_ADMIN_USER` | `admin` | Replace demo auth in production. |
| `DEMO_ADMIN_PASS` | `admin` | Replace demo auth in production. |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `120` | Tune based on ingress limits and partner SLAs. |
| `RATE_LIMIT_BURST` | `40` | Set lower for public endpoints and higher for trusted internal traffic. |
| `CACHE_TTL` | `5m` | Tune to catalog update frequency. |
| `SHUTDOWN_TIMEOUT` | `10s` | Must exceed normal tracking flush latency. |
| `TRACKING_BATCH_SIZE` | `100` | Tune with insert latency and queue pressure. |
| `TRACKING_QUEUE_SIZE` | `1000` | Size for expected bursts; consider durable queues for high volume. |
| `TRACKING_FLUSH_INTERVAL` | `5s` | Lower for fresher analytics, higher for fewer database writes. |
| `NATS_URL` | empty | Set to enable click-event publication. |
| `TENANT_REQUIRED` | `false` | Enable for multi-tenant production gateways after clients send `X-Tenant-ID`. |

## Health and readiness

| Check | Command | Expected result |
| --- | --- | --- |
| HTTP liveness | `curl -i http://localhost:8080/healthz` | `204 No Content`. |
| Metrics scrape | `curl -i http://localhost:8080/metrics` | Prometheus text format. |
| Catalog smoke | `curl -i http://localhost:8080/games` | `200` with a page envelope. |
| Provider smoke | `curl -i http://localhost:8080/providers` | `200` with provider names. |
| Tracking smoke | `curl -i -X POST .../track/impression` | `202` with queued status. |

## Deployment assets

| Path | Purpose |
| --- | --- |
| `Dockerfile` | Backend container image. |
| `frontend/Dockerfile` | Standalone Next.js frontend image running as an unprivileged user. |
| `infra/docker-compose.yml` | Local/shared infrastructure composition. |
| `infra/clickhouse.sql` | Analytics warehouse bootstrap asset. |
| `infra/nats.yaml` | NATS configuration asset. |
| `k8s/game-service.yaml` | Kubernetes game service deployment/service manifest. |
| `k8s/game-hpa.yaml` | Horizontal pod autoscaling manifest. |
| `Dockerfile.zeaznode` | ZEAZ node container image. |
| `infra/zeaz-testnet/*` | Local ZEAZ testnet bootstrap configuration. |
| `k8s/zeaz-testnet/*` | Kubernetes ZEAZ testnet manifests. |

## Scaling guidance

### Backend API

- Scale horizontally behind a load balancer.
- Ensure rate limiting behavior is acceptable per-pod because the current in-process limiter is not globally coordinated.
- Size PostgreSQL connection pools as `replicas * POSTGRES_MAX_CONNS`, leaving headroom for migrations, consoles, and analytics jobs.
- Redis should be monitored for latency, memory, and eviction rate.

### Tracking pipeline

- The in-memory queue is per process. During rolling deploys, shutdown drains queued events until `SHUTDOWN_TIMEOUT` expires.
- `503 queue_full` means the service is shedding tracking load. Increase queue/batch capacity, add replicas, reduce downstream latency, or introduce a durable queue.
- Batch insert failures are logged. Add alerting on repeated flush failures because accepted events may remain in memory only until process shutdown.

### Frontend

- Static assets are immutable and suited for CDN caching.
- App/API routes should be deployed close to the backend or through a private service route when `CATALOG_API_URL` is used.
- Streaming routes require proxy settings that do not buffer server-sent events.

## Incident response playbooks

### Backend is down

1. Check container restart counts and recent logs.
2. Validate PostgreSQL and Redis connectivity.
3. Confirm required production secrets are set, especially `JWT_SECRET` outside development.
4. Roll back to the previous image if startup errors began after deploy.

### High API latency

1. Compare `/metrics` request duration by route and status.
2. Check PostgreSQL latency, connection saturation, and slow queries.
3. Check Redis latency and cache hit rate if instrumented.
4. Confirm policy middleware is not repeatedly failing due to oversized bodies.
5. Scale replicas only after downstream dependencies have capacity.

### Tracking queue full

1. Look for `queue_full` responses and tracking flush errors.
2. Check PostgreSQL write latency and locks on `tracking_events`.
3. Temporarily increase `TRACKING_QUEUE_SIZE` and replicas if memory allows.
4. Reduce client tracking rate or sample non-critical events.
5. Plan a durable ingestion queue if queue pressure is sustained.

### Policy false positives

1. Identify blocked category and match from logs.
2. Confirm the request does not contain prohibited wallet, betting, or payment-handling behavior.
3. Remove blocked terms from client metadata or headers when possible.
4. If an exemption is necessary, implement a narrowly scoped route or structured-field policy change with tests.

## Backup, restore, and disaster recovery

- PostgreSQL is the primary recovery target. Back up catalog tables, tracking tables, and migration history according to business retention requirements.
- Redis cache can be rebuilt from PostgreSQL and does not need to be the recovery source of truth.
- NATS delivery guarantees depend on deployment mode. Treat current publisher integration as optional fan-out unless durable streams are configured.
- Run restore drills before production launch and after schema changes that affect critical tables.
