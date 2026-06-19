# Cloudflare Phase 12 Manual Release Runbook

## Purpose
Define the process and strict requirements for manually releasing Cloudflare changes, ensuring no change bypasses the governance structure.

## Scope
This runbook covers any change to Cloudflare infrastructure via Terraform, OpenTofu, Wrangler, or direct API manipulation.

## Non-Goals
- Automated CI/CD deployments.
- Circumventing the review process.
- Executing actual Cloudflare changes.

## Read-Only Boundary
This runbook and associated tools strictly observe a read-only boundary.

## Required Inputs
- Approved pull request.
- Release candidate commit hash.
- Filled approval evidence document.

## Required Preflight Gates
- CI PR Gates (Phase 10) must pass.
- Release Readiness (Phase 11) must pass.
- Manual Release Approval (Phase 12) checks must pass structurally.

## Required Human Approvals
- Explicit approval by an authorized infrastructure or production owner.
- Signature required in the evidence document.

## Change Window Requirements
- Changes must be deployed inside an officially declared change window (typically Tue-Thu, 09:00-16:00 Asia/Bangkok time), unless an emergency override is granted.

## Runtime Ownership Requirements
- Live Cloudflare environment acts as the source of truth unless actively migrated via approved tooling.

## DNS Ownership Requirements
- All DNS records must be documented with no unresolved conflicts.

## Worker Route Ownership Requirements
- All Worker routes must have clear, documented ownership.

## Tunnel Ownership Requirements
- All active tunnels must be cataloged and accounted for.

## Terraform/OpenTofu Requirements
- Terraform and OpenTofu plans must be clean and statically validated. No execution is performed by these scripts.

## Wrangler Requirements
- Wrangler deployments must be explicit and manually triggered after the checklist is verified.

## Secret Handling Requirements
- Secrets must never be printed, exposed, or committed to the repository.

## Rollback Requirements
- A comprehensive rollback plan must be in place before any deployment.

## Manual Release Checklist
- Completion of the `docs/infra/cloudflare-phase12-approval-evidence.md` file.

## Emergency Stop Conditions
- In the event of a secret leak, unexpected traffic drop, or critical alert, stop all deployments and initiate rollback immediately.

## Post-Change Evidence
- After manual deployment, updated state or evidence must be collected in a subsequent PR if requested.

## Phase 13 Handoff — Break-Glass and Runtime Rollback Evidence
- normal change windows remain Phase 12
- emergency/break-glass governance moves to Phase 13
- Phase 13 requires runtime rollback evidence
- Phase 13 still requires manual human approval
- Phase 13 does not execute rollback

Phase 12 does not authorize deployment.
Phase 12 does not run deployment.
Phase 12 does not run Terraform/OpenTofu apply.
Phase 12 does not run Wrangler deploy.
Phase 12 only validates that release approval evidence exists before any future manual change.
