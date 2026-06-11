# Cloudflare Phase 12 Change Window Policy

## Purpose
To define the acceptable time frames for making Cloudflare infrastructure changes to minimize impact on end-users and ensure adequate support coverage.

## Allowed Change Windows
- Standard deployments are permitted from Tuesday to Thursday.
- 09:00 to 16:00 Asia/Bangkok time.

## Disallowed Change Windows
- Weekends (Saturday, Sunday)
- Fridays
- Public Holidays

## Required Notice
- Non-emergency changes require at least 24 hours of documented notice via pull request.

## Required Approvers
- At least one designated production owner.

## Required Evidence
- Phase 11 release readiness evidence must be present and passing.

## Timezone Policy
Asia/Bangkok

## Freeze Windows
- End-of-month and end-of-quarter freeze windows apply where no non-emergency changes are allowed.

## Emergency Changes
- Emergency changes bypassing the window must have the explicit "Emergency override" flag set and approved by a lead engineer.

## Rollback Window
- Changes must have sufficient time remaining within the allowed window to execute a full rollback if necessary.

## Audit Trail
- All approvals and windows must be recorded in the Phase 12 Approval Evidence document.

## Release Readiness Dependency
- Release Readiness (Phase 11) is a strict prerequisite for any change window usage.

## Future Phase Handoff
- Phase 13 covers Break-Glass Governance for extreme emergencies.

All production Cloudflare changes require a declared change window.
All production Cloudflare changes require rollback time inside the same window.
All production Cloudflare changes require Phase 11 release readiness evidence.
All production Cloudflare changes require explicit human approval.
