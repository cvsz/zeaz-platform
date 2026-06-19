# Cloudflare Runtime Risk Scoring — Phase 17

## Overview

Phase 17 adds an offline pre-merge risk scoring system for Cloudflare-sensitive changes in the ZeaZ Platform. The scoring model applies before DNS, Worker, Tunnel, Access policy, or Terraform/OpenTofu changes are allowed to reach production review.

This phase is read-only governance. It does not deploy Workers, apply Terraform/OpenTofu, mutate DNS, mutate tunnels, call Cloudflare write APIs, or read live runtime files unless an operator explicitly requests local live metadata checks.

## Required Evidence Separation

Every risk review must separate four categories of information:

| Category | Meaning | Required Handling |
|---|---|---|
| Live runtime facts | Observed production state, such as tunnel hostnames or active routing metadata | Capture as sanitized evidence only; never print credentials or tokens |
| Repo intent | Desired state represented by tracked configs, Terraform/OpenTofu modules, Worker routes, and docs | Reference exact repository paths and commits |
| Risk scoring results | Per-dimension score, aggregate score, required approvers, and evidence checklist | Store in the Phase 16 evidence archive |
| Manual review actions | Human approvals, board quorum notes, rollback decision, and go/no-go outcome | Record in the scorecard and approval evidence |

## Scoring Dimensions

Each proposed change is scored across every dimension. The aggregate risk level is the highest level assigned to any single dimension.

| Dimension | Low | Medium | High | Critical |
|---|---|---|---|---|
| DNS record changes | Internal only | Non-prod domain | Prod subdomain | Prod apex/wildcard |
| Worker route changes | New route, no overlap | Route update, no prod | Prod route update | Prod route removal |
| Tunnel ingress changes | Add non-prod host | Modify non-prod | Modify prod host | Remove prod host |
| Terraform ownership changes | Comments only | Variable change | Resource change | Provider/backend change |
| Access policy changes | New non-prod policy | Update non-prod | Update prod policy | Remove prod policy |
| Secret/config file changes | Non-secret config | Dev/staging env | Prod config reference | Direct secret or credential |
| Production domain changes | No prod domains | 1 prod domain touched | Multiple prod domains | Apex or wildcard |
| Rollback availability | Tested rollback plan | Documented plan | Manual only | No rollback plan |
| Evidence completeness | Full evidence | Most fields complete | Some fields missing | Evidence absent |

## Risk Levels and Approval Gates

| Aggregate Risk | Gate | Required Approvers |
|---|---|---|
| Low | Approved by automated checks | Automated check only |
| Medium | One-owner review | One domain owner for the affected area |
| High | Dual review | Terraform/OpenTofu Owner + Platform Security Reviewer |
| Critical | Release gate, security review, and board quorum | Release Approver + Platform Security Reviewer + Review Board Quorum |

Critical unapproved risk must fail in strict mode:

```bash
infra/cloudflare/scripts/score-cloudflare-change-risk.sh --strict change-description.md
```

If the aggregate score is Critical, the command exits non-zero unless `--approved` is explicitly supplied after the required human approvals are recorded.

## Tooling

The offline scorer is:

```bash
infra/cloudflare/scripts/score-cloudflare-change-risk.sh
```

Supported outputs:

```bash
infra/cloudflare/scripts/score-cloudflare-change-risk.sh --markdown change-description.md
infra/cloudflare/scripts/score-cloudflare-change-risk.sh --json change-description.md
infra/cloudflare/scripts/score-cloudflare-change-risk.sh --strict change-description.md
```

The scorer reads a change description from a file argument or stdin. It does not require network access. It does not read `/etc/cloudflared/config.yml` unless `--live` is passed, and even then it prints only sanitized metadata.

## Phase 16 Evidence Archive Integration

Risk scorecards must be stored with the Phase 16 evidence archive:

```text
docs/infra/evidence/cloudflare/YYYY/MM/CHANGE-ID/risk-scorecard.md
```

Required companion evidence:

- Completed scorecard using [cloudflare-risk-scorecard-template.md](cloudflare-risk-scorecard-template.md)
- Approval record matching [cloudflare-risk-gate-policy.md](cloudflare-risk-gate-policy.md)
- Rollback plan or runbook reference
- Offline validation command output
- Secret scan confirmation for changed docs and scripts

Related references:

- [Cloudflare Change Evidence Archive](cloudflare-change-evidence-archive.md)
- [Cloudflare Risk Scorecard Template](cloudflare-risk-scorecard-template.md)
- [Cloudflare Risk Gate Policy](cloudflare-risk-gate-policy.md)
