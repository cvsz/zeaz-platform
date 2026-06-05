# game-catalog-service

A production-grade Go REST microservice for serving a game catalog with clean architecture, PostgreSQL persistence, Redis caching, validation, pagination, filtering, proper error handling, and structured logging.

## Repository map

This repository contains several related surfaces that share infrastructure but should be understood as distinct layers:

- **Catalog API service**: the Go REST backend serves game catalog, provider, auth, tracking, metrics, and policy-gateway endpoints from the main service binary.
- **Zcino frontend**: `frontend/` is a Next.js App Router control-plane and lobby UI that can proxy the Go catalog API or fall back to mock catalog data for local development.
- **ZEAZ protocol/reference node**: `protocol/`, `cmd/zeaznode`, `sdk/`, `docs/protocol/`, and ZEAZ testnet manifests define the signed task-market protocol, reference node, SDKs, and local network bootstrap assets.
- **Experimental autonomous layers**: `internal/brain`, `internal/evolution`, `internal/ecosystem`, `internal/interop`, and `internal/zeaz` hold bounded decision, self-evolution, multi-org, interop, and open-network primitives that are guarded scaffolds rather than direct production mutation systems.


## Enterprise documentation

Detailed enterprise-grade repository documentation is available in `docs/`:

- [Documentation index](docs/README.md)
- [Architecture](docs/architecture.md)
- [API reference](docs/api.md)
- [Data model](docs/data-model.md)
- [Operations runbook](docs/operations.md)
- [Security and compliance](docs/security-compliance.md)
- [Developer guide](docs/developer-guide.md)
- [Frontend guide](docs/frontend.md)

## Endpoints

- `GET /healthz`
- `GET /games?provider=Acme%20Gaming&category=slots&rtp_range=94-98&page=1&per_page=20`
- `GET /games?rtp_min=94&rtp_max=98`
- `GET /games/{id}`
- `GET /providers`
- `POST /auth/token`
- `GET /admin/whoami` (requires an admin bearer token)
- `POST /track/impression`
- `POST /track/click`

## API gateway policy middleware

All routes are wrapped by a global API gateway policy middleware before they reach endpoint handlers. The middleware inspects request paths, queries, headers, and write-method bodies for prohibited wallet, betting, or payment-handling terms. Matching requests are rejected with `403 Forbidden` and a JSON `policy_blocked` response; allowed catalog and tracking requests continue through the normal handler chain.

Because the policy guard is intentionally conservative and global, production deployments should consider route allowlists, structured field inspection, or explicit exemptions before accepting arbitrary partner/client metadata. This reduces false positives from harmless headers or payload fields while preserving the current default-deny stance for wallet, betting, and payment-handling surfaces.

## Configuration

