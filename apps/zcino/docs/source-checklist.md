# Source Coverage Checklist

This checklist is the canonical documentation audit for the repository source tree. Use it when a change claims to touch "all source code," "full logic," "all options," or "all functions" so reviewers can verify that the affected runtime, package, API, and documentation surfaces were considered together.

## Coverage status

- [x] Go application entry points and command binaries are inventoried.
- [x] Go package logic, exported/private helpers, domain rules, and source files are mapped by bounded context.
- [x] Frontend App Router routes, components, hooks, library helpers, and runtime fallbacks are inventoried.
- [x] SDK, protocol IDL, migration, infrastructure, Kubernetes, Docker, and policy assets are included.
- [x] Runtime options, environment variables, request options, validation options, and protocol feature options are listed.
- [x] Documentation ownership is connected back to the source areas that must update it.

## Source tree inventory

| Area | Source paths | Checklist |
| --- | --- | --- |
| Catalog API composition | `main.go`, `internal/config`, `internal/database`, `internal/logger`, `internal/transport`, `internal/middleware` | [x] Startup, config loading, middleware order, graceful shutdown, logging, metrics, rate limiting, tenancy, and policy inspection. |
| Catalog domain and data access | `internal/domain`, `internal/service/catalog_service.go`, `internal/handler/catalog_handler.go`, `internal/repository/game_repository.go`, `internal/cache/game_cache.go`, `internal/provider` | [x] Game validation, filters, pagination, provider normalization, Redis cache keys, PostgreSQL queries, and HTTP response/error mapping. |
| Tracking and analytics | `internal/domain/tracking.go`, `internal/service/tracking_service.go`, `internal/handler/tracking_handler.go`, `internal/repository/tracking_repository.go`, `internal/events`, `internal/eventbus`, `cmd/analytics`, `infra/clickhouse.sql` | [x] Event validation, queue/backpressure, batch flush, PostgreSQL copy rows, NATS click publication, tenant attribution, and analytics consumer scaffolding. |
| Security gateway | `internal/auth`, `internal/transport/auth_middleware.go`, `internal/transport/policy_middleware.go`, `internal/transport/rate_limit.go`, `policies/evolution.rego`, `cmd/compliance` | [x] Demo token issuance, JWT validation, role checks, IP buckets, prohibited request inspection, blocked-country compliance, and Rego policy assets. |
| Frontend application | `frontend/app`, `frontend/components`, `frontend/hooks`, `frontend/lib`, `frontend/types`, `frontend/cdn.headers`, `frontend/README.production.md` | [x] Pages, server routes, streaming routes, proxy/fallback behavior, game lobby, dashboard, governance, explorer, providers, and production build/runtime guidance. |
| ZEAZ protocol and node | `cmd/zeaznode`, `internal/zeaz`, `protocol`, `docs/protocol`, `infra/zeaz-testnet`, `k8s/zeaz-testnet` | [x] Version negotiation, signed envelopes, ledger admission, staking, settlement, discovery, consensus, runtime agents, WASM registry, node manifest, and testnet bootstrap. |
| Autonomous/interop experiments | `internal/brain`, `internal/evolution`, `internal/ecosystem`, `internal/interop`, `internal/org`, `internal/agents`, `internal/routing`, `internal/sim`, `internal/ranking` | [x] Guarded decision logic, scoring, mutation validation, governance, task marketplaces, reputation, routing, SLA checks, simulations, and experiment bucketing. |
| SDKs and clients | `sdk/go/zeaz`, `sdk/typescript/src/index.ts` | [x] HTTP clients, signer helpers, version calls, envelope submission, peer APIs, and task/bid helpers. |
| Data, deployment, and policy assets | `migrations`, `infra`, `k8s`, `Dockerfile`, `Dockerfile.zeaznode`, `frontend/Dockerfile` | [x] Schema order, seed/backfill logic, Compose services, NATS config, ClickHouse table, Kubernetes services/HPA/testnet manifests, and container build paths. |

## Runtime options and defaults

### Backend service environment

