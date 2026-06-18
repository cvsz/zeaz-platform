# Codex Max Full-Stack Generation Prompts for zVEO

This file contains copy/paste prompts for Codex Max or a similar repo-aware coding agent. The goal is to clean the existing zVEO monorepo and continue generating a production full-stack media orchestration platform without deleting the current architecture.

## Operating Rules for Every Codex Task

Use these rules at the top of every task prompt unless the task says otherwise.

```text
You are working inside the existing cvsz/zveo repository.

Hard rules:
- Do not rewrite the repository from scratch.
- Preserve the queue-first monorepo architecture already present in README.md.
- Prefer small, reviewable commits/PRs.
- Make changes directly in the repo.
- Keep TypeScript strict and production-ready.
- No pseudocode, no placeholder TODOs, no fake integrations hidden as production code.
- Keep provider/browser automation behind adapter boundaries only.
- Run the relevant build/typecheck/test commands before finishing.
- When tests cannot run because dependencies or external services are unavailable, explain exactly what was not run and why.
- Update docs when behavior, routes, env vars, ports, or scripts change.
```

## Repo Context Summary

zVEO is already a monorepo with:

```text
apps/api-gateway      Node.js TypeScript API gateway
apps/dashboard        Next.js operations dashboard
apps/render-worker    BullMQ render worker
packages/core         domain schemas, RBAC, logging, metrics, tracing
packages/contracts    shared API/job/workflow contracts
packages/queue-ts     BullMQ runtime published as @zveo/queue
packages/scene-graph  scene DAG compiler
packages/prompt-compiler provider prompt compiler
packages/media-pipeline FFmpeg/media planning layer
packages/db           Drizzle/Postgres schema mirror
infra/docker          local Postgres/Redis/MinIO/Prometheus/Grafana stack
```

Clean means: normalize naming, ports, scripts, docs, health endpoints, runtime versions, env examples, CI, and tests. Do not remove useful packages unless they are truly dead and references are removed safely.

---

# Prompt 1 — Repo Audit and Clean Plan

```text
Audit the current repository and produce a concrete cleanup plan before changing code.

Focus areas:
1. Package naming consistency between folders, package.json names, root scripts, imports, README, AGENTS.MD, and docs.
2. Node.js runtime version consistency across package.json, AGENTS.MD, Dockerfiles, compose, and docs.
3. API route consistency between API gateway and dashboard client.
4. Broken scripts or root scripts that reference missing packages.
5. Python compatibility packages that are still documented but not wired into Node full-stack flow.
6. Missing .env.example files.
7. Missing CI or weak CI.
8. Any hardcoded localhost ports that conflict with docker-compose.
9. Any production-readiness gaps that block a local demo.

Deliverables:
- A short markdown report in docs/repo-clean-audit.md.
- A prioritized checklist with Safe Now / Needs Decision / Later.
- Do not delete or rename anything yet.

Validation:
- Run `pnpm -r --filter "./packages/*" --filter "./apps/*" typecheck` if dependencies are installed.
- If not installed, run static file inspection and document the limitation.
```

---

# Prompt 2 — Normalize Runtime, Scripts, and Env

```text
Implement the Safe Now cleanup items from docs/repo-clean-audit.md related to runtime, scripts, and env only.

Scope:
- Align Node.js version across root package.json, AGENTS.MD, README.md, Dockerfiles, and docker-compose. Prefer Node.js 24 if package.json and current Docker images already use it.
- Create root .env.example with all required local variables.
- Create app-specific env examples if needed:
  - apps/api-gateway/.env.example
  - apps/dashboard/.env.example
  - apps/render-worker/.env.example
- Ensure root scripts use the actual workspace package names.
- Add root scripts:
  - dev
  - dev:api
  - dev:dashboard
  - dev:worker
  - build:all
  - typecheck:all
  - test:all
  - lint or lint:all only if lint config exists or is added.
- Do not add new frameworks unless needed.

Acceptance criteria:
- `pnpm install` should not fail from invalid workspace references.
- `pnpm build:foundation` should target packages that exist.
- `pnpm typecheck:foundation` should target packages that exist.
- README local setup remains accurate.
```

---

# Prompt 3 — Fix API/Dashboard Contract Mismatch

```text
Fix the dashboard-to-api contract mismatch and make the local dashboard work with the existing API gateway.

Current likely issue:
- API gateway exposes `/healthz` and `/readyz`.
- Dashboard client may call `/health` and parse `queue_depth`.

Implement:
1. Decide one canonical health contract and document it.
2. Prefer supporting both backward-compatible endpoints in API gateway if simple:
   - GET /healthz
   - GET /readyz
   - optionally GET /health as compatibility alias.
3. Return a dashboard-friendly JSON shape from health/ready endpoints, for example:
   `{ "status": "ok", "queueDepth": number | null, "correlationId": string }`.
4. Update apps/dashboard/lib/api.ts to call the canonical endpoint and parse the real schema.
5. Update dashboard UI labels if fields changed.
6. Update OpenAPI doc.
7. Add minimal tests for endpoint schema and dashboard parser where practical.

Acceptance criteria:
- API still exposes /healthz, /readyz, /metrics, /openapi.json.
- Dashboard no longer shows false degraded state just because it calls the wrong endpoint.
- Typecheck passes for api-gateway and dashboard.
```

