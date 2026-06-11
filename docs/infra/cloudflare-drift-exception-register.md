# Cloudflare Drift Exception Register — Phase 15

> **GOVERNANCE LAYER ONLY** — This document does not authorize deployment, apply, or Cloudflare mutation.
> All exceptions listed require Review Board approval before becoming active.
>
> **All example entries in this document use sanitized placeholder values only.
> No real tunnel IDs, credentials, hostnames, or tokens appear as actual data.**

---

## Purpose

The exception register tracks all Cloudflare runtime drift items that have been **formally approved for deferral** beyond their normal SLA resolution window. An accepted exception acknowledges that a known drift exists and has been reviewed, risk-assessed, and approved with a defined expiry date.

Exceptions do not mean drift is acceptable permanently — they are time-bounded deferrals with required renewal or closure.

---

## Exception Register

| Drift ID | System Area | Owner | Reason | Risk Level | Approval Status | Expiry Date | Next Review | Closure Evidence |
|---|---|---|---|---|---|---|---|---|
| `CF-DRIFT-EXAMPLE-001` | Tunnel | Cloudflare Runtime Owner | Orphaned credential file pending cleanup ticket; no active session | Low | APPROVED | `YYYY-MM-DD` | `YYYY-MM-DD` | `docs/infra/evidence/cloudflare/CF-YYYY-MM-NNN/` |
| `CF-DRIFT-EXAMPLE-002` | DNS | DNS Owner | Legacy DNS record kept for backward compatibility with external dependency | Medium | PENDING | `YYYY-MM-DD` | `YYYY-MM-DD` | (not yet filed) |
| `CF-DRIFT-EXAMPLE-003` | IaC | Terraform Owner | Duplicate backend example file; rename scheduled in next sprint | Low | APPROVED | `YYYY-MM-DD` | `YYYY-MM-DD` | `docs/infra/evidence/cloudflare/CF-YYYY-MM-NNN/` |

> All rows above are sanitized examples. Replace with real entries when exceptions are raised.

---

## Exception Field Definitions

| Field | Description | Required |
|---|---|---|
| **Drift ID** | Unique ID in format `CF-DRIFT-YYYY-NNN` | Yes |
| **System Area** | One of: DNS / Tunnel / Worker / IaC / Access / Secret | Yes |
| **Owner** | Role name of person responsible for this drift item | Yes |
| **Reason** | Business or technical reason for deferral (no secrets in this field) | Yes |
| **Risk Level** | One of: Low / Medium / High / Critical (from Phase 15 SLA doc) | Yes |
| **Approval Status** | One of: PENDING / APPROVED / REJECTED / EXPIRED / CLOSED | Yes |
| **Expiry Date** | Date when exception expires and must be renewed or closed (max 90 days) | Yes |
| **Next Review Date** | Date when board will review the exception status | Yes |
| **Closure Evidence** | Path to Phase 16 evidence archive entry, or `(not yet filed)` | Yes |

---

## Rules for Exceptions

### Maximum Duration
- Maximum exception window: **90 days** from approval date
- Critical risk items: maximum **14 days** (must escalate to resolution)
- No silent renewal — all renewals require board vote

### Approval Requirements
- Low risk: 3 of 6 board roles must approve
- Medium risk: 4 of 6 board roles must approve
- High risk: 5 of 6 board roles must approve (including Security Reviewer)
- Critical risk: Exceptions NOT allowed — must resolve or escalate

### What Cannot Be an Exception
- Active secret or credential exposure
- Live production traffic affected
- Access policy lockout
- Critical SLA class items

---

## Process: Adding an Exception

```
1. Owner detects or is assigned a drift item
2. Owner determines drift cannot be resolved within normal SLA
3. Owner raises exception request to review board:
   - Drift ID (create if not exists)
   - System area
   - Reason for deferral
   - Proposed expiry date (max 90 days)
   - Risk assessment
4. Board reviews at next meeting (or emergency session if High/Critical)
5. Board votes: APPROVE / REJECT
6. If APPROVED: entry added to register with expiry date
7. If REJECTED: drift must be resolved within original SLA
```

## Process: Renewing an Exception

```
1. Owner raises renewal request at least 7 days before expiry
2. Board reviews at monthly meeting
3. Vote required: same quorum as original approval
4. If renewed: expiry date updated, next review date set
5. If not renewed: drift reverts to original SLA class and must be resolved
```

## Process: Closing an Exception

```
1. Owner resolves the underlying drift
2. Scanner confirms no drift detected
3. Owner files closure evidence in Phase 16 archive
4. Board acknowledges at next meeting
5. Exception status set to CLOSED
6. Closure evidence path filled in register
```

---

## Active Exception Summary

> Update this section monthly as part of `docs/infra/cloudflare-monthly-governance-evidence.md`

| Total Exceptions | APPROVED | PENDING | EXPIRED | CLOSED |
|---|---|---|---|---|
| 0 | 0 | 0 | 0 | 0 |

> *(Replace with real counts when exceptions are registered)*

---

## Drift ID Format

New drift IDs must follow this format:

```
CF-DRIFT-YYYY-NNN
```

Where:
- `CF` — Cloudflare scope
- `DRIFT` — drift tracking category
- `YYYY` — four-digit year of detection
- `NNN` — sequential number padded to 3 digits (001, 002, ...)

Example: `CF-DRIFT-2025-001`

---

## Related Documents

- `docs/infra/cloudflare-runtime-drift-sla.md` — SLA classes and aging buckets (Phase 15)
- `docs/infra/cloudflare-ownership-review-board.md` — Review board charter (Phase 15)
- `docs/infra/cloudflare-monthly-governance-evidence.md` — Monthly evidence template (Phase 15)
- `docs/infra/cloudflare-drift-report.md` — Active drift tracking
- `docs/infra/cloudflare-change-evidence-archive.md` — Evidence archive model (Phase 16, future)