| Variable | Default |
| --- | --- |
| `APP_ENV` | `development` |
| `HTTP_ADDRESS` | `:8080` |
| `POSTGRES_DSN` | `postgres://postgres:postgres@localhost:5432/game_catalog?sslmode=disable` |
| `POSTGRES_MAX_CONNS` | `10` |
| `POSTGRES_MIN_CONNS` | `1` |
| `POSTGRES_MAX_CONN_LIFETIME` | `1h` |
| `REDIS_ADDRESS` | `localhost:6379` |
| `REDIS_PASSWORD` | empty |
| `REDIS_DB` | `0` |
| `JWT_SECRET` | `development-only-change-me` in development; required otherwise |
| `JWT_ISSUER` | `game-catalog-service` |
| `JWT_ACCESS_TOKEN_TTL` | `24h` |
| `DEMO_ADMIN_USER` | `admin` |
| `DEMO_ADMIN_PASS` | `admin` |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` | `120` |
| `RATE_LIMIT_BURST` | `40` |
| `CACHE_TTL` | `5m` |
| `SHUTDOWN_TIMEOUT` | `10s` |
| `TRACKING_BATCH_SIZE` | `100` |
| `TRACKING_QUEUE_SIZE` | `1000` |
| `TRACKING_FLUSH_INTERVAL` | `5s` |
| `NATS_URL` | empty |
| `TENANT_REQUIRED` | `false` |

## Run locally

1. Create PostgreSQL database and Redis instance.
2. Apply `migrations/001_create_games.sql` and `migrations/002_create_tracking_events.sql`.
3. Start the service:

```bash
go run ./...
```

## Tracking service

The Go backend includes an asynchronous tracking pipeline for game analytics. Requests are validated synchronously, acknowledged with `202 Accepted`, queued in memory, and flushed to PostgreSQL in batches via `COPY`. The repository boundary is `TrackingRepository`, so a ClickHouse implementation can be added without changing handlers or service code.

### Event schema

Both tracking endpoints write rows into `tracking_events` using schema version `1`. Click events also power the `affiliate_clicks` view so affiliate and campaign performance can be attributed without changing the client contract later.

| Field | Type | Required | Notes |
| --- | --- | --- | --- |
| `id` | UUID | generated | Event id returned in the `202 Accepted` response. |
| `type` / `event_type` | string | yes | `impression` or `click`. |
| `game_id` | UUID | yes | Game being viewed or clicked. |
| `session_id` | string | yes | Anonymous or authenticated session identifier. |
| `user_id` | string | no | Optional user identifier. |
| `provider` | string | no | Optional game provider denormalization. |
| `placement` | string | no | Lobby, carousel, search result, or other UI placement. |
| `click_target` | string | click only | Button/link/card target for click events. |
| `affiliate_id` | string | no | Affiliate or publisher id captured from query params. |
| `campaign_id` | string | no | Campaign id, often from `campaign_id` or `utm_campaign`. |
| `country` | string | no | ISO 3166-1 alpha-2 country code for reporting. |
| `referrer_url` | string | no | Browser referrer used for attribution debugging. |
| `session_duration_ms` | integer | no | Client-observed session duration in milliseconds. |
| `occurred_at` | timestamp | no | Defaults to server receive time when omitted. |
| `received_at` | timestamp | generated | Server receive time. |
| `metadata` | object | no | Up to 50 string key/value pairs for campaign, experiment, or device attributes. |

Example impression request:

```bash
curl -X POST http://localhost:8080/track/impression \
  -H 'Content-Type: application/json' \
  -d '{
    "game_id": "00000000-0000-0000-0000-000000000001",
    "session_id": "session-123",
    "placement": "home_lobby",
    "session_duration_ms": 15000,
    "metadata": {"experiment": "hero-carousel-a"}
  }'
```

Example click request:

```bash
curl -X POST http://localhost:8080/track/click \
  -H 'Content-Type: application/json' \
  -d '{
    "game_id": "00000000-0000-0000-0000-000000000001",
    "session_id": "session-123",
    "placement": "home_lobby",
    "click_target": "play_button",
    "affiliate_id": "publisher-42",
    "campaign_id": "spring-launch",
    "country": "US",
    "session_duration_ms": 23000
  }'
