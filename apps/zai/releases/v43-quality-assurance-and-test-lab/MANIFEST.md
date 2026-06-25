# v43 Quality Assurance and Test Lab Manifest

Package: `zai-coder-control-plane-v43-quality-assurance-and-test-lab.zip`

## Purpose

Add a QA lab for deterministic validation, release test matrices, regression reports, and fixture-based test workflows.

## Planned systems

- QA dashboard
- release test matrix
- regression report generator
- fixture catalog
- smoke test planner
- contract test registry
- validation evidence exporter
- quality gate policy
- QA audit log
- tests and docs

## Planned commands

```bash
make qa-test-lab
make qa-status
make test-matrix
make regression-report
make fixture-catalog
make smoke-plan
make quality-gate
make qa-evidence-export APPLY=1
make qa-audit
make qa-dashboard-export
```

## Planned routes

```text
/api/qa/status
/qa
/qa/matrix
/qa/regression
/qa/fixtures
/qa/gates
```

## Safety posture

- deterministic tests
- no disabled checks
- no bypass flags
- evidence export is local-only
- demo writes require APPLY=1