| Option | Default | Source behavior to document when changed |
| --- | --- | --- |
| `APP_ENV` | `development` | Selects logger mode and enables the development-only JWT secret default. |
| `HTTP_ADDRESS` | `:8080` | Catalog API listen address. |
| `POSTGRES_DSN` | `postgres://postgres:postgres@localhost:5432/game_catalog?sslmode=disable` | PostgreSQL system-of-record connection string. |
| `POSTGRES_MAX_CONNS` / `POSTGRES_MIN_CONNS` | `10` / `1` | PostgreSQL pool sizing. |
| `POSTGRES_MAX_CONN_LIFETIME` | `1h` | PostgreSQL connection recycling; invalid values silently fall back to default. |
| `REDIS_ADDRESS` / `REDIS_PASSWORD` / `REDIS_DB` | `localhost:6379` / empty / `0` | Redis game/detail/provider cache connection. |
| `JWT_SECRET` | `development-only-change-me` | Required to be changed outside development. |
| `JWT_ISSUER` | `game-catalog-service` | JWT issuer claim and validation value. |
| `JWT_ACCESS_TOKEN_TTL` | `24h` | Demo access-token lifetime. |
| `DEMO_ADMIN_USER` / `DEMO_ADMIN_PASS` | `admin` / `admin` | Demo token credentials. |
| `RATE_LIMIT_REQUESTS_PER_MINUTE` / `RATE_LIMIT_BURST` | `120` / `40` | Per-client token bucket limits. |
| `CACHE_TTL` | `5m` | Redis TTL for game detail, page, and providers cache entries. |
| `SHUTDOWN_TIMEOUT` | `10s` | HTTP and tracking-service shutdown deadline. |
| `TRACKING_BATCH_SIZE` | `100` | Number of queued tracking events flushed in one batch. |
| `TRACKING_QUEUE_SIZE` | `1000` | In-memory tracking queue capacity before `503` backpressure. |
| `TRACKING_FLUSH_INTERVAL` | `5s` | Timer-driven flush interval. |
| `NATS_URL` | empty | Enables click-event publication when set; no-op publisher otherwise. |
| `TENANT_REQUIRED` | `false` | Requires `X-Tenant-ID` for non-health/non-metrics requests when true. |

### Command and frontend environment

| Surface | Option | Default | Source behavior to document when changed |
| --- | --- | --- | --- |
| Compliance service | `BLOCKED_COUNTRIES` | `KP,IR,SY` | Comma-separated country codes rejected by `/evaluate`. |
| ZEAZ node | `ZEAZ_ORG_ID` | `org-bootstrap` | Bootstrap organization id and signing identity. |
| ZEAZ node | `ZEAZ_NODE_ID` | `node-0` | Node id in manifests, governance votes, and peer announcements. |
| ZEAZ node | `ZEAZ_PUBLIC_ADDR` | `http://localhost:8090` | Public peer address advertised by discovery. |
| ZEAZ node | `ZEAZ_NETWORK_ID` | `zeaz-localnet` | Network id in validator manifest. |
| ZEAZ node | `ZEAZ_P2P_LISTEN` | `/ip4/0.0.0.0/tcp/0` | P2P listen multiaddr in the node manifest. |
| ZEAZ node | `ZEAZ_HTTP_ADDRESS` | `:8090` | Reference-node HTTP listen address and fallback RPC address. |
| Analytics command | `NATS_URL` | `nats://localhost:4222` | NATS subscription endpoint for the analytics consumer. |
| Frontend server routes | `CATALOG_API_URL` | unset | Proxies `/api/games` and `/api/track/click` to the Go API when set; otherwise the game route uses deterministic mock data and click tracking returns `202`. |
| Frontend providers | `NODE_ENV` | package/runtime controlled | Enables React Query devtools in development only. |
| Frontend metrics hook | `NEXT_PUBLIC_METRICS_WS_URL` | unset | Uses a browser WebSocket for dashboard metrics when set; otherwise falls back to `/api/metrics/stream` SSE when available. |
| Browser auth provider | injected wallet | demo fallback | Uses `window.ethereum.request({ method: "eth_requestAccounts" })` when available; otherwise returns a deterministic demo wallet. |
| Task stream route | `TASK_STREAM_SOURCE` | route fallback | Labels task stream events for dashboard display. |

