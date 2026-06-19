# Cloudflare Risk Gate Policy — Phase 17

## Policy Scope

This policy gates Cloudflare-sensitive changes before merge and before any production execution. It applies to DNS, Worker routes, Tunnel ingress, Access policies, WAF/ruleset governance, Terraform/OpenTofu ownership, and credential-adjacent configuration.

The policy is offline and evidence-driven. It does not authorize deployment, Terraform/OpenTofu apply, DNS mutation, tunnel mutation, or Cloudflare write API usage.

## Gate Policy by Risk Level

| Risk Level | Merge Gate | Required Approvers | Required Evidence |
|---|---|---|---|
| Low | Automated validation may pass | Automated check only | Scorecard, offline validation output |
| Medium | Owner approval required | One affected-area owner | Scorecard, rollback reference, offline validation output |
| High | Dual approval required | Terraform/OpenTofu Owner + Platform Security Reviewer | Scorecard, rollback plan, dry-run or scan evidence, secret scan confirmation |
| Critical | Release gate required; strict mode fails until approved | Release Approver + Platform Security Reviewer + Review Board Quorum | Full evidence archive, tested rollback plan, dry-run evidence, post-change verification plan, board record |

## Approver Roles

Roles align with the Phase 15 ownership review board:

| Role | Approval Authority |
|---|---|
| DNS Owner | DNS record ownership, hostname consolidation, production domain routing |
| Worker Owner | Worker route ownership, wrangler configuration, Worker binding risk |
| Tunnel Owner | Cloudflared ingress ownership, runtime tunnel route changes |
| Terraform/OpenTofu Owner | IaC modules, provider/backend changes, state ownership, resource moves |
| Platform Security Reviewer | Access policies, credential-adjacent config, secret handling, WAF/ruleset risk |
| Release Approver | Production release authorization for Critical risk |
| Review Board Quorum | Final governance approval for Critical risk or policy exceptions |

## Critical Risk Behavior

The risk scoring script must block unapproved Critical risk in strict mode:

```bash
infra/cloudflare/scripts/score-cloudflare-change-risk.sh --strict change-description.md
```

Expected behavior:

- If aggregate risk is Critical and `--approved` is not supplied, the command exits `1`.
- `--approved` may only be used after the required Release Approver, Platform Security Reviewer, and Review Board Quorum entries are recorded in the scorecard.
- Emergency break-glass exceptions must follow Phase 13 incident and rollback governance.

## Evidence Requirements

Every scorecard must include:

- Per-dimension scoring rationale
- Aggregate risk level
- Required approver mapping
- Rollback plan or runbook reference
- Phase 16 evidence archive link
- Offline validation output
- Secret scan evidence for changed docs and scripts

High and Critical scorecards must also include dry-run or scan evidence that is sanitized and does not expose tokens, credentials, private keys, zone IDs, or secret-bearing environment values.

## Review Board Integration

High and Critical changes must be visible to the Phase 15 ownership review board.

Critical changes require:

- Board quorum record
- Explicit release approval
- Security reviewer approval
- Post-change verification owner
- Exception register entry if any gate is bypassed under break-glass procedure
