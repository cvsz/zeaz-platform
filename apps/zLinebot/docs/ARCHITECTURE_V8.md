# zttlbots v9.0 — HARDENED + MONETIZATION + ZERO-TRUST

This revision hardens the platform around four real-world failure classes: billing correctness, multi-region consistency, LLM cost spikes, and marketplace isolation.

## 1) Financial-grade billing safety

- Idempotent usage ingestion (`ON CONFLICT DO NOTHING`).
- Double-entry ledger table for auditable debits/credits.
- Quota checks performed before LLM calls.

## 2) Multi-region consistency control

- Writes and critical reads route to primary region.
- Standard reads route to nearest replica.
- Global sortable request IDs (ULID) used for event identity.

## 3) LLM cost guardrails

- Per-tenant rate limiting.
- Max token cap bounded by plan limits.
- Circuit-breaker hook for spend spikes.
- Budget-aware cheap-model fallback policy.

## 4) Marketplace isolation

- WASM-based execution path for marketplace tools.
- Sandbox policy: no network, restricted FS, memory/CPU limits.

## 5) Zero-trust service plane

- Service mesh target: Istio mTLS (STRICT).
- Workload identity target: SPIFFE identifiers per tenant/service.

## 6) Confidential compute track

Sensitive operations (keys, billing, routing policies) should run in a TEE-capable boundary where possible.

## 7) Meta-master v3

Use `scripts/meta-master-v3.sh` to run a global protection loop:

- restart critical services,
- evaluate billing spike guards,
- trigger regional traffic shifts,
- react to Kafka lag with worker scaling hooks.

## 8) System guarantees

- Billing bugs: mitigated with idempotency + ledger.
- Multi-region bugs: mitigated with read/write discipline.
- Cost spikes: mitigated with quotas + guardrails.
- Marketplace attacks: mitigated with sandboxed execution.
- Internal breach risk: reduced via mTLS/SPIFFE roadmap.