---

# Prompt 4 — Add Production-Grade Local Auth Developer Flow

```text
Improve local developer auth without weakening production security.

Implement:
1. A documented way to generate a local service bearer token using AUTH_SHARED_SECRET.
2. Add a script such as `pnpm token:dev` or `pnpm --filter @zveo/api-gateway token:dev`.
3. The token payload should include subject, tenantId, roles, issued-at, and expiration.
4. Add .env.example notes explaining AUTH_SHARED_SECRET length and dev-only defaults.
5. Keep the API gateway strict: no unauthenticated workflow creation in production.
6. Add a curl example to README for POST /v1/workflows using the generated bearer token.

Acceptance criteria:
- A new developer can generate a token and submit a sample workflow locally.
- Token generation code is typed and tested.
- No secret is committed.
```

---

# Prompt 5 — Build End-to-End Local Demo Flow

```text
Create a minimal end-to-end local demo that exercises the real architecture without external provider credentials.

Scope:
- Use API gateway to submit a workflow.
- Compile scene graph through existing scene-graph package.
- Enqueue BullMQ render jobs through @zveo/queue.
- Render worker consumes jobs and uses the existing fake/simulated provider boundary.
- Worker writes deterministic fake S3 URI result or local/minio artifact metadata.
- Dashboard displays workflow/job status from API.

Implement:
1. Add a seed/sample workflow JSON under examples/workflows/basic-scene-graph.json.
2. Add a script `pnpm demo:submit` that posts it to the API with a dev token.
3. Add API read endpoints if missing:
   - GET /v1/workflows/:workflowId
   - GET /v1/workflows/:workflowId/jobs
   - GET /v1/jobs/:jobId
4. If database persistence is not wired, implement minimal persistence using Postgres/Drizzle; avoid in-memory-only state for API read endpoints unless explicitly marked dev-only.
5. Add dashboard pages/cards for recent workflows and jobs.

Acceptance criteria:
- `docker compose -f infra/docker/docker-compose.yml up --build` can run the stack.
- A user can submit the example workflow and see job status in dashboard.
- No external Veo/Google Flow credential is required for the demo.
```

---

# Prompt 6 — Database Persistence and Drizzle Wiring

```text
Wire the API gateway and render worker to PostgreSQL using the existing db/schema.sql and packages/db Drizzle schema.

Implement:
1. Ensure packages/db exports a typed DB client factory.
2. API gateway persists workflows, scene graphs, jobs, events, and audit records.
3. Queue enqueue happens inside a safe application-service flow after validation and persistence.
4. Worker updates job state on started, heartbeat/progress, completed, failed, and DLQ handoff.
5. Add migrations or align schema.sql and Drizzle schema if they diverge.
6. Add idempotency behavior for repeated workflow submissions.
7. Add tests for state transitions and duplicate submission handling.

Acceptance criteria:
- API read endpoints read from Postgres, not queue-only state.
- Invalid state transitions are rejected.
- Idempotency keys prevent duplicate scene jobs.
```

---

# Prompt 7 — Full Dashboard MVP

```text
Turn the dashboard into a useful operations UI for the full-stack MVP.

Implement pages/components:
1. Overview: API health, ready state, queue depth, workers, DLQ count, recent failures.
2. Workflows list: status, tenant, provider, scenes, createdAt, updatedAt.
3. Workflow detail: scene graph summary, jobs table, events timeline, artifacts.
4. Submit workflow: paste JSON, validate client-side, submit with configured bearer token for local dev.
5. DLQ view: failed jobs, error class, retry count, correlation ID, replay button placeholder disabled unless replay endpoint exists.

Rules:
- Use Next.js App Router and existing Tailwind stack.
- Keep UI clean and minimal; avoid adding a large component library unless already present.
- Dashboard API client should use Zod schemas.
- Do not expose secrets in client bundles.

Acceptance criteria:
- Dashboard works against docker-compose API gateway.
- Loading/error/empty states exist.
- Typecheck passes.
```

---

# Prompt 8 — Provider Adapter Layer for AI Video and Social Posting

