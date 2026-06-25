# v47 Enterprise SSO and Identity Center Manifest

Package: `zai-coder-control-plane-v47-enterprise-sso-and-identity-center.zip`

## Purpose

Add enterprise identity planning for SSO, SCIM drafts, org policy, and access review workflows.

## Planned systems

- enterprise identity dashboard
- SSO configuration planner
- SCIM mapping drafts
- organization policy registry
- access review queue
- role assignment review
- identity evidence export
- identity audit log
- identity dashboard routes
- tests and docs

## Planned commands

```bash
make enterprise-sso-identity-center
make identity-status
make sso-plan
make scim-mapping-draft
make org-policy
make access-review
make identity-evidence-export APPLY=1
make identity-audit
make identity-dashboard-export
```

## Planned routes

```text
/api/identity/status
/identity
/identity/sso
/identity/scim
/identity/policies
/identity/access-review
```

## Safety posture

- config examples only
- no real IdP secrets
- no live identity provider mutation
- access changes are review-only
- demo writes require APPLY=1
