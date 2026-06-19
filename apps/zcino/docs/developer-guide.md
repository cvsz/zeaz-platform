# Developer Guide

## Repository layout

| Path | Purpose |
| --- | --- |
| `main.go` | Main Go API service composition and graceful shutdown. |
| `cmd/` | Additional binaries, including ZEAZ node, compliance, and analytics commands. |
| `internal/` | Go application packages for domain, services, repositories, transport, security, metrics, protocol experiments, and infrastructure adapters. |
| `migrations/` | PostgreSQL schema migrations and seed data. |
| `frontend/` | Next.js App Router application, components, hooks, server routes, and frontend package metadata. |
| `protocol/` | Protocol buffer definitions for task and interop contracts. |
| `sdk/` | Go and TypeScript SDK surfaces. |
| `docs/` | Architecture, API, operations, security, frontend, data model, and protocol documentation. |
| `infra/` | Local infrastructure and ZEAZ testnet assets. |
| `k8s/` | Kubernetes manifests for application and ZEAZ testnet deployment. |
| `policies/` | Rego policy assets. |

## Development workflow

1. Create a branch for the change.
2. Read relevant docs and package-level tests before editing.
3. Keep changes scoped to one concern where possible.
4. Update docs for API, data model, config, security, deployment, or protocol changes.
5. Run targeted tests first, then broader checks before committing.
6. Include migration and rollback notes for schema or operational changes.

## Backend commands

```bash
go test ./...
go run .
go run ./cmd/zeaznode
```

Use targeted package tests during development, for example:

```bash
go test ./internal/service ./internal/handler ./internal/transport
```

## Frontend commands

```bash
cd frontend
npm install
npm run typecheck
npm run build
npm run lint
```

The frontend package uses npm lockfiles. Avoid mixing package managers unless the repository intentionally changes package management policy.

## Testing strategy

| Area | Current test style | What to add for changes |
| --- | --- | --- |
| Domain/service logic | Go unit tests in adjacent packages. | Boundary cases, validation failures, concurrency/backpressure tests. |
| Handlers/transport | HTTP-focused tests for middleware and handlers. | Status codes, error envelopes, auth, rate limits, policy blocks. |
| Repositories | Repository tests where database dependencies can be satisfied. | Migration-backed integration tests for query changes. |
| Frontend | Type checking and Next.js build. | Component tests or Playwright coverage for meaningful UI changes. |
| Protocol | Go tests and versioned docs. | Compatibility vectors, SDK round-trips, validator rule tests. |

## Coding conventions

- Keep domain validation close to domain types.
- Keep HTTP parsing and status-code mapping in handlers.
- Keep infrastructure-specific code behind small interfaces when practical.
- Prefer context-aware calls for I/O.
- Do not introduce global mutable state unless it is part of a documented runtime primitive.
- Do not add try/catch blocks around imports.
- Make new migrations idempotent when practical and document backfill behavior.
- Add tests for policy, auth, tenancy, and rate-limit changes because regressions can have production security impact.

## Documentation requirements

Update these documents when making the following changes:

| Change type | Required docs |
| --- | --- |
| HTTP endpoint, request, response, or error behavior | `docs/api.md`, top-level `README.md` if public. |
| Database table, index, view, migration, retention, or cache ownership | `docs/data-model.md`, `docs/operations.md` for deployment/backfill notes. |
| Environment variable or deployment behavior | `docs/operations.md`, `frontend/README.production.md` for frontend-only changes. |
| Auth, policy, tenant, rate-limit, privacy, or secrets behavior | `docs/security-compliance.md`. |
| Frontend route, streaming behavior, build/runtime env | `docs/frontend.md`. |
| ZEAZ wire/protocol behavior | `docs/protocol/v1.0.0/*` and SDK docs where applicable. |
| Source files, functions, runtime options, or full-logic audit claims | `docs/source-checklist.md` plus the domain-specific docs above. |

## Pull request checklist

- [ ] Code compiles and targeted tests pass.
- [ ] API, data, security, and operations docs are updated when needed.
- [ ] Migrations are ordered and safe to apply once.
- [ ] New configuration has safe defaults and production guidance.
- [ ] Logs and metrics are sufficient for operating the change.
- [ ] Security-sensitive behavior includes negative tests.
- [ ] Rollback or mitigation path is described for production changes.
- [ ] `docs/source-checklist.md` is updated when source files, functions, runtime options, or full-logic coverage changes.
