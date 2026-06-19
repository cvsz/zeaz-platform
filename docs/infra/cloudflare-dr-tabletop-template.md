# Cloudflare DR Tabletop Exercise Template

## Instructions
This template is used to conduct theoretical simulations of Cloudflare runtime failures. Fill in all fields for each scenario being exercised.

---

## Exercise Meta
- **Exercise ID**: `<DR-TT-YYYYMMDD>`
- **Date**: `<YYYY-MM-DD>`
- **Participants**: `<NAMES>`
- **Facilitator**: `<NAME>`

---

## Scenario 1: DNS Misroute
- **Scenario ID**: DR-SC-01
- **Trigger Condition**: Production traffic for `app.zeaz.dev` is routing to `dev-origin.internal`.
- **Detection Method**: External synthetic monitoring (Uptime) reports 404/500 errors; user reports.
- **Impact Assessment**: Users cannot access the primary application; potential exposure of internal service.
- **Immediate Containment steps [MANUAL]**:
  1. Verify current DNS record in Cloudflare Dashboard (Read-only).
  2. Locate last known good configuration in git history.
- **Recovery steps [MANUAL]**:
  1. Authorize emergency DNS revert (Owner sign-off).
  2. Apply fix via verified repository state (Phase 13 path).
- **Verification steps**:
  1. Run `dig app.zeaz.dev` to confirm IP/CNAME.
  2. Verify application accessibility via browser.
- **Evidence required**:
  1. Screenshot of corrected DNS record.
  2. Monitoring dashboard showing recovery.
- **Lessons learned**: `<NOTES>`
- **Owner sign-off**: `<NAME>`

---

## Scenario Template (Blank)

- **Scenario Name**: `<SCENARIO_NAME>`
- **Scenario ID**: `<ID>`
- **Trigger Condition**: `<WHAT_CAUSES_THIS>`
- **Detection Method**: `<HOW_WE_KNOW>`
- **Impact Assessment**: `<SERVICES_USERS_DATA>`
- **Immediate Containment steps [MANUAL]**: `<STEPS>`
- **Recovery steps [MANUAL]**: `<STEPS>`
- **Verification steps**: `<STEPS>`
- **Evidence required**: `<STEPS>`
- **Lessons learned**: `<NOTES>`
- **Owner sign-off**: `<NAME>`

---

## DR Scenarios Registry

| ID | Name | Trigger |
|----|------|---------|
| DR-SC-01 | DNS misroute | DNS routes to wrong service |
| DR-SC-02 | Worker route collision | Overlapping Worker patterns break service |
| DR-SC-03 | Tunnel outage | Tunnel disconnects or service stops |
| DR-SC-04 | Credential leak | API or Tunnel token exposure |
| DR-SC-05 | Terraform state drift | Divergence between state and runtime |
| DR-SC-06 | Access policy lockout | Legit users blocked by Zero Trust |
| DR-SC-07 | Production rollback | Emergency change reversal needed |
| DR-SC-08 | Evidence archive unavailable | Audit trail inaccessible |
