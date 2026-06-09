# F9 — Human Review and First Apply Readiness

## Objective

Prepare manual Cloudflare/GitHub setup docs, token scope checklists, preflight scripts, readiness reports, and operator handoff.

## Required context

- `AGENTS.md`
- `.codex/context.md`
- `docs/codex/master-meta-cloud-suite.md`
- Any phase-specific files in the write scope below

## Write scope

- `docs/`
- `scripts/`
- `tests/`

## Safety requirements

- Keep changes limited to this phase unless the task explicitly documents a narrower cross-phase dependency.
- Preserve offline-first behavior and opt-in API checks.
- Do not add secrets, fake production identifiers, private key material, or production origin IPs.
- Keep apply, destroy, token rotation, remote publication, and production mutation manually guarded.
- Document plan-gated Cloudflare behavior without breaking lower-tier validation.

## Validation commands

- `make readiness-validate`
- `make validate`

## Handoff output

Return a concise implementation summary, exact validation results, security notes, rollback notes, manual setup requirements, and known limitations.
