# Cloudflare Phase 13 — Runtime Rollback Evidence

## Incident Metadata
- Incident ID: PHASE13-TEMPLATE
- Incident title: Runtime rollback evidence template
- Date/time: `$(date)`
- Timezone: Asia/Bangkok
- Requested by: UNKNOWN
- Related PR: UNKNOWN
- Related commit: UNKNOWN

## Emergency Classification
Provide justification for why this incident requires break-glass or emergency rollback procedures.

## Runtime Snapshot Before Action
Record the exact status of the targeted resources.

## DNS Ownership Snapshot
- Affected DNS records: NONE

## Worker Route Ownership Snapshot
- Affected Worker(s): NONE

## Tunnel Ownership Snapshot
- Affected tunnel(s): NONE

## Terraform/OpenTofu Scope Snapshot
- Target resources scopes for rollback or apply.

## Wrangler Scope Snapshot
- Expected scope of Wrangler rollback/deploy.

## Secret Safety Confirmation
- Review any potential secrets exposure.

## Rollback Candidate
- Rollback candidate: REQUIRED

## Rollback Owner
- Emergency owner: REQUIRED
- Approver: REQUIRED

## Rollback Preconditions
List all systems and services that must be verified before proceeding.

## Rollback Trigger
What metric, alert, or manual action triggers this rollback plan.

## Rollback Execution Boundary
Describe the limits of what this manual rollback is permitted to change.

## Stop Conditions
Define conditions that mandate halting the rollback.

## Validation After Manual Action
- Validation status: PENDING

## Evidence Attachments
Links to logs, metrics, or command outputs.

## Decision
- Rollback decision: NOT_READY

## Post-Incident Review Link
- Post-incident review owner: REQUIRED
Link to PIR documentation.

---

### Phase 13 Checklist

- [ ] Emergency justification is documented.
- [ ] Named human owner is assigned.
- [ ] Runtime evidence snapshot exists.
- [ ] DNS ownership was reviewed.
- [ ] Worker route ownership was reviewed.
- [ ] Tunnel ownership was reviewed.
- [ ] Terraform/OpenTofu scope was reviewed.
- [ ] Wrangler scope was reviewed.
- [ ] Secret safety was confirmed.
- [ ] Rollback plan exists.
- [ ] Stop conditions are defined.
- [ ] Post-incident review is required.

### Phase 13 Confirmed Non-Actions

- [ ] Phase 13 did not run Wrangler deploy.
- [ ] Phase 13 did not run Terraform apply.
- [ ] Phase 13 did not run OpenTofu apply.
- [ ] Phase 13 did not run destroy.
- [ ] Phase 13 did not mutate Cloudflare.
- [ ] Phase 13 did not print secrets.
- [ ] Phase 13 did not commit credentials.
