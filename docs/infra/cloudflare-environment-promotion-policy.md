# Cloudflare Environment Promotion Policy

## Purpose

This policy defines how Cloudflare intent moves from `dev` to `staging` to `prod`.
It is governance-only and does not authorize deployment, Terraform/OpenTofu apply,
or Cloudflare mutation.

## Promotion Path

```text
dev -> staging -> prod
```

Direct dev-to-prod promotion is not allowed for Cloudflare-sensitive changes.

## Dev To Staging Gates

Before promotion from dev to staging:

- Dev boundary scan passes.
- No production hostname appears in dev intent.
- Worker routes are tagged `env: dev`.
- Terraform/OpenTofu resources use `environment = "dev"`.
- Staging owner confirms the target hostname and route mapping.
- Validation summary is attached to the change.

Approval required: Platform Engineering peer review.

Evidence required: validation summary and boundary scan output.

Rollback requirement: revert the repo intent change or remove the staging route
intent before promotion.

## Staging To Prod Gates

Before promotion from staging to prod:

- Staging boundary scan passes.
- No production hostname is present in staging intent.
- Worker routes are tagged `env: staging` before promotion and `env: prod` in the
  production intent update.
- Terraform/OpenTofu resources use the target production workspace and
  `environment = "prod"`.
- Phase 17 risk score is completed.
- Phase 16 evidence archive reference is present.
- Phase 15 review board signs off for High or Critical changes.
- CI report, baseline diff, release approval, post-release verification plan, and
  rollback plan are attached.

Approval required: release owner, Security Engineering for Access or finance
changes, and Phase 15 review board for High or Critical risk.

Evidence required: full production evidence package.

Rollback requirement: documented owner, rollback trigger, expected state, and
post-rollback validation command list.

## Evidence By Environment

| Environment | Evidence Required |
|---|---|
| dev | Boundary scan output when Cloudflare intent changes |
| staging | Boundary scan output, validation summary, owner sign-off |
| prod | CI report, boundary scan, baseline diff, risk score, release approval, post-release verification |

## Rollback Policy

Dev rollback may be handled by reverting repo intent.

Staging rollback requires the staging owner to confirm no production hostname was
affected.

Prod rollback requires a named owner, rollback plan, post-rollback validation, and
Phase 16 evidence update. Prod rollback actions must remain manually approved and
must not be automated by pull request or push workflows.
