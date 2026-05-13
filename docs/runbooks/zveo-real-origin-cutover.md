# zVEO Real Origin Cutover

This runbook replaces the temporary Python sample origin behind `zveo.zeaz.dev` with the real `cvsz/zveo` stack.

## Current tunnel baseline

- Public hostname: `https://zveo.zeaz.dev/`
- Tunnel target: `ef0355dd-8e90-45ed-a222-b5053794ed20.cfargotunnel.com`
- Tunnel route: `zveo.zeaz.dev -> http://localhost:8080`
- Expected public response: `HTTP/2 200`

## zVEO stack details

The upstream repository is:

- `https://github.com/cvsz/zveo`

The stack uses:

- PNPM
- Docker Compose
- PostgreSQL
- Redis
- MinIO
- Node.js API gateway on port `8080`
- Dashboard on port `3000`

Reference compose file:

```text
infra/docker/docker-compose.yml
```

The compose stack exposes:

```text
api-gateway -> localhost:8080
dashboard   -> localhost:3000
```

## Automated deployment

Use the deployment helper:

```bash
bash scripts/zveo/deploy-zveo-origin.sh
```

Optional variables:

```bash
export ZVEO_DIR=/opt/zveo
export ZVEO_REF=main
export RUN_SEED=true
```

The deployment helper:

- clones or updates `cvsz/zveo`
- starts Docker Compose services
- waits for `localhost:8080`
- validates `https://zveo.zeaz.dev/`

## Expected health checks

Local:

```bash
curl -sI http://localhost:8080
```

Public:

```bash
curl -sI https://zveo.zeaz.dev/
```

Expected:

```text
HTTP/2 200
server: cloudflare
```

## Cutover steps

1. Stop the temporary Python HTTP server.
2. Deploy the real zVEO stack.
3. Verify local API on `8080`.
4. Verify public tunnel route.
5. Run Terraform drift detection.
6. Tag release baseline.

## Validation

```bash
make validate-agent
make drift
curl -sI https://zveo.zeaz.dev/ | grep -Ei 'HTTP|server|cf-ray'
git status
```

Expected:

```text
CI validation complete.
No drift detected.
HTTP/2 200
nothing to commit, working tree clean
```

## Suggested next routes

After successful cutover:

| Hostname | Suggested target |
|---|---|
| `app.zeaz.dev` | dashboard `localhost:3000` |
| `api.zeaz.dev` | api gateway `localhost:8080` |
| `auth.zeaz.dev` | auth service when implemented |
| `admin.zeaz.dev` | admin dashboard with Zero Trust |
| `grafana.zeaz.dev` | Grafana `localhost:3001` |

## Security follow-up

After cutover stabilizes:

- enable Zero Trust for admin/internal routes
- add WAF managed rules carefully
- avoid redirect loops
- keep Terraform drift clean
