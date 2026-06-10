# Phase A + B + C + D Coordinated Migration Architecture

This migration program moves zLMS to a zero-trust runtime fabric with no downtime by layering controls behind canary gates instead of replacing legacy delivery paths in-place.

## Phase A: inventory, strict typing, and immutable build inputs

- Run `npm run audit:frontend-runtime` to inventory unsafe DOM sinks, legacy inline execution, mutable remote assets, and SSR blockers.
- Run `npm run codemod:frontend-runtime` to apply checked codemods for unsafe DOM sinks and jQuery-era mutation patterns.
- Run `npm run typecheck:frontend-runtime` to enforce strict TypeScript over the modernized runtime and isolation boundaries.
- Package artifacts by content digest only; mutable image tags and mutable remote-entry URLs are rejected by policy.

## Phase B: runtime middleware and browser enforcement

- `security/runtime/csp-engine.ts` issues a request-bound nonce pair, emits CSP violation telemetry, and applies strict browser headers.
- `security/runtime/trusted-types-enforcer.ts` installs a deny-by-default Trusted Types policy that blocks inline script creation and validates script URL origins.
- `security/runtime/runtime-middleware.ts` composes CSP, nonce validation, Trusted Types, attestation, memory integrity, eBPF, and Falco signals into a single request/runtime decision point.

## Phase C: isolation, WASM sandbox, and module federation

- `frontend/isolation/wasm-executor.ts` enforces a deny-by-default WASM execution envelope with SRI, bounded memory, bounded execution time, and capability validation.
- `frontend/isolation/federation-runtime.ts` and `frontend/isolation/remote-verifier.ts` require signed immutable remote manifests before any remote module is loaded.
- SSR migration remains backward compatible by keeping existing static/runtime paths live while guarded islands are progressively routed to verified runtime domains.

## Phase D: telemetry, autonomous response, and progressive delivery

- `security/runtime/telemetry-pipeline.ts` forwards normalized runtime events to OpenTelemetry and SIEM, derives behavioral-baseline anomalies, and invokes SOAR containment hooks on critical drift.
- `security/runtime/autonomous-response.ts` coordinates exploit containment, session invalidation, kill switches, rollback, and quarantine in an idempotent state machine.
- `k8s/runtime-security-fabric.yaml` deploys the runtime fabric with non-root execution, read-only root filesystems, resource limits, NetworkPolicy, and canary traffic labels.
- `.github/workflows/runtime-security-fabric.yml` gates pull requests with type checks, SARIF aggregation, SBOM/provenance evidence validation, and migration dry-run checks.

## Zero-downtime rollout order

1. Deploy telemetry-only report mode to 1% canary traffic.
2. Verify OpenTelemetry, SIEM, Falco, eBPF, and CSP report ingestion for 30 minutes without critical false positives.
3. Enable enforced CSP and Trusted Types for the canary while keeping legacy paths available behind routing labels.
4. Enable runtime attestation and immutable asset verification for the canary.
5. Increase canary to 10%, 25%, 50%, and 100% only when SLO error budget, CSP violations, attestation pass rate, and exploit findings stay within policy.
6. On regression, freeze canary, publish the previous signed manifest pointer, quarantine the failing runtime subject, and keep serving the last-known-good release.
