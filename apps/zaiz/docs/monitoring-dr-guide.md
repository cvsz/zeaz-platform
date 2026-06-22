# ZeaZ Platform — Monitoring, Disaster Recovery, and Security Guide

This guide outlines the standards for Observability, DR, and Security Tooling.

## 1. Monitoring Stack
- **Target:** Prometheus, Grafana, Loki, OpenTelemetry Collector.
- **Coverage:** Auth failures, WAF blocks, Tunnel health, API latency, Worker failures.

## 2. Security Tooling
- **Required Scanners:** Trivy, Semgrep, Gitleaks.
- **Artifacts:** Generate SBOM under `artifacts/sbom/` when enabled.
- **Signing:** Optional, never require committed keys.

## 3. Disaster Recovery (DR)
- Every runbook must include:
  - Severity Matrix
  - Detection Signals
  - Rollback/Recovery Procedures
  - Postmortem Template

## 4. Validation
- Use `make monitoring-validate` and `make dr-validate` to confirm adherence to these standards.
