# Cloudflare Phase 11 — Runtime Release Readiness Gate

## Purpose
Ensure a read-only release readiness gate for Cloudflare infrastructure. This collects and validates local evidence that the repo is safe for a future manually approved release without deploying, applying, or mutating Cloudflare.

## Non-Goals
- Automated deployments
- Mutating live Cloudflare infrastructure
- Applying Terraform or OpenTofu automatically

## Read-Only Boundary
This gate and associated scripts only read from local files and optionally from Cloudflare read-only APIs. No writes are performed.

## Required Evidence
A generated evidence document summarizing the status of all validators, scanners, and policy checks.

## Required PR Gates
Phase 10 PR gates must pass before releasing.

## Runtime Ownership Requirements
Live environment acts as source of truth unless successfully migrated.

## DNS Requirements
DNS ownership must be fully documented and non-conflicting.

## Worker Route Requirements
Worker routes must be documented and correctly associated.

## Tunnel Requirements
Tunnel configurations must be inventoried.

## Terraform/OpenTofu Requirements
Terraform and OpenTofu plans must pass static validation without execution.

## GitHub Actions Requirements
Release workflows must not contain destructive or deploying commands.

## Secret Handling Requirements
Secrets must not be exposed, printed, or committed.

## Release Blockers
- Failed validation gates
- Leak of secrets
- Conflicting ownership

## Manual Approval Checklist
- Ensure `docs/infra/cloudflare-phase11-release-evidence.md` is updated and reviewed.
- Verify non-actions.

## Future Phase Handoff
Phase 12 will handle Manual Release Approval + Change Window Governance.

A future release is not ready unless:
- DNS ownership is documented.
- Worker routes are documented.
- Tunnel ownership is documented.
- No hostname has unresolved conflicting ownership.
- No PR workflow can deploy, apply, destroy, or mutate Cloudflare.
- Manual workflows are isolated behind workflow_dispatch.
- Secret scanner passes.
- Wrangler example hygiene passes.
- Terraform/OpenTofu validation passes without apply.
- Release evidence has been regenerated.