```


## V3 enterprise platform foundation

The backend now supports the v3 event-driven platform path:

- Tracking click events are persisted in PostgreSQL and then published asynchronously to NATS on the `click.events` subject.
- `cmd/analytics` provides a NATS analytics consumer scaffold that decodes `ClickEvent` payloads and is ready to write into the ClickHouse `clicks` table from `infra/clickhouse.sql`.
- `X-Tenant-ID` is propagated through request context for tenant-aware tracking rows and click analytics; set `TENANT_REQUIRED=true` to reject requests that omit the header.
- `/metrics` exposes Prometheus counters and histograms for HTTP request volume and latency.
- `internal/ranking.Score` provides the first ranking hook for RTP/click-based game ranking while leaving room for future ML models.
- `k8s/` includes a game service Deployment, Service, and HPA for production orchestration.

### Event bus and analytics

Use the Compose stack in `infra/docker-compose.yml` for PostgreSQL, Redis, NATS, ClickHouse, the API gateway, analytics consumer, compliance service, and frontend. For a standalone NATS broker, `infra/nats.yaml` provides a minimal local service.

Click payloads use `internal/events.ClickEvent` and include `tenant_id`, `game_id`, `user_id`, `country`, `session_id`, and Unix `time` so OLAP consumers can aggregate without coupling to the PostgreSQL tracking schema.

## Next.js lobby UI

A Next.js 14 App Router front end is available in `frontend/`. It provides an SSR, SEO-friendly casino-style game lobby UI with TailwindCSS, responsive cards, search, provider/category/RTP filters, infinite scroll, and a React Query integration against `/api/games`.

### Frontend structure

```text
frontend/
├── app/
│   ├── api/games/route.ts       # filterable catalog API used by React Query
│   ├── layout.tsx               # SEO metadata and app providers
│   ├── page.tsx                 # SSR landing page with initial catalog data
│   └── globals.css              # Tailwind and global theme styles
├── components/games/            # lobby, filters, search, grid, and game cards
├── hooks/                       # React Query and debounce hooks
├── lib/                         # API client and mock catalog data source
└── types/                       # shared game/filter response types
```

### Run the lobby UI

```bash
cd frontend
npm install
npm run dev
```

### Frontend checks

Install the locked dependencies and run the same local pre-merge checks that CI expects for production frontend changes:

```bash
cd frontend
npm ci
npm run lint
npm run typecheck
npm run build
```

## Provider normalization

The Go backend includes an adapter-based provider normalization layer in `internal/provider`.
It exposes a single interface for upstream integrations:

```go
type Provider interface {
    GetGames() ([]Game, error)
}
```

Current mock adapters demonstrate how to normalize different upstream schemas into the shared `domain.Game` format:

- PG Soft (`NewMockPGSoftProvider`)
- Pragmatic Play (`NewMockPragmaticPlayProvider`)
- Evolution (`NewMockEvolutionProvider`)

Use `provider.NewNormalizer(...)` to aggregate provider adapters, validate normalized games, and de-duplicate the combined catalog before it is persisted or served.

## Docker full-stack deployment

The repository includes a deployable Docker Compose stack with PostgreSQL, Redis, the Go API gateway/catalog/tracking service, a standalone compliance service, and the Next.js lobby UI.

```text
infra/docker-compose.yml  # full-stack orchestration
Dockerfile                # multi-target Go images for api-gateway and compliance
frontend/Dockerfile       # production Next.js image
```

Start everything from the infrastructure directory:

```bash
cd infra
docker compose up --build
```

Exposed services:

| Service | URL | Notes |
| --- | --- | --- |
| Frontend | `http://localhost:3000` | Next.js game lobby, backed by the Go catalog API when `CATALOG_API_URL` is set. |
| API gateway | `http://localhost:8080` | Catalog, provider, health, and tracking endpoints. |
| Compliance | `http://localhost:8082/check?country=US` | Country allow/block checks. Defaults to blocking `TH,CN`; override with `BLOCKED_COUNTRIES`. |
| PostgreSQL | `localhost:5432` | Initialized from `migrations/` on first volume creation. |
| Redis | `localhost:6379` | Catalog cache. |

The frontend API route uses `CATALOG_API_URL` to proxy catalog data from the Go service in Docker. If that variable is not set, it falls back to the built-in mock catalog so local frontend development remains fast and dependency-free.

## ZEAZ v4 autonomous decision layer

The v4 foundation adds a bounded decision engine and deterministic routing primitives so the platform can optimize traffic and revenue without becoming uncontrolled automation.

### Decision engine

`internal/brain` evaluates current platform metrics against guardrails before returning a measurable, reversible decision. The default rules are intentionally deterministic:

- kill switch always wins before any optimization.
- hourly budget overruns force a `noop` decision.
- error-rate spikes trigger rollback decisions.
- latency and traffic spikes recommend capped scale actions.
- low CTR can boost high-RTP ranking within a configured multiplier.

Risky infrastructure actions are marked with `Risky: true` so executors can require a PR, operator approval, or another change-management workflow before applying them.

### Revenue scoring

The same package exposes `Score` and `SortKey` helpers for ranking games by a weighted blend of CTR, conversion, normalized RTP, and affiliate payout. Inputs are clamped and weights are normalized to keep ranking updates bounded.

### Experiment routing

`internal/routing` provides deterministic FNV-backed assignment for A/B tests and traffic segments. User assignments remain stable for a given experiment id and variant list, which makes behavior measurable across repeated events.

### Feedback loop target

```text
tracking events -> analytics aggregation -> brain.Decide(metrics) -> guarded executor -> catalog/routing/infra update
```

The current implementation is rules-first and ML-ready: future bandit or model-backed optimizers can feed the same `Metrics`, `Decision`, and scoring contracts while preserving budget, kill-switch, and risky-action guardrails.

## ZEAZ v5 controlled self-evolution layer

The v5 foundation introduces a controlled evolution layer that can evaluate and stage self-improvement proposals without allowing direct production writes, auto-merge behavior, or unbounded resource use. The implementation is intentionally deterministic and interface-driven so LLM patch generation, sandbox runners, and canary deployers can be connected behind explicit validation gates.

### Core flow

