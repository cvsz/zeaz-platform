# ZAI Coder Control Plane — Roadmap to Final Enterprise Release

This roadmap tracks the remaining builds from v40 to the final v50 enterprise release pack.

## Current pushed checkpoint

- Latest local package built: `zai-coder-control-plane-v39-notification-and-communication-center.zip`
- Local test result: `286 passed`
- GitHub push scope: planning and release manifest under `apps/zai/`
- Binary ZIP package is not committed to GitHub through this connector.

## Build sequence to project end

| Version | Package | Purpose | Safety posture |
|---|---|---|---|
| v40 | `zai-coder-control-plane-v40-team-collaboration-and-workspaces.zip` | Team spaces, workspace roles, collaboration activity, shared review queues | local-first, role-gated, audit logged |
| v41 | `zai-coder-control-plane-v41-developer-portal-and-api-docs.zip` | Developer portal, API reference, examples, SDK docs, local OpenAPI export | docs-first, no secret examples |
| v42 | `zai-coder-control-plane-v42-package-registry-and-marketplace-publishing.zip` | Internal package registry, marketplace submission drafts, plugin publishing plans | draft-only, no external publishing |
| v43 | `zai-coder-control-plane-v43-quality-assurance-and-test-lab.zip` | QA lab, test matrix, regression reports, fixture runner, release validation | deterministic tests, no disabled checks |
| v44 | `zai-coder-control-plane-v44-data-import-export-and-migration-center.zip` | Import/export jobs, migration planning, schema checks, rollback previews | dry-run migrations by default |
| v45 | `zai-coder-control-plane-v45-backup-restore-and-disaster-recovery.zip` | Backup plans, restore drills, DR evidence, RPO/RTO dashboards | no destructive restore by default |
| v46 | `zai-coder-control-plane-v46-security-operations-and-threat-monitoring.zip` | Security ops dashboard, threat signals, policy alerts, incident workflows | no secret leakage, no active blocking automation by default |
| v47 | `zai-coder-control-plane-v47-enterprise-sso-and-identity-center.zip` | SSO plan, identity mapping, SCIM drafts, org policy, access review | config examples only, no real IdP secrets |
| v48 | `zai-coder-control-plane-v48-multi-region-edge-and-scalability-planner.zip` | Multi-region topology planner, edge routing plans, capacity and scale checks | planning-only, no infra apply |
| v49 | `zai-coder-control-plane-v49-production-readiness-and-go-live-command-center.zip` | Go-live checklist, readiness gates, launch command center, rollback plan | manual approval gates required |
| v50 | `zai-coder-control-plane-v50-final-enterprise-release-pack.zip` | Final enterprise pack with installer, docs, dashboards, tests, release notes, migration guide, validation report | final review-first release bundle |

## End-of-project definition

The project reaches final release at v50 when the package contains:

- complete installer and local bootstrap workflow
- all module dashboards and route manifests
- docs for operators, developers, customers, and admins
- test suite passing without disabled validations
- security, privacy, compliance, audit, and release reports
- migration and rollback guide
- final go-live checklist
- final enterprise validation report

## Repository safety rules

- Do not commit secrets.
- Do not commit binary release ZIP files through this connector.
- Keep `apps/zai/` isolated from existing app stacks.
- Use dry-run-first behavior for generated operational workflows.
- Use review-first release flow before merge or production use.
