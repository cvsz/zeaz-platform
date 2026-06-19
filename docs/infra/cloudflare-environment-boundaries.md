# Cloudflare Environment Boundaries

## Overview

Define and enforce ownership boundaries between dev, staging, and production Cloudflare environments to prevent cross-environment drift, credential sharing, and misconfigured hostname routing.

## Environment Rules

### dev environment
- **Usage**: Sandbox for initial development and testing of Cloudflare features.
- **Hostnames**: May use test-only hostnames (e.g., `*.dev.zeaz.internal`, `*.local`). Must NOT use production domain hostnames (`*.zeaz.dev`) unless explicitly tagged as dev-only in DNS.
- **Tunnels**: Must NOT share tunnel credentials with staging or prod.
- **Workers**: Routes must be tagged `env: dev`.
- **Terraform**: Resources must have `environment = "dev"` tag.
- **Evidence**: No evidence archive required for dev-only changes.

### staging environment
- **Usage**: Pre-production validation and integration testing.
- **Hostnames**: Must be clearly separate from prod (e.g., `staging.zeaz.dev`). Must NOT use prod apex or wildcard domains.
- **Tunnels**: Must NOT share prod tunnel credentials.
- **Workers**: Routes must be tagged `env: staging`.
- **Terraform**: Resources must have `environment = "staging"` tag.
- **Evidence**: Light evidence required (summary + sign-off).

### prod environment
- **Usage**: Live production traffic.
- **Hostnames**: Must not point to dev or staging services.
- **Tunnels**: Must NOT be shared with other environments.
- **Workers**: Routes must be tagged `env: prod`.
- **Terraform**: Resources must have `environment = "prod"` tag.
- **Governance**:
  - Requires Phase 17 risk scoring before any change.
  - Requires Phase 16 evidence archive entry.
  - Requires Phase 15 review board sign-off for High/Critical changes.
- **Evidence**: Full evidence required (CI report, baseline diff, release approval, post-release verification).
- **Rollback**: Rollback plan required for every change.

## Separation Enforcement

- **DNS**: Restricted access to production DNS zones.
- **API Tokens**: Scoped tokens per environment (dev-only, staging-only, prod-only).
- **Tunnels**: Dedicated `cloudflared` instances and credentials for each environment.
- **CI/CD**: Promotion gates required to move configuration between environments.
