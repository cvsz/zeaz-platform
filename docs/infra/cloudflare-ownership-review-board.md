# Cloudflare Ownership Review Board — Phase 15

> **GOVERNANCE LAYER ONLY** — This document does not authorize deployment, apply, or Cloudflare mutation.
>
> **Separation notice:**
> - **Live runtime facts** — derived from known runtime context (read-only reference)
> - **Repository intent** — board charter and governance structure
> - **Manual review actions** — all board actions require human decision

---

## Board Charter

The Cloudflare Ownership Review Board is the governance body responsible for:

1. Reviewing all unresolved Cloudflare runtime drift items
2. Approving or rejecting drift exceptions
3. Ensuring SLA compliance across all drift categories
4. Reviewing and signing off on production Cloudflare changes
5. Maintaining the long-term operating model for Cloudflare runtime governance

The board operates under the ZeaZ Platform governance sequence (Phases 10–23) and is the final escalation point for unresolved Critical and High drift items.

**The board does not have authority to deploy, apply, or mutate live Cloudflare configuration.
All board-approved actions must be executed by the appropriate owner as a separate human-controlled step.**

---

## Board Roles

### Cloudflare Runtime Owner
- **Responsibilities:** Overall runtime health of cloudflared tunnel, systemd service, and ingress config
- **Scope:** Tunnel connectivity, systemd unit, credential file safety
- **Quorum weight:** 1 vote
- **Primary escalation for:** Tunnel outage (SLA: Critical), tunnel ingress mismatch (SLA: High)

### DNS Owner
- **Responsibilities:** All DNS records for `*.zeaz.dev` and related domains
- **Scope:** DNS ownership matrix, consolidation plan, duplicate hostname resolution
- **Quorum weight:** 1 vote
- **Primary escalation for:** DNS misroute (SLA: Critical), DNS ownership conflict (SLA: High)

### Worker Owner
- **Responsibilities:** All Cloudflare Worker route definitions, bindings, and AI Gateway routes
- **Scope:** Worker route inventory, route overlap prevention, env tagging
- **Quorum weight:** 1 vote
- **Primary escalation for:** Worker route collision (SLA: Critical), undocumented routes (SLA: Medium)

### Terraform Owner
- **Responsibilities:** All Cloudflare Terraform/OpenTofu resource ownership, state management, and backend config
- **Scope:** Terraform ownership scan, state drift, provider/backend changes
- **Quorum weight:** 1 vote
- **Primary escalation for:** Terraform state divergence (SLA: High), duplicate backend config (SLA: High)

### Security Reviewer
- **Responsibilities:** Secret containment, credential hygiene, access policy review, risk scoring
- **Scope:** Gitleaks output, credential file safety, Phase 17 risk scoring
- **Quorum weight:** 1 vote (veto power on Critical security items)
- **Primary escalation for:** Credential leak or suspected leak (SLA: Critical), secret exposure (SLA: Critical)

### Release Approver
- **Responsibilities:** Final sign-off on production Cloudflare changes; go/no-go decisions
- **Scope:** Phase 20 production readiness review, Phase 12 release approval
- **Quorum weight:** 1 vote (blocking authority on High/Critical risk)
- **Primary escalation for:** All production changes requiring approval; SLA breach escalations

---

## Meeting Cadence

| Meeting Type | Frequency | Quorum Required | Agenda |
|---|---|---|---|
| **Drift Triage** | Weekly | 3 of 6 roles | Review new drift items; assign SLA and owner; update aging buckets |
| **Board Review** | Monthly | 4 of 6 roles | Review all open exceptions; approve/reject exception renewals; sign monthly evidence |
| **Quarterly Review** | Quarterly | 5 of 6 roles | Full governance audit; RACI review; Phase 22 scanner index review; next quarter planning |
| **Emergency Session** | On Critical drift or SLA breach | 2 of 6 roles + Release Approver | Immediate escalation only; decision logged within 24 hours |

---

## Quorum Requirements

| Decision Type | Minimum Quorum | Veto Authority |
|---|---|---|
| Accepting a drift exception | 3 of 6 roles | Security Reviewer (security-related items) |
| Approving a High-risk production change | 4 of 6 roles | Release Approver |
| Approving a Critical-risk production change | 5 of 6 roles | Release Approver + Security Reviewer |
| Closing a Critical drift item | 4 of 6 roles | None |
| Emergency board session | 2 of 6 roles + Release Approver | Release Approver |

---

## Voting and Sign-Off Process

1. **Proposal** — Any role may raise a drift item, exception, or change for board review
2. **Discussion** — Board members may request evidence, ask questions, or request additional review
3. **Vote** — Each role casts one vote: `APPROVE`, `REJECT`, or `ABSTAIN`
4. **Decision** — Decision recorded with timestamp, vote tally, and all voter roles
5. **Sign-off** — Approving roles sign the relevant evidence document (Phase 16 archive)
6. **Record** — Decision committed to monthly governance evidence document

All votes are documented by role name only — no personal names or email addresses are committed to the repository.

---

## Escalation Contacts

> **Note:** Do not commit personal names, email addresses, or phone numbers to this file.
> Use role-based contacts only. Actual contact resolution is handled out-of-band.

| Role | Contact Method | Escalation SLA |
|---|---|---|
| Cloudflare Runtime Owner | `<RUNTIME_OWNER_CONTACT>` | 1 hour for Critical; 4 hours for High |
| DNS Owner | `<DNS_OWNER_CONTACT>` | 1 hour for Critical; 4 hours for High |
| Worker Owner | `<WORKER_OWNER_CONTACT>` | 2 hours for Critical; 1 day for High |
| Terraform Owner | `<TERRAFORM_OWNER_CONTACT>` | 2 hours for Critical; 1 day for High |
| Security Reviewer | `<SECURITY_REVIEWER_CONTACT>` | 30 minutes for Critical |
| Release Approver | `<RELEASE_APPROVER_CONTACT>` | 30 minutes for Critical; 2 hours for High |

---

## Board Review Workflow

```
Drift detected by scanner or human observation
  ↓
Drift logged in cloudflare-drift-report.md
  ↓
SLA class assigned (Critical/High/Medium/Low) — Phase 15 SLA doc
  ↓
Owner assigned from board roles
  ↓
  ├── If Critical → Emergency Session within 24h
  ├── If High → Weekly Drift Triage
  ├── If Medium/Low → Monthly Board Review
  └── If deferring → Exception register entry required
          ↓
  Board reviews, votes, and signs off
          ↓
  Decision recorded in monthly governance evidence
          ↓
  Drift item closed or exception expiry set
```

---

## Related Documents

- `docs/infra/cloudflare-runtime-drift-sla.md` — SLA classes and aging buckets (Phase 15)
- `docs/infra/cloudflare-drift-exception-register.md` — Exception register (Phase 15)
- `docs/infra/cloudflare-monthly-governance-evidence.md` — Monthly evidence template (Phase 15)
- `docs/infra/cloudflare-production-readiness-review.md` — Production readiness (Phase 20, future)
- `docs/infra/cloudflare-final-operating-model.md` — Final operating model RACI (Phase 23, future)
