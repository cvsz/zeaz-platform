# Security Control Plane Migration Plan

## Target Architecture

The repository now uses `.github/workflows/security-control-plane.yml` as the single governance entry point for security scanning, SARIF publication, SBOM creation, remediation orchestration, rollback evaluation, metrics, and event emission.

Control-plane responsibilities are split into production modules:

- `governance-dag.ts` defines and validates the orchestration graph before scanners start.
- `workflow-lock.ts` provides a filesystem lock for self-hosted runner race-condition protection.
- `sarif-aggregator.ts` merges scanner output and adds stable fingerprints so GitHub receives one deduplicated SARIF upload.
- `remediation-queue.ts` converts SARIF findings into a deduplicated queue and promotes only a bounded canary batch.
- `rollback-engine.ts` creates deterministic rollback plans for failed canary remediation.
- `orchestrator.ts` is the event-bus and command entry point used by the workflow.

## Phased Migration

1. **Shadow mode**
   - Enable `Security Control Plane` on `workflow_dispatch` and scheduled runs.
   - Keep legacy workflows manual-only or branch-filtered while comparing SARIF counts, SBOM output, and remediation queue metrics.
   - Confirm aggregate SARIF is the only SARIF upload for Semgrep, Trivy, secret scan, and CodeQL output produced by the control plane.

2. **Primary enforcement**
   - Make branch protection require `Security Control Plane / Policy Gate, DAG, Lock, and Rate Limit` and `Security Control Plane / SARIF Aggregation, Queue, Canary, Metrics`.
   - Remove legacy scanner checks from required checks after two consecutive green control-plane runs.
   - Keep build, packaging, deploy, and release workflows separate because they are not scanner orchestration owners.

3. **Autonomous remediation cutover**
   - Route all autonomous remediation into the control-plane queue.
   - Allow only one open canary branch or pull request for `security-control-plane/canary` at a time.
   - Increase `CANARY_REMEDIATION_LIMIT` only after remediation success rate remains above 95% for two weeks.

4. **Legacy workflow retirement**
   - Retire overlapping workflows that independently upload SARIF, generate SBOMs, or create autonomous remediation PRs.
   - Preserve workflow history for auditability; do not delete historical run logs.
   - Document the final required-check set in branch protection and repository rulesets.

## Rollback Strategy

1. Disable the `Security Control Plane` schedule in GitHub Actions.
2. Re-enable the last known-good legacy security workflows from repository history.
3. Run `node --experimental-strip-types security/control-plane/orchestrator.ts freeze-remediation` to emit a freeze event and stop promotion of queued items.
4. Close or pause any canary remediation PR created by the control plane.
5. Use `security/reports/rollback-plan.json` from the failed run to restore the base ref and delete the canary branch.
6. Re-run legacy CodeQL, Semgrep, Trivy, and SBOM workflows once to repopulate security dashboards.

## Operational SLOs

- Remediation success rate: at least 95% validated canary remediations.
- Mean rollback time: below 15 minutes from failed canary signal to rollback record.
- SARIF trend: non-increasing high and critical unique results over a rolling four-week window.
- Workflow execution cost: tracked per run from elapsed minutes and stored in `security-control-plane-metrics.json`.
- Runner utilization: CPU load and memory ratio collected from the self-hosted runner for capacity planning.
