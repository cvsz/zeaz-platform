# Cloudflare CI PR Gates (Phase 10)

## Scope
Enforce strict CI PR gates for all Cloudflare-related configuration changes. This ensures safety and prevents uncontrolled deploys or modifications.

## Non-goals
- Deploying Cloudflare resources automatically.
- Implementing automatic terraform apply.

## Required PR checks
All PRs modifying files in `infra/cloudflare/`, `docs/infra/`, `terraform/`, `opentofu/`, `workers/`, `.github/workflows/`, `scripts/workflow-policy.sh`, or `Makefile` must pass the `cloudflare-pr-gates` workflow.

## Forbidden CI operations
- No `wrangler deploy` in PR workflows.
- No `terraform apply` or `tofu apply` in PR CI.
- No `terraform destroy` or `tofu destroy` in PR CI.
- No Cloudflare mutating API calls (POST/PUT/PATCH/DELETE).

## Allowed read-only operations
- Cloudflare scanners (`check-secret-leaks.sh`, `scan-dns-ownership.sh`, `scan-workers-routes.sh`, `check-wrangler-examples.sh`).
- Terraform `fmt` and `validate`.
- Workflow policy checks.

## Workflow policy
- All security/cloudflare gates must not use `continue-on-error: true`.
- Triggers must use `main`, not `master`.

## Secret redaction policy
- No tokens or credentials may be printed in CI logs.
- Secrets must not be committed.

## Worker/DNS/Tunnel gate matrix
- DNS ownership: Scanned and validated offline.
- Worker routes: Checked against canonical sources.
- Wrangler examples: Must contain placeholders, not live IDs.

## Merge checklist
- All scanners pass in CI.
- Required manual reviews are completed.
- No secrets exposed.
- Dry run validation succeeded.

## Emergency/manual workflow isolation
Manual execution of `terraform apply` or Cloudflare mutation commands must be isolated to `workflow_dispatch` triggers with production environment protections. They must never run in PR or push contexts.

## Phase 14 Runtime Baseline Gate
- Runtime baseline gate.
- Ownership lockfile validation.
- Baseline diff report.
- PR requirements before ownership changes.
- No deploy/apply authorization.
