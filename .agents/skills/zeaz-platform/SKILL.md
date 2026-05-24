---
name: zeaz-platform
description: Repo-specific Cloudflare platform delivery rules for secure, phase-scoped, validated changes.
---

# zeaz-platform Skill

Use this skill for any task in `zeaz-platform`. It replaces the old generic TypeScript guidance with the actual Cloudflare platform operating model for this repository.

## Source Of Truth

- Treat `AGENTS.md` as authoritative policy.
- Use this file as an execution checklist, not as a policy override.

## Activation Checklist

1. Identify the current phase (`F0` to `F12`) and keep changes phase-scoped.
2. Classify action type:
   - read-only research
   - local file mutation
   - external mutation (push, publish, paid API job, third-party change)
3. Run offline validation first; make API checks opt-in (`--api-check`).
4. Verify no secrets, IDs, tokens, or private key material are introduced.

## Non-Negotiable Safety Rules

- Never commit real secrets or production identifiers.
- Never invent Cloudflare IDs, provider metadata, tunnel IDs, or credentials.
- Never use global Cloudflare API key automation patterns.
- Never auto-run `terraform apply`/`tofu apply` on PR/push workflows.
- Never disable tests, scanners, or policy checks to hide failures.
- Never print full secret-bearing environment variables.
- Never use unsafe placeholders in implementation files:
  - `replace-me`
  - `changeme`
  - `dummy-secret`
  - `fake-token`

## External Action Boundary

- Networked tools are read-only by default.
- Require explicit user approval before posting/publishing/pushing/merging, dispatching remote agents, or mutating third-party resources.
- If approval is unclear, produce a local plan or draft artifact instead of taking the external action.

## Core Implementation Patterns

### Bash scripts (`scripts/`, `ops/`)

Start scripts with:

```bash
#!/usr/bin/env bash
set -Eeuo pipefail
IFS=$'\n\t'
```

Required behavior:
- `--help` support
- structured logging
- predictable exit codes
- safe temp-dir handling
- destructive/mutating confirmation guards (`CONFIRM_APPLY=yes`, etc.)

### Terraform/OpenTofu

- Keep module files complete: `providers.tf`, `versions.tf`, `variables.tf`, `outputs.tf`, `README.md`.
- Add variable type/description and validation where practical.
- Keep validation paths usable without real credentials when feasible.
- Keep `apply` manual and explicitly approval-gated.
- Never expose secrets through outputs.

### Python validators and utilities

- Default to offline validation.
- API interaction must be explicit and opt-in (`--api-check` style).
- Validate required env vars, enums, and format constraints without leaking secrets.

### Workers/Edge

- Use strict TypeScript.
- Include safe primitives for security headers, request IDs, structured logs, and safe JSON error responses.
- Do not use `eval`, `new Function`, or dynamic unsafe execution.

## Platform Guardrails

- Supported plans: `Free`, `Pro`, `Business`, `Enterprise`.
- Enterprise-only features must be plan-gated and non-breaking on lower tiers.
- No allow-all Access policy.
- Wildcard targets need explicit justification and tests.
- Finance policies (`app/pay/treasury/admin-wallet`) must be stricter than AI platform policies (`zveo/studio/analytics`).

## Required Environment Focus

Prioritize strict validation coverage for:
- Cloudflare identifiers and scoped tokens (`CF_*`)
- identity provider settings
- environment/region/domain settings
- origin and backend config
- secret rotation and plan tier controls

Keep token purpose separation explicit (`CF_DNS_TOKEN`, `CF_WORKERS_TOKEN`, `CF_ZT_TOKEN`, `CF_WAF_TOKEN`, `CF_TUNNEL_TOKEN`, `CF_R2_TOKEN`).

## Validation Workflow

Run the smallest relevant set first, then phase-specific checks:

```bash
make validate
make test
make validate-env
make tf-fmt-check
make tf-validate
```

Use additional commands as needed by phase:
- `make tofu-validate`
- `make workflow-policy`
- `make workflow-validate`
- `make gitops-validate`
- `make tunnel-validation`
- `make waf-validation`
- `make security-scan`

If a phase command is missing, add it only when that phase is being implemented.

## Commit And PR Conventions

- Keep commits phase-scoped when possible (for example `feat(f3): ...`).
- Keep pull requests reviewable and include:
  - phase implemented
  - files changed
  - validation commands run
  - security notes
  - rollback notes
  - manual setup requirements
  - known limitations

## Done Criteria

A change is done only when:
- implementation and docs are consistent
- no secrets or fake production IDs are committed
- relevant validations pass, or failures are documented with exact root cause
- apply/destroy flows remain guarded
- plan-gated behavior does not break lower tiers

Do not claim production readiness without validation evidence.
