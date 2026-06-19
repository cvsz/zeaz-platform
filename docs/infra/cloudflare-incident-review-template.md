# Cloudflare Incident Review Template — Phase 16

This document is the official post-incident review template. It must be filled out and archived under `docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/incident-review.md` (or in a standalone location if not related to a change) following any Cloudflare outage, unauthorized drift, or service disruption.

---

## 1. Incident Metadata

| Field | Value |
|---|---|
| **Incident ID** | `INC-YYYY-MM-NNN` |
| **Change ID** | `CF-YYYY-MM-NNN` (if triggered by a change; otherwise N/A) |
| **Discovered (UTC)** | YYYY-MM-DD HH:MM UTC |
| **Resolved (UTC)** | YYYY-MM-DD HH:MM UTC |
| **Severity** | Low / Medium / High / Critical |
| **System Area Affected** | [e.g., DNS Resolution / Access Auth / Tunnel Ingress] |
| **Incident Owner** | [Name and role of incident commander] |

---

## 2. Root Cause Analysis (RCA)

Provide a detailed explanation of:
- **What failed**: (e.g., misconfigured rate-limiting rule on API gateway)
- **Why it failed**: (e.g., rate limit threshold set too low for webhook payloads)
- **How it was discovered**: (e.g., Grafana latency alerts triggered)

---

## 3. Incident Timeline

List sequential actions taken from trigger to resolution:

| Time (UTC) | Action Description | Operator |
|---|---|---|
| HH:MM | Incident triggered / service disruption starts | System |
| HH:MM | Latency alert received by SRE on duty | Operator |
| HH:MM | Cause identified as WAF rule blockage | Operator |
| HH:MM | Rollback plan executed / rule reverted | Operator |
| HH:MM | DNS resolution and HTTP endpoints return to normal | System |

---

## 4. Impact Assessment

- **Affected Services**: [e.g., App portal, payment gateway]
- **Downtime Duration**: [e.g., 14 minutes]
- **Estimated API requests blocked**: [e.g., 2,500 requests]
- **Security Implications**: (e.g., data breach risk, credential leaks - Yes/No)

---

## 5. Remediation & Rollback

- **Was Rollback Used?**: Yes / No
- **Rollback Description**: (e.g., reverted git commit and applied previous config)
- **Rollback Verification Link**: [Link to verification logs]

---

## 6. Preventative Actions and Lessons Learned

Summarize lessons learned and define follow-up tasks:

| Action Item | Assigned Owner | Due Date | Status |
|---|---|---|---|
| Update WAF dry-run policy for staging env | WAF Owner | YYYY-MM-DD | OPEN |
| Add edge-gateway connection limit alert | SRE Owner | YYYY-MM-DD | OPEN |

---

## 7. Sanitized Example (Filled Template)

Below is an example of a completed incident review:

| Field | Value |
|---|---|
| **Incident ID** | `INC-2026-06-001` |
| **Change ID** | `CF-2026-06-003` |
| **Discovered (UTC)** | 2026-06-13 14:15 UTC |
| **Resolved (UTC)** | 2026-06-13 14:29 UTC |
| **Severity** | High |
| **System Area Affected** | Edge-Gateway Rate Limiting |
| **Incident Owner** | Lead SRE |

### Root Cause (Example)
Deploying `CF-2026-06-003` (edge-gateway update) applied a strict token-bucket rate limiter of 10 req/sec to `api.zeaz.dev/health`. This rate limit was immediately exhausted by internal monitoring checks, causing 429 errors for all health endpoints.

###Timeline (Example)
- **14:15 UTC**: GitOps pipeline automatically deployed the edge-gateway worker update.
- **14:17 UTC**: Prometheus alert triggered for `api.zeaz.dev` health checks.
- **14:22 UTC**: SRE analyzed logs, identifying the 429 status code.
- **14:25 UTC**: Rollback triggered (reverted edge-gateway worker to prior release).
- **14:29 UTC**: Monitoring returned to green status.
