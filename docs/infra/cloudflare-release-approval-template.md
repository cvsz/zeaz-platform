# Cloudflare Release Approval Template — Phase 16

This document is the official release approval template for any Cloudflare changes. It must be filled out, approved, and archived under `docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/release-approval.md` prior to any manual deployment or production configuration update.

---

## 1. Change Metadata

| Field | Value |
|---|---|
| **Change ID** | `CF-YYYY-MM-NNN` |
| **Change Title** | [Brief descriptive title] |
| **System Area** | [e.g., DNS / Tunnel / WAF / Workers / Zero Trust] |
| **Change Owner** | [Name and role of primary developer/operator] |
| **Change Approver** | [Name and role of review board representative] |
| **Date & Time (UTC)** | YYYY-MM-DD HH:MM UTC |
| **Risk Level** | Low / Medium / High / Critical (according to Phase 17 scoring) |
| **Environment** | Dev / Staging / Production |
| **Rollback Plan Ref** | [Link to rollback runbook or document] |

---

## 2. Evidence Links

Provide absolute links to validation evidence in this repository:
- [CI Validation Report](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/ci-report.md)
- [Baseline Diff Output](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/baseline-diff.md)
- [Scanner Results](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/scanner-output.json)

---

## 3. Deployment Checklist

### Pre-Change Verification
- [ ] No secrets or real tokens exist in git index (`make validate` passes)
- [ ] No hardcoded tunnel names/secrets exist in the configurations
- [ ] Terraform/OpenTofu dry-run planning completed (`make zeaz-dev-plan` matches repo intent)
- [ ] Change window is active and approved by the Ownership Review Board

### Post-Change Verification
- [ ] All updated hostnames resolve correctly to the Cloudflare Tunnel endpoint
- [ ] Edge-gateway rate limits and JWT verification filters tested successfully
- [ ] Security scanners indicate zero new vulnerabilities or unmapped drift
- [ ] Post-release live verification report generated and archived

---

## 4. Sign-Off and Approvals

*By signing below, the owner and approver certify that this change has been validated offline, carries zero secret risks, and is approved for execution during the specified window.*

- **Change Owner Signature**: `_______________________` Date: `__________`
- **Change Approver Signature**: `_______________________` Date: `__________`

---

## 5. Sanitized Example (Filled Template)

Below is an example of a completed release approval for reference:

| Field | Value |
|---|---|
| **Change ID** | `CF-2026-06-001` |
| **Change Title** | Consolidate duplicate DNS subdomains to cloudflare-apps module |
| **System Area** | IaC / DNS |
| **Change Owner** | Cloudflare Platform Operator |
| **Change Approver** | Security Review Board Chair |
| **Date & Time (UTC)** | 2026-06-13 09:30 UTC |
| **Risk Level** | Medium |
| **Environment** | Production |
| **Rollback Plan Ref** | [Phase 13 Incident Rollback Runbook](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-phase13-incident-rollback-runbook.md) |

### Evidence Links (Example)
- [CI Validation Report (CF-2026-06-001)](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/2026/06/CF-2026-06-001/ci-report.md)
- [Baseline Diff Output (CF-2026-06-001)](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/2026/06/CF-2026-06-001/baseline-diff.md)
