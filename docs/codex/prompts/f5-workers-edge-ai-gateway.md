# F5 — Workers, Edge, and AI Gateway

## Objective

Implement strict TypeScript Workers foundations, AI Gateway policy, quotas, rate limiting, JWT hooks, and safe JSON errors.

## Required context

- `AGENTS.md`
- `.codex/context.md`
- `docs/codex/master-meta-cloud-suite.md`
- Any phase-specific files in the write scope below

## Write scope

- `workers/`
- `workers-ai/`
- `docs/ai/`
- `docs/security/`
- `tests/`

## Safety requirements

- Keep changes limited to this phase unless the task explicitly documents a narrower cross-phase dependency.
- Preserve offline-first behavior and opt-in API checks.
- Do not add secrets, fake production identifiers, private key material, or production origin IPs.
- Keep apply, destroy, token rotation, remote publication, and production mutation manually guarded.
- Document plan-gated Cloudflare behavior without breaking lower-tier validation.

## Validation commands

- `make workers-validate`
- `make ai-gateway-validate`
- `make edge-validate`

## Handoff output

Return a concise implementation summary, exact validation results, security notes, rollback notes, manual setup requirements, and known limitations.
