# Cloudflare Change Evidence Index Template — Phase 16

This document is a template for the master index file `docs/infra/evidence/cloudflare/index.md`. It keeps a running log of all Cloudflare platform modifications, reference tickets, and evidence directory links.

---

## Template Structure

Copy and paste the template below when initializing or updating the master index.

```markdown
# Cloudflare Change Evidence Index

This index tracks all Cloudflare change records executed on the ZeaZ Platform.

## Running Change Records

| Change ID | Date | Type | System Area | Owner | Status | Summary Link |
|---|---|---|---|---|---|---|
| [CHANGE-ID] | YYYY-MM-DD | [IaC / Routing / Worker / WAF / DNS / Access] | [e.g., DNS / Tunnel / Edge-Gateway] | [Role Name] | [OPEN / CLOSED / ABORTED] | [Summary](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/summary.md) |
```

---

## Sanitized Example Rows

Below are example rows demonstrating the correct classification and links for typical change scenarios. Do not include real credentials or secret metadata in these rows.

| Change ID | Date | Type | System Area | Owner | Status | Summary Link |
|---|---|---|---|---|---|---|
| `CF-2026-06-001` | 2026-06-13 | IaC / DNS | terraform/cloudflare-apps | DNS Owner | CLOSED | [Summary](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/2026/06/CF-2026-06-001/summary.md) |
| `CF-2026-06-002` | 2026-06-15 | Access | zero-trust/policies.yaml | Identity Owner | OPEN | [Summary](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/2026/06/CF-2026-06-002/summary.md) |
| `CF-2026-06-003` | 2026-06-18 | Worker | workers/edge-gateway | Worker Owner | OPEN | [Summary](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare/2026/06/CF-2026-06-003/summary.md) |

---

## Related Governance Documents

- [Cloudflare Change Evidence Archive](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-change-evidence-archive.md)
- [Cloudflare Evidence Retention Policy](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-retention-policy.md)
