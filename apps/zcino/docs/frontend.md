# Frontend Guide

## Overview

The frontend is a Next.js App Router application that provides the Zcino lobby, dashboard, governance, explorer, and protocol-oriented pages. It is designed to run independently for demos with mock data or as a production UI that proxies the Go catalog API from server-side routes.

## Application structure

| Path | Purpose |
| --- | --- |
| `frontend/app/page.tsx` | Main landing/lobby entry. |
| `frontend/app/dashboard/page.tsx` | Dashboard page. |
| `frontend/app/tasks/page.tsx` | Task stream page. |
| `frontend/app/governance/page.tsx` | Governance page. |
| `frontend/app/explorer/page.tsx` | Explorer page. |
| `frontend/app/api/*` | Server routes for games, metrics stream, task stream, auth session, tracking, and explorer data. |
| `frontend/components/` | UI, auth, dashboard, games, network, and protocol components. |
| `frontend/hooks/` | Client data and stream hooks. |
| `frontend/lib/` | API helpers, dashboard data, mock games data, utilities. |
| `frontend/types/` | Shared TypeScript data types. |

## Data flow

```text
React components
  -> hooks and lib/api.ts
    -> /api/games Next.js route
      -> Go catalog API when CATALOG_API_URL is set
      -> mock catalog data when CATALOG_API_URL is unset
```

The frontend query model uses `cursor` and `limit`. The server route maps those values to backend `page` and `per_page` parameters when proxying to the Go API. It also maps frontend RTP parameters (`rtpMin`, `rtpMax`) to backend parameters (`rtp_min`, `rtp_max`).

## Runtime variables

| Variable | Used by | Behavior |
| --- | --- | --- |
| `CATALOG_API_URL` | `frontend/app/api/games/route.ts` | Enables server-side proxying to the Go catalog API. When omitted, the route returns mock data. |
| `NEXT_PUBLIC_METRICS_WS_URL` | Metrics hooks/UI | Enables production WebSocket metrics feed. When omitted, the UI can use `/api/metrics/stream` SSE fallback. |
| `TASK_STREAM_SOURCE` | Task stream route | Labels task events as `nats`, `kafka`, or another configured source label. |

## Server routes

| Route | Behavior |
| --- | --- |
| `GET /api/games` | Reads provider/category/RTP/search/cursor/limit filters. Proxies backend catalog data or returns mock games. Adds CDN-oriented cache headers. |
| `GET /api/metrics/stream` | Emits a server-sent events stream with metric snapshots every 1.5 seconds. |
| `GET /api/tasks/stream` | Emits task stream events for the dashboard/task UI. |
| `GET /api/auth/session` | Provides the frontend auth/session contract. |
| `POST /api/track/click` | Captures click tracking from the frontend path. |
| `GET /api/explorer` | Provides explorer data to the UI. |

## Build and runtime

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run start
```

The production Dockerfile builds a standalone Next.js output and runs it as an unprivileged user on port 3000. Static assets should be served with immutable CDN caching; app routes should be revalidated or fetched from origin according to their route headers.

## CDN and streaming considerations

- Use `frontend/cdn.headers` as the baseline for edge cache and security headers.
- Do not buffer server-sent event routes at proxies. Preserve `Content-Type: text/event-stream` and disable response buffering where the platform supports it.
- Keep backend API URLs private to the server runtime. Browser-facing variables must use `NEXT_PUBLIC_` and should not contain secrets.

## Production hardening checklist

- [ ] `CATALOG_API_URL` points to a private service or internal ingress.
- [ ] Authentication provider is connected to enterprise identity.
- [ ] Streaming routes are tested through the production CDN/proxy path.
- [ ] Type checking and production build pass in CI.
- [ ] Security headers are applied at CDN or origin.
- [ ] Mock fallback behavior is acceptable for the target environment or disabled by deployment policy.