## HTTP, query, and validation options

| Surface | Options and logic |
| --- | --- |
| `GET /games` | `provider`, `category`, `rtp_range=min-max`, `rtp_min`, `rtp_max`, `page`, and `per_page`; filters trim strings, validate positive pagination, cap domain `per_page` at 100, and query active games only. |
| `GET /games/{id}` | Requires a UUID path value and returns not-found for missing/inactive games. |
| `GET /providers` | Returns active provider names from cache or PostgreSQL. |
| `POST /auth/token` | Requires demo `user_id` and `password`, issues bearer token with `admin` role on credential match. |
| `GET /admin/whoami` | Requires bearer token with `admin` role. |
| `POST /track/impression` | Requires valid `game_id`, `session_id`, tenant, timestamps, and optional attribution/metadata fields; rejects `click_target`. |
| `POST /track/click` | Uses the same tracking envelope and allows optional `click_target`; click events publish to NATS after successful batch persistence when configured. |
| Policy guard | Inspects path, query, headers, and write bodies up to 1 MiB; blocks wallet, betting, and payment-handling token categories. |
| Tenant middleware | Skips `/healthz` and `/metrics`; all other requests use trimmed `X-Tenant-ID` or default `public` when not required. |
| Rate limiter | Buckets by parsed `X-Forwarded-For`, `X-Real-IP`, or remote address; returns `429` and `Retry-After: 60` after burst exhaustion. |
| Frontend `/api/games` | Accepts `provider`, `category`, `rtpMin`, `rtpMax`, `search`, `cursor`, and `limit`; maps cursor/limit to backend page/per-page, filters search locally, and caches responses with `s-maxage=60` and `stale-while-revalidate=300`. |
| Frontend streams | Metrics and task streams are `force-dynamic` server-sent event fallback routes. |
| ZEAZ node HTTP | Exposes `/healthz`, `/version`, `/version/negotiate`, `/ledger`, `/envelopes`, `/manifest`, `/governance/proposals`, `/governance/proposals/{id}/votes`, `/governance/proposals/{id}/tally`, `/peers`. |

## Full Go function and type checklist

