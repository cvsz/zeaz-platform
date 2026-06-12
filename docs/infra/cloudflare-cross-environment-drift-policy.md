# Cloudflare Cross-Environment Drift Policy

## Definition

Cross-environment drift is any repo intent, Cloudflare routing rule, Worker route,
Access policy, tunnel mapping, or Terraform/OpenTofu resource that crosses the
intended ownership boundary between `dev`, `staging`, and `prod`.

Drift is Critical by default because it can route production traffic to the wrong
environment or allow non-production changes to affect live services.

## Drift Examples

| Example | Severity | Why It Matters |
|---|---|---|
| Production hostname appears in dev intent | Critical | Dev changes could influence live routing decisions |
| Production hostname appears in staging intent | Critical | Staging promotion could overwrite live ownership |
| Tunnel runtime auth material reused across environments | Critical | One environment could affect another environment's routing |
| Worker route missing an `env` tag | High | Route ownership cannot be proven during review |
| Worker route `env` tag does not match the file environment | High | A route may be promoted to the wrong environment |
| Terraform resource missing an environment tag | High | State ownership and review gates become ambiguous |
| Prod YAML missing promotion evidence reference | High | Production change lineage is incomplete |
| Hostname appears in two environment files | High | Ownership is ambiguous and drift-prone |

## Detection Method

Run the offline boundary scanner:

```bash
infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh --markdown
infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh --json
infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh --strict
```

The scanner checks:

- Duplicate hostnames across environment YAML files.
- Production domain names in dev or staging intent.
- Missing or mismatched Worker route `env` tags.
- Missing top-level owner fields.
- Missing production promotion evidence reference.

The scanner is offline only. It does not call Cloudflare APIs.

## Remediation Process

1. Stop promotion for the affected change.
2. Assign a single owner for the affected environment and resource type.
3. Remove the cross-environment reference from the wrong intent file.
4. Add or correct the `env` and Terraform/OpenTofu environment tags.
5. Re-run the boundary scanner with `--strict`.
6. Attach the scanner output to the relevant evidence record when prod is affected.
7. For production impact, update the Phase 15 drift register and Phase 16 evidence
   archive.

## SLA

| Drift Class | Default Severity | Response Target | Resolution Target |
|---|---|---|---|
| Prod hostname in dev or staging | Critical | Same business day | 24 hours |
| Shared tunnel auth material | Critical | Same business day | 24 hours |
| Missing prod evidence reference | High | 1 business day | 3 business days |
| Missing route or Terraform environment tag | High | 1 business day | 5 business days |
| Duplicate non-prod hostname | Medium | 3 business days | 10 business days |

Accepted exceptions must be documented in
`docs/infra/cloudflare-drift-exception-register.md`.
