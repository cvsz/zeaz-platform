# Cloudflare Phase 12 Rollback Plan

## Purpose
Provides a structured rollback plan to quickly mitigate and recover from failed Cloudflare infrastructure deployments.

## Rollback Scope
- Reverting DNS changes.
- Restoring Worker route associations and code deployments.
- Restoring Tunnel configurations.
- Reverting Terraform/OpenTofu state changes.

## Rollback Owner
- Designated deployment operator or on-call engineer.

## Rollback Triggers
- Critical system errors, 5xx rate spikes, missing DNS resolution, or leaked secrets.

## Rollback Preconditions
- Access to the target systems via Cloudflare CLI or Dashboard.
- Commit hash of the previous known stable state.

## Rollback Evidence Required
- Logs confirming return to normal operations and successful reversion of configuration.

## DNS Rollback Notes
- Rollback typically involves manually removing or editing the errant DNS record, or applying the previous Terraform state.

## Worker Route Rollback Notes
- Use Wrangler to rollback deployment or manually detach the worker from the errant route.

## Tunnel Rollback Notes
- Restart cloudflared with the previous working configuration or rollback the Terraform state managing it.

## Terraform/OpenTofu Rollback Notes
- `git revert` the pull request and run `terraform plan` followed by `terraform apply` to reinstate the old state.

## Wrangler Rollback Notes
- Use `wrangler deployments rollback <id>` or redeploy the last stable commit.

## Secret Safety Notes
- Ensure rollback does not inadvertently leak secrets.
- If a secret was compromised, it MUST be rotated immediately. Rollback is not enough.

## Validation After Rollback
- Re-run preflight checks and monitor metrics.

## Post-Rollback Report
- Write an incident report detailing the failure and the rollback steps taken.

## Phase 13 Emergency Rollback Evidence
- planned rollback remains Phase 12
- emergency rollback evidence is Phase 13
- emergency rollback requires incident evidence
- rollback execution remains manual
- no automated rollback from CI

This document does not contain secrets.
This document does not contain live credentials.
This document does not contain exact production-only config copies.
Rollback execution must be manual and separately approved.