| File | Types | Functions and methods |
| --- | --- | --- |
| `main.go` | — | `main` |
| `cmd/analytics/main.go` | — | `main`, `getenv` |
| `cmd/compliance/main.go` | `complianceResponse` | `main`, `loadBlockedCountries`, `getEnv` |
| `cmd/zeaznode/main.go` | — | `main`, `writeJSON`, `getenv`, `addrFromRequest` |
| `internal/agents/factory.go` | `Agent`, `Factory` | `NewFactory`, `CreateAgent`, `Create`, `normalize` |
| `internal/auth/jwt.go` | `contextKey`, `Claims`, `TokenManager` | `NewTokenManager`, `Generate`, `Validate`, `WithClaims`, `ClaimsFromContext`, `HasRole` |
| `internal/brain/engine.go` | `Metrics`, `Decision`, `Guardrails`, `Engine`, `GameMetrics`, `ScoreWeights` | `DefaultGuardrails`, `NewEngine`, `Decide`, `DefaultScoreWeights`, `Score`, `SortKey`, `normalizeGuardrails`, `normalizeScoreWeights`, `budgetExceeded`, `clamp`, `clamp01`, `IsRiskyAction` |
| `internal/cache/game_cache.go` | `GameCache`, `RedisGameCache` | `NewRedisGameCache`, `GetGame`, `SetGame`, `GetGamePage`, `SetGamePage`, `GetProviders`, `SetProviders`, `getJSON`, `setJSON`, `gameKey`, `providersKey`, `gamesKey` |
| `internal/config/config.go` | `Config`, `PostgresConfig`, `RedisConfig`, `AuthConfig`, `RateLimitConfig`, `TrackingConfig`, `NATSConfig`, `TenantConfig` | `Load`, `getEnv`, `getEnvInt`, `getEnvDuration`, `getEnvDurationOrDefault`, `getEnvBool` |
| `internal/database/postgres.go` | — | `NewPostgresPool` |
| `internal/database/redis.go` | — | `NewRedisClient` |
| `internal/domain/errors.go` | `ValidationError` | `Error`, `Unwrap` |
| `internal/domain/game.go` | `Volatility`, `Game`, `RTPRange`, `GameFilter`, `Pagination`, `Page` | `IsValid`, `Validate`, `Offset`, `NewPage` |
| `internal/domain/tracking.go` | `TrackingEventType`, `TrackingEvent` | `IsValid`, `Validate` |
| `internal/ecosystem/governance.go` | `Guardrails`, `ProposalKind`, `ProposalStatus`, `Proposal`, `Vote`, `Tally`, `Governance` | `NewGovernance`, `AllowTask`, `AllowBid`, `RecordPayment`, `SubmitProposal`, `CastVote`, `Proposals`, `Proposal`, `Tally`, `ensureGovernanceMaps` |
| `internal/ecosystem/identity.go` | `KeyPair`, `TrustRegistry` | `GenerateIdentity`, `Sign`, `Verify`, `CanonicalBytes`, `NewTrustRegistry`, `Register`, `Org`, `VerifySignedPayload` |
| `internal/ecosystem/marketplace.go` | `Marketplace`, `taskSigningPayload`, `bidSigningPayload` | `NewMarketplace`, `SubmitTask`, `SubmitBid`, `SelectBest`, `CompleteTask`, `Payments`, `bidValue`, `unsignedTask`, `unsignedBid` |
| `internal/ecosystem/reputation.go` | `ReputationEngine` | `NewReputationEngine`, `Get`, `RecordCompletion`, `ReputationAdjustedScore`, `clamp` |
| `internal/ecosystem/types.go` | `Org`, `Task`, `Bid`, `TaskCompletion`, `Payment`, `Reputation`, `OrgMemory`, `Ack` | `Validate` methods for `Org`, `Task`, and `Bid` |
| `internal/eventbus/nats.go` | `Publisher`, `NoopPublisher`, `NATSPublisher` | `PublishClick`, `Close`, `NewNATSPublisher` |
| `internal/events/events.go` | `ClickEvent` | — |
| `internal/evolution/economics.go` | `EconomicController` | `NewEconomicController`, `Evaluate`, `Reward` |
| `internal/evolution/engine.go` | `Simulator`, `CanaryDeployer`, `NoopCanaryDeployer`, `Engine` | `DeployCanary`, `NewEngine`, `Process` |
| `internal/evolution/mutate.go` | `PatchGenerator`, `StaticPatchGenerator`, `PatchValidator` | `GeneratePatch`, `ValidatePatch`, `parseAddedGo`, `sanitizePatchComment` |
| `internal/evolution/policy.go` | `Policy`, `PolicyEngine` | `DefaultPolicy`, `NewPolicyEngine`, `Evaluate` |
| `internal/evolution/types.go` | `Proposal`, `Result`, `Evaluation`, `Budget` | `Remaining`, `Validate` |
| `internal/handler/auth_handler.go` | `AuthHandler`, `LoginRequest`, `TokenResponse` | `NewAuthHandler`, `Token`, `decodeLoginRequest` |
| `internal/handler/catalog_handler.go` | `CatalogHandler`, `ErrorResponse` | `NewCatalogHandler`, `ListGames`, `GetGame`, `ListProviders`, `handleServiceError`, `parseListGamesQuery`, `parseRTPRange`, `parsePositiveInt`, `writeJSON`, `writeError` |
| `internal/handler/tracking_handler.go` | `TrackingHandler`, `TrackingRequest`, `TrackingAcceptedResponse`, `TrackingAcceptedSchema` | `NewTrackingHandler`, `TrackImpression`, `TrackClick`, `track`, `handleTrackingError`, `decodeTrackingRequest`, `toEvent` |
| `internal/interop/adapter.go` | — | `NormalizeResponse` |
| `internal/interop/identity.go` | `Identity` | `VerifySignature` |
| `internal/interop/memory.go` | `PartnerObservation`, `PartnerTrend` | `SummarizePartner` |
| `internal/interop/routing.go` | `Guardrails` | `RouteTask`, `CircuitOpen`, `eligible` |
| `internal/interop/sla.go` | `SLA` | `CheckSLA`, `UpdateReputation`, `clamp01` |
| `internal/interop/types.go` | `Task`, `Response`, `Org`, `Settlement` | — |
| `internal/logger/logger.go` | — | `New` |
| `internal/metrics/http.go` | — | `init`, `Observe` |
| `internal/middleware/tenant.go` | `tenantContextKey` | `TenantMiddleware`, `TenantID` |
| `internal/org/governance.go` | `Agent`, `Vote`, `DecisionRecord`, `Governance` | `DefaultAgents`, `NewGovernance`, `Decide`, `CanSponsor` |
| `internal/org/market.go` | `Task`, `Bid`, `Allocation` | `SelectBestBid` |
| `internal/org/memory.go` | `Memory`, `MemoryStore` | `Record`, `BestStrategy`, `Entries` |
| `internal/provider/mock_providers.go` | `PGSoftGame`, `PGSoftAdapter`, `PragmaticGame`, `PragmaticPlayAdapter`, `EvolutionGame`, `EvolutionAdapter` | `NewMockPGSoftProvider`, `GetGames`, `NewMockPragmaticPlayProvider`, `varianceToVolatility`, `NewMockEvolutionProvider` |
| `internal/provider/normalizer.go` | `Normalizer` | `NewNormalizer`, `GetGames` |
| `internal/provider/provider.go` | `Game`, `Provider`, `RawGame` | `NormalizeGame`, `stableGameID`, `normalizeCategory`, `normalizeRTP`, `normalizeVolatility`, `normalizeThumbnailURL` |
| `internal/ranking/score.go` | — | `Score` |
| `internal/repository/game_repository.go` | `GameRepository`, `PostgresGameRepository`, `gameScanner` | `NewPostgresGameRepository`, `ListGames`, `GetGameByID`, `ListProviders`, `buildGameFilters`, `scanGame` |
| `internal/repository/tracking_repository.go` | `TrackingRepository`, `PostgresTrackingRepository` | `NewPostgresTrackingRepository`, `InsertTrackingEvents`, `trackingEventCopyRow`, `nullString`, `nullInt64`, `metadataOrEmpty` |
| `internal/routing/router.go` | `Experiment` | `Route`, `Assign`, `Bucket`, `hash` |
| `internal/service/catalog_service.go` | `CatalogService`, `catalogService` | `NewCatalogService`, `ListGames`, `GetGame`, `ListProviders`, `validateFilter`, `IsNotFound` |
| `internal/service/tracking_service.go` | `TrackingService`, `TrackingServiceConfig`, `trackingService` | `NewTrackingService`, `Start`, `Track`, `Stop`, `run`, `publishClickEvents` |
| `internal/sim/sim.go` | `HistoricalEvent`, `Scenario`, `Engine` | `NewEngine`, `RunSimulation`, `clamp01` |
| `internal/transport/auth_middleware.go` | — | `optionalAuth`, `requireRole`, `authenticateBearer`, `writeAuthError` |
| `internal/transport/policy_middleware.go` | `prohibitedPolicy`, `policyBlockResponse`, `policyDecision` | `policyGuard`, `inspectPolicy`, `shouldInspectBody`, `readAndRestoreBody`, `evaluatePolicy`, `tokenSet`, `writePolicyBlock` |
| `internal/transport/rate_limit.go` | `rateLimiter`, `visitorBucket` | `newRateLimiter`, `middleware`, `allow`, `cleanup`, `clientIP` |
| `internal/transport/router.go` | `statusRecorder` | `NewRouter`, `requestLogger`, `recoverer`, `WriteHeader`, `writeAdminIdentity` |
| `internal/zeaz/consensus/consensus.go` | `Algorithm`, `Phase`, `Validator`, `Proposal`, `Vote`, `QuorumCertificate`, `Commit`, `Engine` | `NewEngine`, `HashProposal`, `VoteSignBytes`, `SignVote`, `AddVote`, `Commit`, `Commits`, `qcLocked`, `voteKey` |
| `internal/zeaz/discovery/discovery.go` | `BootstrapNetwork` | `NewBootstrapNetwork`, `Announce`, `Peers`, `ForgetExpired` |
| `internal/zeaz/ledger/ledger.go` | `Org`, `Account`, `Policy`, `Record`, `Reputation`, `Snapshot`, `Service` | `DefaultPolicy`, `OpenNetworkPolicy`, `NewService`, `NewOpenService`, `NewServiceWithPolicy`, `RegisterOrg`, `ResolvePublicKey`, `SubmitEnvelope`, `Snapshot`, `Records`, `appendRecord`, `allowParticipantLocked`, `reserveTaskBudgetLocked`, `taskVerifiedLocked`, `settleCompletionLocked`, `updateReputation`, `clamp`, `cloneMap` |
| `internal/zeaz/node/node.go` | `Role`, `Capability`, `Manifest` | `FullValidatorManifest` |
| `internal/zeaz/p2p/p2p.go` | `Config`, `Node` | `NewNode`, `JoinTopic`, `Close` |
| `internal/zeaz/protocol/protocol.go` | `Version`, `NegotiationResult`, `Envelope`, `Signature`, `Task`, `Bid`, `Completion`, `Result`, `EconomicRule`, `GovernanceProposal`, `GovernanceVote`, `Peer`, `KeyResolver`, `KeyResolverFunc` | `CurrentVersion`, `String`, `CompatibleWith`, `NegotiateVersion`, `ResolvePublicKey`, `NewEnvelope`, `Sign`, `Verify`, `SigningBytes`, `CanonicalJSON`, `writeCanonical` |
| `internal/zeaz/runtime/runtime.go` | `Wallet`, `Agent`, `Verifier` | `NewWallet`, `PublicKeyString`, `Sign`, `NewAgent`, `SubmitTask`, `SubmitBid`, `CompleteTask`, `SubmitResult`, `Verify` |
| `internal/zeaz/settlement/settlement.go` | `Transfer`, `Receipt` | `NewReceipt`, `SignReceipt`, `VerifyReceipt`, `HashReceipt`, `ReceiptSignBytes`, `TransferRoot`, `hashTransfer` |
| `internal/zeaz/staking/staking.go` | `ValidatorStatus`, `Validator`, `Event`, `Pool` | `NewPool`, `Bond`, `Unbond`, `Slash`, `ActiveValidators`, `Events`, `appendEvent` |
| `internal/zeaz/wasm/wasm.go` | `Module`, `Invocation`, `Result`, `Runner`, `Registry`, `DeterministicEchoRunner` | `NewRegistry`, `Register`, `Invoke`, `Run` |
| `sdk/go/zeaz/client.go` | `Client`, `Signer` | `NewClient`, `Version`, `Negotiate`, `SubmitEnvelope`, `Ledger`, `Peers`, `AnnouncePeer`, `SubmitTask`, `SubmitBid`, `do`, `NewSigner`, `Sign` |

