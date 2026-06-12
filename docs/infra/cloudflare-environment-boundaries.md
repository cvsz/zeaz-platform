# Cloudflare Environment Boundaries

## Overview

ZeaZ Platform separates Cloudflare ownership into three environments:

- `dev`: local and test-only routing intent.
- `staging`: pre-production routing intent for release verification.
- `prod`: production routing intent for live `zeaz.dev` hostnames.

Phase 18 is policy, documentation, and offline validation only. It does not deploy
Workers, apply Terraform/OpenTofu, change DNS, change tunnels, or call Cloudflare
write APIs.

## Source Separation

| Source Type | Purpose | Boundary |
|---|---|---|
| Live runtime facts | Operator-observed production state | Read-only reference; not copied into intent YAML when sensitive |
| Repo intent | Sanitized YAML under `infra/cloudflare/environments/` | Reviewable desired ownership model only |
| Boundary policy | This document and companion policy docs | Defines what may cross environments |
| Manual review actions | Phase 15, Phase 16, and Phase 17 evidence gates | Required before production changes |

## Hostname Routing Separation

Dev hostnames must use non-production names such as `*.dev.zeaz.internal` or
`*.local`. Dev must not route live `*.zeaz.dev` names unless a future DNS policy
explicitly marks the record as dev-only and the review board accepts the risk.

Staging hostnames must be clearly separate from production. This repository uses
`*.staging.zeaz.internal` intent names in Phase 18 to keep staging isolated from
the live production zone.

Prod hostnames are the live `zeaz.dev` names owned by production routing intent.
Known production hostnames tracked in Phase 18 are:

- `office.zeaz.dev`
- `zveo.zeaz.dev`
- `cctv.zeaz.dev`
- `api.zveo.zeaz.dev`
- `app.zeaz.dev`
- `admin-wallet.zeaz.dev`
- `zcloud.zeaz.dev`
- `ztest.zeaz.dev`

Prod hostnames must not point to dev or staging services.

## Worker Route Tagging

Every Worker route in an environment intent file must include an `env` value that
matches the file environment:

- Dev routes use `env: dev`
- Staging routes use `env: staging`
- Prod routes use `env: prod`

Missing or mismatched route tags are cross-environment drift.

## Terraform Tagging

Terraform and OpenTofu resources must use an environment tag or equivalent label:

```hcl
environment = "dev"
environment = "staging"
environment = "prod"
```

Production Terraform changes require Phase 17 risk scoring before review and must
include Phase 16 evidence references before approval.

## Shared Resources Prohibited

The following must not be shared across environments:

- Tunnel runtime auth material
- Worker route ownership
- Terraform/OpenTofu workspaces
- DNS hostnames
- Access policy ownership
- Production origin routing targets
- Release evidence records

Shared dashboards and read-only reports may reference multiple environments only
when they clearly label each source and do not contain sensitive values.

## Environment Rules

### Dev

- May use test-only hostnames such as `*.dev.zeaz.internal` and `*.local`.
- Must not use production `*.zeaz.dev` hostnames in Phase 18 intent files.
- Must not share tunnel runtime auth material with staging or prod.
- Worker routes must be tagged `env: dev`.
- Terraform resources must use `environment = "dev"`.
- No evidence archive is required for dev-only changes.

### Staging

- Must not share production tunnel runtime auth material.
- Must not use the prod apex or wildcard production hostnames.
- Must use hostnames clearly separate from prod.
- Worker routes must be tagged `env: staging`.
- Terraform resources must use `environment = "staging"`.
- Light evidence is required: summary, validation output, and sign-off.

### Prod

- Requires Phase 17 risk scoring before any change.
- Requires a Phase 16 evidence archive entry.
- Requires Phase 15 review board sign-off for High or Critical changes.
- Hostnames must not point to dev or staging services.
- Worker routes must be tagged `env: prod`.
- Terraform resources must use `environment = "prod"`.
- Full evidence is required: CI report, baseline diff, release approval, and
  post-release verification.
- A rollback plan is required.

## Manual Review Actions

Before production promotion, reviewers must confirm:

- The source environment has passed offline validation.
- No production hostname appears in dev or staging intent.
- All Worker routes are tagged with the matching environment.
- Terraform/OpenTofu ownership and workspace names match the target environment.
- Phase 17 risk score and Phase 16 evidence references are attached.
- Rollback ownership is assigned.