```text
proposal -> policy gate -> budget gate -> patch generation -> AST/static validation -> simulation -> canary
```

### Evolution engine

`internal/evolution` owns the control-plane rules for safe self-evolution:

- `Proposal`, `Result`, and status constants define the lifecycle for code, infrastructure, and strategy mutations.
- `PolicyEngine` enforces OPA-style guardrails with a default maximum risk of `0.7` and hard denials for `delete_cluster`, `direct_production_write`, `unbounded_resources`, `auto_merge`, and observability-disabling changes.
- `EconomicController` blocks proposals whose estimated hourly cost would exceed the configured remaining budget.
- `PatchValidator` only accepts textual unified git diffs, rejects binary patches, enforces a size cap, scans added lines for dangerous imports or operations, and performs Go AST import validation on added Go files.
- `Engine.Process` runs one bounded proposal step; it never loops forever and only calls the canary deployer after policy, budget, patch validation, and simulation have all passed.

### Simulation and reward

`internal/sim` provides a replay-style simulation scaffold. It scores a patch or strategy against historical revenue, error, and latency events before canary promotion. `internal/evolution.Reward` keeps the reward function explicit with the current formula:

```text
reward = revenue - (errors * 10)
```

This keeps reward design inspectable instead of hiding economic incentives inside an autonomous agent prompt.

### Agent factory

`internal/agents` provides scoped agent creation for optimizer, SEO, infrastructure, and anomaly agents. Created agents receive deterministic names and sandbox policy scopes such as `seo:sandbox`, which prevents self-created agents from bypassing the same control-plane constraints as human-authored proposals.

### Policy artifact

`policies/evolution.rego` mirrors the built-in Go policy as an OPA-style artifact for future admission control or CI policy checks.

### Production integration target

```text
LLM patch generator
  -> internal/evolution.PatchGenerator
  -> Docker/Firecracker sandbox with --network=none and resource limits
  -> internal/sim replay score
  -> PR/human approval for risky actions
  -> 5% canary deployer
  -> metrics-based promote or rollback
```

The current implementation deliberately stops at controlled validation and canary handoff. Production mutation, merge, and rollout systems should remain external executors that are bound by policy, budget, and observability checks.

## ZEAZ v7 multi-org ecosystem layer

The v7 foundation turns the single autonomous organization model into a bounded digital economy of specialized organizations. It standardizes identity, communication, economics, and trust before any inter-org automation can exchange work.

### Ecosystem protocol

`protocol/task.proto` defines the inter-org contract for task submission, bidding, and completion acknowledgements. The contract keeps each message signed by an org identity so API gateway or gRPC adapters can verify provenance before forwarding marketplace traffic.

```text
task -> signed broadcast -> signed bids -> reputation-adjusted selection -> completion -> internal-credit payment
```

### Marketplace and trust model

`internal/ecosystem` provides the executable v7 core:

- `TrustRegistry` stores active org public keys and verifies Ed25519 signatures over canonical JSON payloads.
- `Marketplace` accepts signed tasks and bids, selects work by reputation-adjusted `score / cost`, records completions, and creates internal-credit `Payment` ledger entries.
- `ReputationEngine` increases or decreases org reputation based on completion success, quality, and earned credits.
- `Governance` applies global guardrails such as max spend per org, org kill switches, blacklists, bid risk limits, and task budget limits.

### Specialized organization model

The initial roles are intentionally functional rather than arbitrary:

| Org role | Responsibility |
| --- | --- |
| `growth` | traffic acquisition and campaign optimization |
| `product` | UX, catalog, and conversion improvements |
| `infra` | scaling, reliability, and platform efficiency |
| `ai` | model, ranking, and autonomous optimization work |

### Production integration target

```text
Org namespace
  -> signed gRPC/API gateway request
  -> TrustRegistry verification
  -> Governance guardrails
  -> Marketplace task/bid ledger
  -> ReputationEngine feedback
  -> ClickHouse/PostgreSQL metrics exports
```

The implementation intentionally keeps production mutation outside the autonomous loop. Agents can propose, vote, sponsor, bid, and learn, but policy, budget, quorum, simulation, canary, rollback, and kill-switch boundaries remain mandatory control-plane gates.

## ZEAZ v8 cross-platform ecosystem layer

The v8 foundation turns the autonomous organization model into an interoperability layer between independent ecosystems. It does not make the system unbounded; every cross-platform interaction is routed through explicit identity, protocol, settlement, SLA, reputation, adapter, memory, and guardrail contracts.

