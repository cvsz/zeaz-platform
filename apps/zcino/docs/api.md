# API Reference

## Base contract

- Protocol: HTTP/JSON.
- Default backend listen address: `:8080`.
- Successful JSON responses set `Content-Type: application/json` except `GET /healthz`, which returns `204 No Content`.
- Errors use a common JSON envelope unless they originate from lower-level server failures.

```json
{
  "error": "validation_failed",
  "message": "human readable message"
}
```

Policy blocks include an additional `category` field.

```json
{
  "error": "policy_blocked",
  "message": "payment handling requests are not allowed",
  "category": "payment_handling"
}
```

## Cross-cutting behavior

| Concern | Behavior |
| --- | --- |
| Rate limiting | Requests are limited per client IP and tenant. In-memory limits use token buckets; Redis-backed distributed limits enforce the configured requests-per-minute window. Defaults are 120 requests per minute with a burst of 40. A limited request returns `429` and `Retry-After: 60`. |
| Tenant header | When `TENANT_REQUIRED=true`, requests must include `X-Tenant-ID`. Health and metrics bypass tenant enforcement. Tenant errors use the common JSON error envelope. Tracking events default to the resolved tenant or `public` when tenant strictness is disabled. Demo auth tokens are bound to the request tenant when a non-public tenant is present. |
| Policy inspection | Path, query, headers, and write-method bodies are inspected for wallet, betting, and payment-handling terms. Matches return `403`. |
| Body size | Tracking request JSON bodies are limited to 1 MiB by the handler decoder; policy inspection also limits inspected write bodies to 1 MiB. |
| Authentication | `/admin/whoami` requires a bearer token with the `admin` role. `/auth/token` issues demo tokens from configured demo credentials. |
| Metrics | All requests are observed by Prometheus middleware and exposed on `/metrics`. |

## Endpoints

### `GET /healthz`

Liveness endpoint.

| Status | Meaning |
| --- | --- |
| `204` | Process is running and serving HTTP. |

### `GET /metrics`

Prometheus metrics endpoint. Intended for private scraping by Prometheus or compatible collectors.

### `GET /games`

Lists active games with optional filters and pagination.

#### Query parameters

| Parameter | Type | Default | Notes |
| --- | --- | --- | --- |
| `provider` | string | empty | Exact provider filter after trimming whitespace. |
| `category` | string | empty | Exact category filter after trimming whitespace. |
| `rtp_range` | string | empty | `min-max` shorthand, for example `94-98`. |
| `rtp_min` | number | empty | Inclusive minimum RTP. May be used with `rtp_max`. |
| `rtp_max` | number | empty | Inclusive maximum RTP. May be used with `rtp_min`. |
| `page` | integer | `1` | Must be positive. |
| `per_page` | integer | `20` | Must be positive; domain validation caps it at 100. |

#### Example

```bash
curl 'http://localhost:8080/games?provider=Acme%20Gaming&category=slots&rtp_range=94-98&page=1&per_page=20'
```

#### Response

```json
{
  "items": [
    {
      "id": "11111111-1111-1111-1111-111111111111",
      "provider_id": "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "name": "Golden Spins",
      "provider": "Acme Gaming",
      "category": "slots",
      "rtp": 96.5,
      "volatility": "medium",
      "thumbnail_url": "https://cdn.example.com/games/golden-spins.png",
      "is_active": true
    }
  ],
  "page": 1,
  "per_page": 20,
  "total": 1,
  "total_pages": 1
}
```

### `GET /games/{id}`

Returns one active game by UUID.

| Status | Meaning |
| --- | --- |
| `200` | Game found. |
| `400` | `id` is not a valid UUID. |
| `404` | Game not found. |

### `GET /providers`

Returns active provider names.

```json
{
  "providers": ["Acme Gaming", "TableWorks"]
}
```

### `POST /auth/token`

Issues a demo JWT for development or controlled demos.

#### Request

```json
{
  "user_id": "admin",
  "password": "admin"
}
```

#### Response

```json
{
  "access_token": "<jwt>",
  "token_type": "Bearer",
  "roles": ["admin"],
  "tenant_id": "tenant-a"
}
```

Production deployments should replace or front this demo flow with enterprise identity.

### `GET /admin/whoami`

Returns the authenticated admin identity.

#### Request

```bash
curl http://localhost:8080/admin/whoami \
  -H "Authorization: Bearer $TOKEN"
```

#### Response

```json
{
  "user_id": "admin",
  "roles": ["admin"],
  "tenant_id": "tenant-a"
}
```

### `POST /track/impression`

Queues an impression event.

#### Request

```json
{
  "game_id": "11111111-1111-1111-1111-111111111111",
  "session_id": "session-123",
  "user_id": "user-456",
  "provider": "Acme Gaming",
  "country": "US",
  "placement": "home_lobby",
  "affiliate_id": "affiliate-1",
  "campaign_id": "campaign-a",
  "referrer_url": "https://example.test/lobby",
  "session_duration_ms": 15000,
  "occurred_at": "2026-05-06T12:00:00Z",
  "metadata": {
    "experiment": "hero-carousel-a"
  }
}
```

#### Response

```json
{
  "id": "generated-event-uuid",
  "status": "queued",
  "schema": {
    "name": "tracking_event",
    "version": 1
  },
  "event": "impression"
}
```

### `POST /track/click`

Queues a click event and, after a successful batch flush, publishes a click event through the configured event publisher.

The request body is the same as an impression event, with optional `click_target`:

```json
{
  "game_id": "11111111-1111-1111-1111-111111111111",
  "session_id": "session-123",
  "click_target": "play_button",
  "placement": "home_lobby"
}
```

| Status | Meaning |
| --- | --- |
| `202` | Event validated and queued. |
| `400` | Request body or event validation failed. |
| `503` | In-memory tracking queue is full or stopped. |

## Tracking validation rules

| Field | Rule |
| --- | --- |
| `game_id` | Required UUID. |
| `session_id` | Required, max 128 characters. |
| `user_id` | Optional, max 128 characters. |
| `provider` | Optional, max 100 characters. |
| `country` | Optional ISO 3166-1 alpha-2 code; input is uppercased. |
| `placement` | Optional, max 100 characters. |
| `click_target` | Optional for clicks only, max 100 characters. Impression events must not include it. |
| `affiliate_id` | Optional, max 128 characters. |
| `campaign_id` | Optional, max 128 characters. |
| `referrer_url` | Optional, max 2048 characters. |
| `session_duration_ms` | Optional, must be greater than or equal to zero. |
| `occurred_at` | Optional; defaults to server receive time. |
| `metadata` | Optional map with at most 50 entries; keys max 100 characters and values max 500 characters. |

## Frontend server routes

The Next.js application also exposes internal application routes under `frontend/app/api`:

| Route | Purpose |
| --- | --- |
| `GET /api/games` | Converts cursor/limit UI filters to backend page/per-page filters when `CATALOG_API_URL` is configured; otherwise returns mock data. |
| `GET /api/metrics/stream` | Server-sent events fallback for dashboard metrics. |
| `GET /api/tasks/stream` | Task stream route labeled by `TASK_STREAM_SOURCE`. |
| `GET /api/auth/session` | Demo/shared auth session route. |
| `POST /api/track/click` | Frontend click tracking helper. |
| `GET /api/explorer` | Explorer data route. |
