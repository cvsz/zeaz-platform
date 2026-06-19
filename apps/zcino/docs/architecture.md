# Architecture

## Executive summary

Zcino combines a production-oriented game catalog service, asynchronous event tracking, a Next.js frontend, and ZEAZ protocol/reference-node components. The repository is organized as a modular monorepo: each runtime surface has separate entry points, while shared Go packages enforce clean boundaries between handlers, services, repositories, middleware, domain models, and infrastructure adapters.

## Runtime surfaces

| Surface | Entry point | Primary responsibility | Stateful dependencies |
| --- | --- | --- | --- |
| Catalog API | `main.go` | HTTP API for health, metrics, games, providers, auth, admin identity, and tracking ingestion. | PostgreSQL, Redis, optional NATS. |
| ZEAZ node | `cmd/zeaznode/main.go` | Reference node for protocol/runtime/validator behavior. | Local node state, testnet configuration, p2p networking. |
| Compliance CLI | `cmd/compliance/main.go` | Policy/compliance evaluation entry point. | Rego policies and local inputs. |
| Analytics CLI | `cmd/analytics/main.go` | Analytics-related command surface. | Database/event sources as configured. |
| Frontend | `frontend/app/*` | Next.js App Router lobby, dashboard, governance, explorer, and API proxy routes. | Catalog API when `CATALOG_API_URL` is set; mock data otherwise. |

## Backend layering

The Go service follows a dependency direction that keeps business rules independent of transport and infrastructure details:

```text
HTTP router and middleware
  -> handlers
    -> services
      -> domain models and interfaces
        -> repositories, caches, event publishers, databases
```

### Layer responsibilities

| Layer | Package examples | Responsibilities |
| --- | --- | --- |
| Transport | `internal/transport` | Route registration, request logging, panic recovery, policy guard, rate limiting, Prometheus handler, auth guard helpers. |
| Middleware | `internal/middleware` | Tenant extraction and tenant requirement enforcement. |
| Handlers | `internal/handler` | JSON decoding/encoding, path/query parsing, request validation boundaries, status code mapping. |
| Services | `internal/service` | Catalog use cases, cache strategy, tracking queueing, batch flushing, event publication. |
| Domain | `internal/domain` | Core types, validation rules, pagination, typed errors. |
| Repository/cache | `internal/repository`, `internal/cache` | PostgreSQL persistence and Redis cache implementations. |
| Infrastructure | `internal/database`, `internal/eventbus`, `internal/logger`, `internal/metrics` | External clients and observability adapters. |

## Request path

A normal catalog request follows this sequence:

1. The HTTP server receives a request and applies read, write, idle, and header timeouts.
2. The router middleware stack logs requests, recovers panics, applies policy inspection, enforces tenant headers when configured, and rate limits by client IP.
3. The catalog handler parses query parameters and pagination.
4. The catalog service validates filters, reads from Redis for cacheable game details where applicable, calls PostgreSQL repositories, and returns domain pages.
5. The handler emits a JSON response and the request logger records status, duration, path, method, and remote address while Prometheus metrics are observed.

A tracking request follows the same middleware path, then is validated synchronously, accepted with `202`, queued in memory, flushed to PostgreSQL in batches, and click events are published to NATS when a NATS URL is configured.

## Component topology

```text
Browser / Partner Client
        |
        | HTTP(S)
        v
Next.js frontend routes ---- optional proxy ----> Go catalog API
        |                                      /       |        \
        |                                     /        |         \
        v                                    v         v          v
Mock catalog data                     PostgreSQL     Redis       NATS
                                             |          |          |
                                             v          v          v
                                      games/events   cache   click events
```

## Bounded contexts

| Context | Source folders | Notes |
| --- | --- | --- |
| Catalog | `internal/domain`, `internal/service`, `internal/repository`, `internal/cache`, `internal/handler` | Owns games, providers, filters, pagination, and cache behavior. |
| Tracking | `internal/domain`, `internal/service`, `internal/repository`, `internal/events`, `internal/eventbus` | Owns impression/click event validation, queueing, batch writes, and click publication. |
| Security gateway | `internal/auth`, `internal/middleware`, `internal/transport`, `policies` | Owns JWT issuance/validation, role checks, tenant enforcement, rate limiting, and prohibited-surface blocking. |
| Frontend experience | `frontend/app`, `frontend/components`, `frontend/hooks`, `frontend/lib`, `frontend/types` | Owns UI composition, client data fetching, API proxy routes, and mock fallback data. |
| ZEAZ protocol | `protocol`, `cmd/zeaznode`, `internal/zeaz`, `sdk`, `docs/protocol`, `infra/zeaz-testnet`, `k8s/zeaz-testnet` | Owns protocol definitions, node scaffolding, SDKs, and testnet assets. |
| Autonomous experiments | `internal/brain`, `internal/evolution`, `internal/ecosystem`, `internal/interop`, `internal/org`, `internal/agents` | Experimental primitives that should be treated as guarded scaffolding unless production controls are explicitly added. |

## Extension points

- **Catalog providers**: add provider normalization in `internal/provider`, persist provider/game data through migrations, and expose read behavior through repository/service interfaces.
- **Analytics warehouse**: keep `TrackingRepository` stable and add a ClickHouse or stream-oriented implementation without changing HTTP handlers.
- **Event transport**: implement `eventbus.Publisher` for Kafka, cloud pub/sub, or durable queues while preserving the click-event contract.
- **Tenant isolation**: keep tenant extraction centralized in middleware and propagate tenant identifiers into persistence/query boundaries before enabling strict multi-tenant production mode.
- **ZEAZ protocol evolution**: add versioned docs and compatibility tests before changing proto contracts, SDK shapes, or validator behavior.

## Architectural non-goals and cautions

- The policy middleware is conservative and global. It is useful as a guardrail, not as a complete compliance system.
- The demo auth handler is suitable for development and controlled demos only. Enterprise deployments should integrate a managed OIDC provider or internal identity gateway.
- In-memory tracking queueing favors simplicity. High-volume production deployments should plan durable buffering and backpressure-aware autoscaling.
- Experimental autonomous packages should not mutate production state without explicit approvals, audit trails, dry-run modes, and rollback controls.
