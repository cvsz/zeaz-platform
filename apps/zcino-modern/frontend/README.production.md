# Zcino Meta Frontend Production Notes

## Runtime streaming

- `NEXT_PUBLIC_METRICS_WS_URL` enables a production WebSocket metrics feed. If unset, the UI uses `/api/metrics/stream` as an SSE fallback.
- `TASK_STREAM_SOURCE=nats|kafka` labels task events emitted by `/api/tasks/stream`; production deployments should point that route at the NATS or Kafka bridge that terminates inside the private network.

## Auth

The frontend exposes OAuth and wallet login flows through a shared auth provider. The demo provider can be replaced with Auth.js, Okta, or an internal OIDC gateway while preserving the dashboard contract.

## CDN

Use `cdn.headers` for edge cache/security headers. Static Next.js assets are immutable; app routes are revalidated by the origin.

## Container

The Dockerfile builds a standalone Next.js image that runs as an unprivileged user on port 3000.
