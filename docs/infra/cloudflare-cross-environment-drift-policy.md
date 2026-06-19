# Cloudflare Cross-Environment Drift Policy

## Definition

Cross-environment drift occurs when Cloudflare configurations unintendedly leak or share resources across environment boundaries (dev, staging, production).

## Drift Examples

- **Hostname Leak**: Production domain hostnames (`*.zeaz.dev`) appearing in a dev-environment configuration without an explicit `env: dev` DNS tag.
- **Credential Sharing**: Using the same Tunnel token or API key for both staging and production.
- **Tagging Gaps**: Worker routes or Terraform resources missing the mandatory `environment` tag.
- **Routing Overlap**: Dev traffic accidentally being routed to production backend services.

## Detection Method

Detection is primarily performed by the `infra/cloudflare/scripts/scan-cloudflare-environment-boundaries.sh` tool.

This scanner:
- Identifies duplicate hostnames across environment YAML files.
- Flags production apex domains in dev/staging files.
- Checks for missing `env:` tags in Worker route definitions.

## Remediation Process

1. **Alert**: Scanner returns a non-zero exit code during CI or manual check.
2. **Triage**: DevOps Lead identifies the source of the leak.
3. **Isolation**: Immediately redact or rotate shared credentials.
4. **Correction**: Fix the configuration YAML to respect boundary rules.
5. **Validation**: Re-run scanner to confirm resolution.

## SLA for Remediation

- **Critical**: Cross-environment credential sharing (Rotation required within 4 hours).
- **High**: Production hostname in dev config (Remediation required within 24 hours).
- **Medium**: Missing environment tags (Remediation required before next promotion).
