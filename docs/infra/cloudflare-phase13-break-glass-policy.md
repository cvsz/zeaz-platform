# Cloudflare Phase 13 — Break-Glass Policy

## Purpose
Define the formal policy for emergency Cloudflare break-glass actions.

## Scope
This policy covers any emergency manual intervention into Cloudflare infrastructure including DNS, Tunnel, Worker routes, and Terraform/OpenTofu configurations.

## Non-Goals
This policy does not cover routine releases or standard rollbacks, which are handled by Phase 12.

## Read-Only Phase Boundary
Phase 13 does not authorize emergency execution. Phase 13 does not perform rollback. Phase 13 does not deploy. Phase 13 does not run Terraform/OpenTofu apply. Phase 13 does not run Wrangler deploy. Phase 13 only validates that break-glass governance and rollback evidence requirements exist before any future human-controlled emergency action.

## Emergency Definition
An emergency is a critical production incident that requires immediate intervention outside of the standard release process to prevent or mitigate severe business impact.

## Break-Glass Preconditions
- Break-glass is for emergency human-controlled action only.
- Break-glass requires emergency justification.
- Break-glass requires rollback plan.
- Break-glass requires post-incident review.

## Required Human Owner
- Break-glass requires named owner.

## Required Approvers
An authorized approver must validate the emergency action.

## Required Runtime Evidence
- Break-glass requires runtime evidence snapshot before action.

## Required Rollback Evidence
Emergency rollback plans and conditions must be established prior to executing changes.

## Secret Handling Requirements
- Break-glass must not bypass secret safety.

## DNS Emergency Rules
DNS records must only be manually mutated if the existing CI deployment process is unavailable or causing the incident.

## Worker Route Emergency Rules
Worker deployments or route updates must not proceed without a prior snapshot of affected configurations.

## Tunnel Emergency Rules
Tunnel credentials and routes must be securely verified before being restarted or recreated manually.

## Terraform/OpenTofu Emergency Rules
State files must be protected. Emergency apply must document the exact scope of targeted resources.

## Wrangler Emergency Rules
Wrangler rollback/deploy must not expose secrets.

## Allowed Manual Actions
Manual actions are restricted to actions verified and required for resolving the defined emergency.

## Disallowed Actions
- Break-glass must not bypass ownership model.
- Break-glass must not be automated by CI.
- Break-glass must not run from pull_request workflows.

## Emergency Stop Conditions
Define the specific metrics, monitoring, or time threshold at which the manual action will be aborted or rolled back.

## Audit Trail Requirements
All actions taken during the break-glass event must be securely logged and captured.

## Post-Incident Review Requirements
A post-incident review must be completed.

## Future Phase Handoff
Changes performed during break-glass must be reconciled back into IaC and standard CI pipelines during the post-incident phase.
- Break-glass actions must reference Phase 14 baseline before emergency manual action.
- Emergency ownership deviation must produce post-incident baseline review.