### Interop control plane

`internal/interop` provides deterministic primitives for the global interop layer:

- `Identity` and `VerifySignature` model federated ecosystem authorities using ed25519-signed requests.
- `Task`, `Response`, and `protocol/interop.proto` define the stable task contract for gRPC transports and JSON fallback adapters.
- `Settlement` records internal-credit accounting entries for reconciliation before any real-money or crypto settlement layer is introduced.
- `SLA`, `CheckSLA`, and `UpdateReputation` enforce partner quality thresholds and bounded trust updates.
- `NormalizeResponse` converts partner-specific payloads into the standard response shape without panicking on malformed data.
- `RouteTask` selects the best eligible ecosystem while enforcing maximum external spend, blacklists, per-partner circuit breakers, disabled partners, and internal fallback routing.
- `PartnerObservation` and `SummarizePartner` preserve cross-platform memory for reliability, latency, cost-efficiency, and ROI analysis.

### V8 execution target

```text
signed task request
  -> federated identity verification
  -> protocol decode (gRPC or JSON fallback)
  -> guardrail and circuit-breaker checks
  -> reputation-aware partner routing
  -> partner adapter normalization
  -> result validation
  -> internal-credit settlement
  -> SLA check
  -> reputation and memory update
```

The implementation intentionally starts with internal credits plus reconciliation, not real crypto. External gateways, Vault-backed identity registries, OPA policies, ClickHouse metric sinks, and multi-cluster Kubernetes deployment can plug into these contracts without changing the core interop semantics.


## ZEAZ v9 open autonomous network layer

The v9 foundation moves ZEAZ from federated partner assumptions to an open autonomous coordination network. Permissionless access is allowed only through protocol-level identity, signed envelopes, stake/reputation gates, escrowed task budgets, verifier quorum, and append-only ledger records.

### Open protocol and economics

`internal/zeaz/protocol` defines the signed task-market envelope kinds for tasks, bids, completions, verifier results, and peer discovery. `internal/zeaz/ledger.NewOpenService` enables the strict open-network policy: participants must satisfy minimum reputation or stake, task requesters must fund budget plus anti-spam fee, and budgets move into escrow before bids can settle.

### Trustless verification loop

Open-network completions no longer imply immediate trust. Workers submit signed completion envelopes, independent verifiers submit signed `Result` envelopes, and escrow releases only after the configured quorum of distinct valid verifier results is reached. The settlement record is marked with metadata and reputation updates happen after verified settlement, preserving the loop:

```text
work -> completion -> multi-verifier results -> escrow release -> reputation update -> more work
```

### Open node runtime target

Each ZEAZ node still runs a wallet, agent runtime, verifier, protocol client, ledger service, and bootstrap discovery endpoint. The testnet profile remains intentionally centralized around the reference ledger so the protocol can harden before any distributed consensus or DAO-style governance layer is introduced.


## ZEAZ protocol stack

This repository now includes a versioned ZEAZ protocol stack:

- Protocol specification: `docs/protocol/v1.0.0/spec.md`
- Deterministic protocol rules: `docs/protocol/v1.0.0/rules.md`
- Governance framework: `docs/protocol/v1.0.0/governance.md`
- Protobuf IDL: `protocol/task.proto`
- Go reference node: `cmd/zeaznode`
- Go SDK: `sdk/go/zeaz`
- TypeScript SDK: `sdk/typescript`
- Docker testnet bootstrap: `infra/zeaz-testnet/docker-compose.yml`
- Kubernetes testnet bootstrap: `k8s/zeaz-testnet`

Run a local two-node testnet:

```bash
docker compose -f infra/zeaz-testnet/docker-compose.yml up --build
curl http://localhost:8090/version
curl http://localhost:8090/peers
```

Run the reference node directly:

```bash
go run ./cmd/zeaznode
```

Submit and vote on a governance proposal through the reference node:

```bash
curl -X POST http://localhost:8090/governance/proposals   -H 'Content-Type: application/json'   -d '{"id":"zip-1","title":"Enable verifier quorum","kind":"runtime","created_by":"org-bootstrap","changes":["set verification_quorum=2"]}'

curl -X POST http://localhost:8090/governance/proposals/zip-1/votes   -H 'Content-Type: application/json'   -d '{"node":"node-0","weight":1,"value":true}'
```
