# v1.0.2-platform-resilience

Cloudflare platform resilience and CI portability hardening release.

## Release date

- 2026-05-13

## Summary

This release improves reliability and safety for tunnel operations and CI validation by:

- repairing cloudflared service recovery automation,
- correcting public tunnel DNS connector targets,
- adding a dedicated Cloudflare Tunnel online recovery runbook,
- making CI validation workflows more deterministic and secretless by default,
- and degrading optional security artifact generation safely when tooling is unavailable.

## Validation and CI hardening

- `validate-agent` path remains secretless for push checks.
- Policy workflow now installs `pytest` before test execution.
- Validate workflow now installs Terraform before infrastructure validation.
- SBOM and cosign targets are treated as optional in CI when tools are unavailable.
- SBOM generation now skips gracefully when `syft` is not installed.

## Networking and tunnel resilience

- Added cloudflared service repair script for host-side recovery operations.
- Updated public CNAME tunnel records to point to the active connector.
- Added Cloudflare tunnel online recovery runbook with operator steps and recovery flow.

## Security notes

- No secrets were introduced in this release note.
- Optional artifact workflows fail safely and avoid forcing insecure bypasses.
- Changes focus on operational hardening and recovery readiness.

## Rollback notes

- Revert this release by rolling back commits after `v1.0.1-platform-stable` baseline if required.
- For tunnel DNS connector regressions, restore previous CNAME targets and re-run tunnel validation.
- For CI regressions, revert workflow install/optional-tooling commits and re-run validation jobs.

## Known limitations

- Optional SBOM/signing outputs still depend on local/runner tool availability.
- Tunnel recovery success depends on host service manager access and network reachability.

## Release tag

- Tag: `v1.0.2-platform-resilience`
- Previous baseline: `v1.0.1-platform-stable`
- Suggested compare base commit: `3df21a9f40d523ded82c21258ac46094e6803df4`