```text
Add provider adapter boundaries for future real integrations while keeping the local demo safe.

Implement packages/providers or extend existing providers package with:
1. RenderProvider interface:
   - submitRender(job)
   - getRenderStatus(providerJobId)
   - cancelRender(providerJobId)
2. LocalSimulatedProvider implementation.
3. Optional HTTP provider base class with timeout, retry classification, circuit breaker hooks.
4. SocialPublisher interface:
   - publishVideo(asset, caption, target)
   - getPostStatus(postId)
5. FacebookPagePublisher stub/adapter boundary that reads PAGE_ID and token from env but is not enabled by default.
6. Never commit real credentials.
7. Update render-worker to load provider adapter by env var.

Acceptance criteria:
- Local demo uses simulated provider.
- Real providers can be added without touching core queue/domain logic.
- Provider errors are classified through existing error model.
```

---

# Prompt 9 — Media Pipeline Integration

```text
Integrate the media pipeline package into the main workflow lifecycle.

Scope:
- After render completion, plan media export using packages/media-pipeline.
- Generate export manifests for vertical 9:16 MP4 and optional captions/subtitles.
- Add API endpoint to request media pipeline planning if already documented.
- Persist media pipeline state and exported artifact metadata.
- Dashboard displays export manifests.

Acceptance criteria:
- POST /v1/workflows/{workflowId}/media-pipelines validates input, persists a plan, and returns deterministic export manifests.
- FFmpeg command planning is deterministic and does not execute unsafe shell strings directly.
- Tests cover basic export planning and validation failures.
```

---

# Prompt 10 — CI, Quality Gates, and Repo Hygiene

```text
Add GitHub Actions CI and repo hygiene for the monorepo.

Implement:
1. .github/workflows/ci.yml with jobs for:
   - pnpm install
   - build foundation packages
   - typecheck all TypeScript packages/apps
   - run package tests if present
   - Python tests if requirements files still exist
2. Add dependency caching for pnpm.
3. Add linting only if a lint config is committed.
4. Add a PR checklist template.
5. Add SECURITY.md and CONTRIBUTING.md if absent.
6. Expand .gitignore for Next.js, coverage, logs, env variants, local storage, Playwright outputs if applicable.
7. Ensure generated files are ignored where appropriate.

Acceptance criteria:
- CI can run on pull_request and push to main.
- CI commands match package.json scripts.
- README badges or CI note updated.
```

---

# Prompt 11 — Production Hardening Pass

```text
Perform a production hardening pass after the MVP works locally.

Focus:
1. Rate limits before expensive parsing.
2. Request body limits and JSON parse errors with safe responses.
3. Correlation IDs and traceparent on all API responses.
4. Structured audit events for allow/deny decisions.
5. Redis connection handling and graceful shutdown.
6. Postgres connection pooling.
7. Worker shutdown drains current jobs safely.
8. Provider circuit breakers and bulkheads are observable.
9. DLQ replay design is documented before any destructive replay endpoint is enabled.
10. Secret loading from files works in container/Kubernetes contexts.

Acceptance criteria:
- docs/runbooks/failure-recovery.md is updated.
- Grafana/Prometheus configs include the new metrics.
- No secret defaults are presented as production-ready.
```

---

# Prompt 12 — Final Full-Stack Acceptance Pass

```text
Run a final acceptance pass over the full-stack repo.

Tasks:
1. Start from a clean checkout.
2. Follow README setup exactly.
3. Run local stack with docker compose.
4. Submit the example workflow.
5. Confirm worker processes jobs.
6. Confirm dashboard shows workflow and job state.
7. Confirm metrics endpoint exposes API/queue/worker metrics.
8. Confirm OpenAPI matches implemented routes.
9. Confirm no references to removed or nonexistent packages remain.
10. Confirm docs explain local, staging, and production modes.

Deliverables:
- docs/acceptance-report.md with command outputs summarized.
- Fix issues found during acceptance.
- Leave the repo in a state where a reviewer can reproduce the demo.
```

---

## Recommended Execution Order

```text
1. Prompt 1  - Audit first
2. Prompt 2  - Runtime/scripts/env cleanup
3. Prompt 3  - API/dashboard contract fix
4. Prompt 4  - Dev auth flow
5. Prompt 6  - DB persistence
6. Prompt 5  - End-to-end demo
7. Prompt 7  - Dashboard MVP
8. Prompt 8  - Provider adapters
9. Prompt 9  - Media pipeline integration
10. Prompt 10 - CI/hygiene
11. Prompt 11 - Production hardening
12. Prompt 12 - Acceptance pass
```

## One-Shot Prompt If You Want Codex to Plan Before Coding

```text
Read README.md, AGENTS.MD, docs/phased-deliverables.md, docs/production-capabilities.md, package.json, pnpm-workspace.yaml, apps/api-gateway/src/server.ts, apps/dashboard/lib/api.ts, apps/render-worker/src/worker.ts, infra/docker/docker-compose.yml, and all package.json files.

Then produce a phased implementation plan to clean and complete this full-stack monorepo. Do not change files yet. The plan must identify exact files to edit, scripts to run, risks, and acceptance criteria. Keep the existing queue-first architecture. Do not propose deleting the repo or replacing it with a generic Next.js/Express app.
```
