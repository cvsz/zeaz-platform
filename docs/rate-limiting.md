# Workers Rate Limiting

The Workers edge layer implements token-bucket controls for AI routes and publishing routes.

## Backends

1. **KV token bucket** (`workers/shared/kv-rate-limit.ts`): globally distributed, eventually consistent, low-cost baseline.
2. **Durable Object limiter option** (`workers/shared/durable-rate-limit.ts`): strongly consistent option for high-risk operations.

## Quotas

- AI generation quotas.
- Publishing quotas.
- Abuse throttling for hot paths.
- Per-user + per-route buckets.

## Logging

All gateway decisions are emitted as structured JSON with fields: `ts`, `service`, `event`, `level`, route metadata, principal (`sub`), and remaining tokens.
