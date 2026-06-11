# Cloudflare Phase 13 — Incident Rollback Runbook

## Purpose
Define the manual rollback runbook for future emergency incidents.

## Scope
This covers any critical infrastructure, DNS, Worker route, or Tunnel rollback required during an emergency incident.

## Non-Goals
This runbook does not cover standard (non-emergency) manual release rollbacks covered in Phase 12.

## Manual-Only Boundary
This runbook restricts rollback to human operators.
- rollback execution is not automated
- rollback requires separate human approval
- rollback must preserve runtime ownership evidence
- rollback must not expose tokens
- rollback must not copy exact live credentials into repo
- rollback must not bypass CI gates
- rollback must not run from pull_request workflow

## Emergency Intake
The process by which an emergency is reported and escalated to trigger this runbook.

## Required Evidence Before Rollback
Before proceeding with any manual rollback command, all Phase 13 rollback evidence templates must be filled.

## Runtime Snapshot Requirements
Operators must capture the exact Cloudflare runtime state of the affected services before initiating the rollback.

## DNS Rollback Review
Review and verify exactly which DNS records are to be altered or reverted.

## Worker Route Rollback Review
Review any Worker routes that will be affected by the rollback deployment.

## Tunnel Rollback Review
Review existing Tunnel status and ensure tunnel configurations will remain secure post-rollback.

## Terraform/OpenTofu Rollback Review
If using Terraform/OpenTofu to revert, ensure targeted apply is used, state file integrity is maintained, and blast radius is restricted.

## Wrangler Rollback Review
If using Wrangler to revert Workers, review `--dry-run` logs when possible, or check code diffs to be deployed.

## Secret Safety Review
Ensure no secrets, API keys, or tokens are logged to output or saved in history during rollback.

## Stop Conditions
Define the criteria under which the manual rollback should be immediately aborted.

## Manual Rollback Approval
Approval must be documented via PR or incident ticket.

## Manual Rollback Execution Boundary
Operators must only execute the commands required to mitigate the defined emergency.

## Validation After Manual Rollback
Verify that the incident has been resolved and the runtime matches the expected state.

## Communication Requirements
Ensure all stakeholders are informed of the break-glass action and the status of the rollback.

## Audit Trail
Save all terminal logs, commands, and outputs from the manual intervention securely.

## Post-Incident Review
Trigger the Phase 13 Post-Incident Review template to document the emergency response.

## Future Phase Handoff
Changes made manually must be codified and merged into the main line using standard CI/CD and Phase 12 governance.
