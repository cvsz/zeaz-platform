# Cloudflare Monthly Governance Evidence — Phase 15

> **GOVERNANCE LAYER ONLY** — This document is a template for monthly evidence capture.
> Complete one copy per month. Store completed copies in the Phase 16 evidence archive
> (`docs/infra/evidence/cloudflare/YYYY/MM/`) when Phase 16 is implemented.
>
> **All example values in this template are sanitized placeholders.**

---

## Monthly Evidence Template

Copy and fill this template at the end of each calendar month.

---

### Header

| Field | Value |
|---|---|
| **Period Covered** | `YYYY-MM-01` to `YYYY-MM-DD` |
| **Report Prepared By** | `<ROLE_NAME>` (do not use personal names) |
| **Report Date** | `YYYY-MM-DD` |
| **Review Board Meeting Date** | `YYYY-MM-DD` |
| **Quorum Met?** | Yes / No |
| **Roles Present** | (list role names only) |

---

### Scanner Output Reference

List all scanner runs performed this month. Link to output files where available.

| Scanner | Run Date | Output File | Status |
|---|---|---|---|
| `validate-cloudflare-config.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |
| `check-secret-leaks.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |
| `scan-tunnel-configs.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |
| `scan-dns-ownership.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |
| `scan-workers-routes.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |
| `scan-workers-edge-bindings.sh` | `YYYY-MM-DD` | `(path or N/A)` | PASS / FAIL / SKIP |

---

### Unresolved Drift Items

List all open drift items at end of month. Reference `docs/infra/cloudflare-drift-report.md`.

| Drift ID | System Area | SLA Class | Aging Bucket | Owner | Status | Days Open | Blocker |
|---|---|---|---|---|---|---|---|
| `CF-DRIFT-YYYY-NNN` | DNS / Tunnel / Worker / IaC | Critical / High / Medium / Low | Fresh / Aging / Stale / Overdue | `<ROLE>` | OPEN / IN_PROGRESS / ESCALATED | N | (description or N/A) |

**Total open items:** `N`
**SLA breaches this month:** `N`
**Items resolved this month:** `N`

---

### Drift Aging Statistics

| Aging Bucket | Count at Start of Month | Count at End of Month | Change |
|---|---|---|---|
| Fresh (0–7 days) | 0 | 0 | 0 |
| Aging (8–14 days) | 0 | 0 | 0 |
| Stale (15–30 days) | 0 | 0 | 0 |
| Overdue (31+ days) | 0 | 0 | 0 |
| **Total** | **0** | **0** | **0** |

---

### Accepted Exceptions

List all currently approved exceptions. Reference `docs/infra/cloudflare-drift-exception-register.md`.

| Exception Drift ID | System Area | Owner | Risk Level | Approved Date | Expiry Date | Days Until Expiry | Renewal Needed? |
|---|---|---|---|---|---|---|---|
| `CF-DRIFT-YYYY-NNN` | `(area)` | `<ROLE>` | Low / Medium | `YYYY-MM-DD` | `YYYY-MM-DD` | N | Yes / No |

**Total active exceptions:** `N`

---

### Expired Exceptions

List exceptions that expired this month (must be resolved or renewed).

| Exception Drift ID | System Area | Owner | Expiry Date | Action Taken | New Status |
|---|---|---|---|---|---|
| (none this month) | — | — | — | — | — |

---

### Changes Approved/Rejected This Month

| Change ID | Description | Risk Level | Decision | Decision Date | Approvers |
|---|---|---|---|---|---|
| `CF-YYYY-MM-NNN` | (one-line description, no secrets) | Low / Medium / High | APPROVED / REJECTED / CONDITIONAL | `YYYY-MM-DD` | (list roles) |

---

### Owner Sign-Off Table

Each role must sign off on the monthly evidence before it is filed.

| Role | Name/ID | Sign-Off Date | Status |
|---|---|---|---|
| Cloudflare Runtime Owner | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |
| DNS Owner | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |
| Worker Owner | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |
| Terraform Owner | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |
| Security Reviewer | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |
| Release Approver | `<ROLE_ID>` | `YYYY-MM-DD` | SIGNED / PENDING / ABSENT |

**Quorum for this month's sign-off:** `N of 6 roles signed`

---

### Summary Narrative

> Complete this section in free text after the evidence table is filled.

**Drift status:** (brief summary — e.g., "2 items resolved, 1 new item detected, no SLA breaches")

**Security status:** (brief summary — e.g., "No secret leaks detected. Gitleaks passed.")

**Exception status:** (brief summary — e.g., "1 exception renewed, 0 expired, 0 new exceptions")

**Changes this month:** (brief summary — e.g., "1 DNS update approved, 0 production changes rejected")

**Action items for next month:**
- (list action items with owner role and target date)

---

### Filing Instructions

When complete, store this filled document at:
```
docs/infra/evidence/cloudflare/YYYY/MM/monthly-governance-evidence-YYYY-MM.md
```

Update the evidence index at:
```
docs/infra/evidence/cloudflare/index.md
```

(Phase 16 evidence archive structure)

---

## Related Documents

- `docs/infra/cloudflare-runtime-drift-sla.md` — SLA classes and aging buckets (Phase 15)
- `docs/infra/cloudflare-ownership-review-board.md` — Review board charter (Phase 15)
- `docs/infra/cloudflare-drift-exception-register.md` — Exception register (Phase 15)
- `docs/infra/cloudflare-drift-report.md` — Active drift tracking
- `docs/infra/cloudflare-change-evidence-archive.md` — Evidence archive model (Phase 16, future)
