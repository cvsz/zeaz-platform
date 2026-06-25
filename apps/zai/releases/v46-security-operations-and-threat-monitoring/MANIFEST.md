# v46 Security Operations and Threat Monitoring Manifest

Package: `zai-coder-control-plane-v46-security-operations-and-threat-monitoring.zip`

## Purpose

Add security operations dashboards, threat signal review, policy alerts, and incident workflow planning.

## Planned systems

- security operations dashboard
- threat signal registry
- policy alert catalog
- incident workflow planner
- risk severity scoring
- security evidence exports
- alert review queues
- security audit log
- security dashboard routes
- tests and docs

## Planned commands

```bash
make security-ops-threat-monitoring
make security-ops-status
make threat-signals
make policy-alerts
make incident-workflow-plan
make security-evidence-export APPLY=1
make security-ops-audit
make security-dashboard-export
```

## Planned routes

```text
/api/security-ops/status
/security-ops
/security-ops/signals
/security-ops/alerts
/security-ops/incidents
/security-ops/evidence
```

## Safety posture

- no secret leakage
- no active blocking automation by default
- incident actions are plan-only
- human review required
- demo writes require APPLY=1