## Frontend and TypeScript function checklist

| File | Functions, components, and route handlers |
| --- | --- |
| `frontend/app/page.tsx` | Landing page loader that calls `getGames` for initial SSR data. |
| `frontend/app/dashboard/page.tsx` | Dashboard page composition. |
| `frontend/app/governance/page.tsx` | Governance page composition. |
| `frontend/app/explorer/page.tsx` | Explorer page composition. |
| `frontend/app/tasks/page.tsx` | Task stream page composition. |
| `frontend/app/layout.tsx` | Root layout, metadata, font, and app providers. |
| `frontend/app/providers/auth-provider.tsx` | `shortenAddress`, `AuthProvider`, `useAuth`. |
| `frontend/app/providers/query-provider.tsx` | `QueryProvider`. |
| `frontend/app/providers/theme-provider.tsx` | `ThemeProvider`, `useTheme`. |
| `frontend/app/api/games/route.ts` | `readNumber`, `readFilters`, `isGameCategory`, `createThumbnail`, `mapCatalogGame`, `catalogQuery`, `fetchCatalogProviders`, `fetchCatalogGames`, `GET`. |
| `frontend/app/api/track/click/route.ts` | `POST` click proxy/fallback handler. |
| `frontend/app/api/auth/session/route.ts` | `GET` session handler. |
| `frontend/app/api/explorer/route.ts` | `GET` explorer data handler. |
| `frontend/app/api/metrics/stream/route.ts` | `GET` metrics SSE handler and internal `send` callback. |
| `frontend/app/api/tasks/stream/route.ts` | `GET` task SSE handler and internal `send` callback. |
| `frontend/components/auth/auth-panel.tsx` | `AuthPanel`. |
| `frontend/components/dashboard/*` | `DashboardShell`, `ExplorerPanel`, `GovernancePanel`, `MetricsRibbon`, `TaskStreamPanel`. |
| `frontend/components/games/*` | `FilterSidebar`, `GameCard`, `trackClick`, `getQueryParam`, `getSessionID`, `GameGrid`, `GameLobby`, `SearchBar`. |
| `frontend/components/network/force-network-graph.tsx` | `ForceNetworkGraph` and internal force-layout loop helpers. |
| `frontend/components/protocol/*` | `DeveloperEntry`, `EcosystemList`, `GovernancePanel`, `Hero`, `MetricsPanel`, `NetworkGraph`, `ProtocolSection`. |
| `frontend/components/ui/*` | `Badge`, `Button`, `Card`, `CardHeader`, `CardTitle`, `CardDescription`. |
| `frontend/hooks/*` | `useDebouncedValue`, `useGames`, `useMetricsStream`, `useTaskStream`. |
| `frontend/lib/api.ts` | `buildGamesQuery`, `fetchGames`. |
| `frontend/lib/dashboard-data.ts` | `iso`, `createMetricSnapshot`, `createTaskEvent`. |
| `frontend/lib/games-data.ts` | `createThumbnail`, `getFilterOptions`, `getGames`. |
| `frontend/lib/utils.ts` | `cn`, `formatNumber`, `formatCompact`, `formatLatency`. |
| `sdk/typescript/src/index.ts` | `ZeazClient`, `version`, `negotiate`, `peers`, `announcePeer`, `currentVersion`, `kinds`. |

