# F3 — Zero Trust and Identity

## Objective

Implement Access apps, policies, SAML/OIDC shape, RBAC, MFA/session controls, and identity docs without allow-all policies.

## Required context

- `AGENTS.md`
- `.codex/context.md`
- `docs/codex/master-meta-cloud-suite.md`
- Any phase-specific files in the write scope below

## Write scope

- `zero-trust/`
- `policies/`
- `docs/security/`
- `tests/`

## Safety requirements

- Keep changes limited to this phase unless the task explicitly documents a narrower cross-phase dependency.
- Preserve offline-first behavior and opt-in API checks.
- Do not add secrets, fake production identifiers, private key material, or production origin IPs.
- Keep apply, destroy, token rotation, remote publication, and production mutation manually guarded.
- Document plan-gated Cloudflare behavior without breaking lower-tier validation.

## Validation commands

- `make policy-test`
- `make zero-trust-validate`
- `python3 -m pytest tests/`

## Handoff output

Return a concise implementation summary, exact validation results, security notes, rollback notes, manual setup requirements, and known limitations.
