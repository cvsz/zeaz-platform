# Cloudflare Risk Scorecard Template — Phase 17

Use this template before any Cloudflare-sensitive staging or production change. Store the completed scorecard in the Phase 16 evidence archive:

```text
docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/risk-scorecard.md
```

## Change Summary

| Field | Value |
|---|---|
| Change ID | `CF-YYYY-MM-NNN` |
| Change description | |
| System area | DNS / Worker / Tunnel / WAF / Zero Trust / IaC |
| Target environment | Dev / Staging / Production |
| Change owner | |
| Planned window | |
| Related PR / commit | |

## Evidence Classification

| Category | Evidence Link / Notes |
|---|---|
| Live runtime facts | |
| Repo intent | |
| Risk scoring results | |
| Manual review actions | |

## Risk Dimension Evaluation

Check exactly one level for each dimension and provide the rationale.

| Dimension | Low | Medium | High | Critical | Notes / Rationale |
|---|---|---|---|---|---|
| DNS record changes | [ ] | [ ] | [ ] | [ ] | |
| Worker route changes | [ ] | [ ] | [ ] | [ ] | |
| Tunnel ingress changes | [ ] | [ ] | [ ] | [ ] | |
| Terraform ownership changes | [ ] | [ ] | [ ] | [ ] | |
| Access policy changes | [ ] | [ ] | [ ] | [ ] | |
| Secret/config file changes | [ ] | [ ] | [ ] | [ ] | |
| Production domain changes | [ ] | [ ] | [ ] | [ ] | |
| Rollback availability | [ ] | [ ] | [ ] | [ ] | |
| Evidence completeness | [ ] | [ ] | [ ] | [ ] | |

## Aggregate Risk Assessment

| Field | Value |
|---|---|
| Aggregate risk level | Low / Medium / High / Critical |
| Required approvers | Automated check only / One domain owner / Terraform Owner + Security Reviewer / Release Approver + Security Reviewer + Review Board Quorum |
| Scoring command | `infra/cloudflare/scripts/score-cloudflare-change-risk.sh --markdown <change-file>` |
| Rollback plan reference | |
| Evidence archive link | |
| Secret scan evidence | |
| Offline validation evidence | |

## Approval Sign-Off

| Role | Name | Date | Required For | Sign-Off |
|---|---|---|---|---|
| Change Owner | | | All changes | |
| Domain Owner | | | Medium+ | |
| Terraform/OpenTofu Owner | | | High+ | |
| Platform Security Reviewer | | | High+ | |
| Release Approver | | | Critical | |
| Review Board Quorum | | | Critical | |

## Go/No-Go Decision

| Field | Value |
|---|---|
| Decision | Go / No-Go / Deferred |
| Decision time | |
| Conditions or exceptions | |
| Post-change verification owner | |