## Documentation update checklist by source change

- [ ] If an HTTP route, request field, response, status code, or middleware behavior changes, update `docs/api.md`, `docs/architecture.md`, and the public endpoint list in `README.md` when applicable.
- [ ] If a database table, view, migration, COPY column, index, seed, cache key, or retention behavior changes, update `docs/data-model.md` and `docs/operations.md`.
- [ ] If an environment variable, default, timeout, scaling setting, container, Compose service, Kubernetes manifest, or run command changes, update `docs/operations.md`, `frontend/README.production.md`, or `docs/zeaz-validator-architecture.md` as applicable.
- [ ] If auth, token, tenant, policy, rate-limit, privacy, compliance, or secret handling changes, update `docs/security-compliance.md`.
- [ ] If frontend pages, server routes, stream payloads, proxy/fallback behavior, build options, or runtime variables change, update `docs/frontend.md`.
- [ ] If ZEAZ message kinds, envelope signing, ledger rules, governance, discovery, consensus, staking, settlement, node endpoints, SDK behavior, protobuf IDL, or feature flags change, update `docs/zeaz-protocol.md` and `docs/protocol/v1.0.0/*`.
- [ ] If experimental autonomous logic is promoted toward production mutation, update `docs/architecture.md`, `docs/security-compliance.md`, and add operations rollback/dry-run notes before enabling it.
- [ ] If source files are added, renamed, or removed, update this source coverage checklist so reviewers can audit full-source claims against the actual tree.
