# ZAI Coder Control Plane — Build Index v40 to v50

This index tracks the remaining natural builds from v40 through the final v50 enterprise release pack.

## Scope

These files are text manifests only. Binary ZIP artifacts are intentionally not committed through this connector.

## Build list

| Version | Package | Status |
|---|---|---|
| v40 | `zai-coder-control-plane-v40-team-collaboration-and-workspaces.zip` | planned |
| v41 | `zai-coder-control-plane-v41-developer-portal-and-api-docs.zip` | planned |
| v42 | `zai-coder-control-plane-v42-package-registry-and-marketplace-publishing.zip` | planned |
| v43 | `zai-coder-control-plane-v43-quality-assurance-and-test-lab.zip` | planned |
| v44 | `zai-coder-control-plane-v44-data-import-export-and-migration-center.zip` | planned |
| v45 | `zai-coder-control-plane-v45-backup-restore-and-disaster-recovery.zip` | planned |
| v46 | `zai-coder-control-plane-v46-security-operations-and-threat-monitoring.zip` | planned |
| v47 | `zai-coder-control-plane-v47-enterprise-sso-and-identity-center.zip` | planned |
| v48 | `zai-coder-control-plane-v48-multi-region-edge-and-scalability-planner.zip` | planned |
| v49 | `zai-coder-control-plane-v49-production-readiness-and-go-live-command-center.zip` | planned |
| v50 | `zai-coder-control-plane-v50-final-enterprise-release-pack.zip` | final planned |

## Safety rules

- Keep all generated source and manifests under `apps/zai/`.
- Do not commit generated binary ZIP files through this connector.
- Do not commit secrets, provider tokens, private keys, or real production identifiers.
- Keep workflows local-first, dry-run-first, and review-first.
- Use PR review before merging large generated source drops.
