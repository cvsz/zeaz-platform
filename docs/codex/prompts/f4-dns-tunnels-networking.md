# F4 — DNS, Tunnels, and Networking

## Objective

Implement DNS records, tunnel ingress, network policies, local origin rules, and validation with no committed tunnel secrets.

## Required context

- `AGENTS.md`
- `.codex/context.md`
- `docs/codex/master-meta-cloud-suite.md`
- Any phase-specific files in the write scope below

## Write scope

- `dns/`
- `tunnels/`
- `policies/`
- `docs/architecture/`
- `tests/`

## Safety requirements

- Keep changes limited to this phase unless the task explicitly documents a narrower cross-phase dependency.
- Preserve offline-first behavior and opt-in API checks.
- Do not add secrets, fake production identifiers, private key material, or production origin IPs.
- Keep apply, destroy, token rotation, remote publication, and production mutation manually guarded.
- Document plan-gated Cloudflare behavior without breaking lower-tier validation.

## Validation commands

- `make dns-validate`
- `make tunnel-validate`
- `make network-validate`
- `make networking-validate`

## Handoff output

Return a concise implementation summary, exact validation results, security notes, rollback notes, manual setup requirements, and known limitations.
