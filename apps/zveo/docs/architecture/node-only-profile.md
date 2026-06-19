# Node-only Production Profile

This profile runs the zVEO stack without requiring Python runtimes. It targets services implemented in Node.js only and keeps Python compatibility code untouched for dual-stack environments.

## Services

The `node` Docker Compose profile includes:

- `postgres`
- `redis`
- `minio`
- `api-gateway`
- `render-worker`
- `dashboard`
- `prometheus`
- `grafana`

## Run

```bash
docker compose -f infra/docker/docker-compose.yml --profile node up --build
```

## Health and reachability

- API gateway: `http://localhost:8080/healthz`
- Dashboard: `http://localhost:3000`
- Postgres: `pg_isready -U zveo -d zveo`
- Redis: `redis-cli ping`
- MinIO: `http://localhost:9000/minio/health/live`

## Node-only verification

```bash
pnpm verify:node
```
