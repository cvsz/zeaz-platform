# Vault OIDC Federation

## Objectives
- Eliminate long-lived secrets
- Federate GitHub Actions identities
- Enforce least privilege
- Enable short-lived credentials

## Architecture
GitHub Actions -> OIDC -> Vault -> Dynamic Secrets

## Policies
- No static cloud credentials
- Dynamic database credentials only
- Automatic secret rotation
- Audit logging mandatory
- RBAC enforced

## GitHub OIDC
- Use id-token: write only where required
- Restrict trusted repositories
- Restrict trusted branches
- Restrict environment promotion

## Runtime Security
- eBPF runtime telemetry
- Falco runtime detection
- Immutable infrastructure
- Admission controller enforcement

## AI Governance
- Sandboxed AI execution
- Read-only execution environments
- Restricted network egress
- Provenance verification mandatory
