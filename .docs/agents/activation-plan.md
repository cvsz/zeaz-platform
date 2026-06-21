# Agent Activation & Collaboration Plan

This document details how the Omega Agents activate, collaborate, and hand off responsibilities across the 16 lifecycle phases.

---

## Phase-by-Phase Agent Orchestration

### Phase 00: Discovery & Audit
- **Primary Agent**: `omega-master-orchestrator` & `omega-repo-architect`
- **Action**: Runs repo audit, lists files, verifies monorepo boundaries, catalogs dependencies, and identifies any pre-existing blockages.

### Phase 01: Requirements & Scope Definition
- **Primary Agent**: `omega-product-architect`
- **Action**: Captures user inputs, maps system bounds, and constructs the Lean PRD.

### Phase 02: Architecture & System Design
- **Primary Agent**: `omega-repo-architect` & `omega-product-architect`
- **Action**: Visualizes system flow diagrams, maps apps/* directory changes, and gets a design review.

### Phase 03: Platform Foundation & Workspace Context
- **Primary Agent**: `omega-devops-cloudflare` & `omega-master-orchestrator`
- **Action**: Scaffolds `.env.example`, makefiles, preflight verification checks, and creates offline validations.

### Phase 04: Implementation & Code Scaffolding
- **Primary Agent**: `omega-backend-engineer` & `omega-frontend-engineer`
- **Action**: Constructs backend routes, frontend layouts, styles, APIs, components, and ensures separation of concerns.

### Phase 05: Security, Threat Modeling & Compliance
- **Primary Agent**: `omega-security-engineer` & `omega-compliance-meta-agent`
- **Action**: Evaluates JWT headers, verifies SAML constraints, scans for secrets, runs Semgrep, and checks authentication boundaries.

### Phase 06: Test-Driven Validation & Quality Gates
- **Primary Agent**: `omega-qa-release-engineer`
- **Action**: Performs coverage analysis, writes E2E test scripts, checks logic boundaries, and verifies the 80%+ threshold.

### Phase 07: DevOps, Pipelines & CI Validation
- **Primary Agent**: `omega-devops-cloudflare` & `omega-sre-observability`
- **Action**: Packages container images, validates GitHub Actions workflow syntax, and ensures environment variables check.

### Phase 08: Integration & Monorepo Convergence
- **Primary Agent**: `omega-master-orchestrator`
- **Action**: Orchestrates monorepo synchronization and verifies multi-app stability.

### Phase 09: Human Review & Handoff Readiness
- **Primary Agent**: `omega-docs-runbook-writer` & `omega-github-projects-agent`
- **Action**: Compiles preflight checklists, reports test/build status, and files readiness reports.

### Phase 10: Controlled Deployment & Rollback
- **Primary Agent**: `omega-devops-cloudflare` & `omega-qa-release-engineer`
- **Action**: Deploys via Cloudflare Tunnels, sets origin headers, validates routes, and monitors canary health.

### Phase 11: Operations, Telemetry & Observability
- **Primary Agent**: `omega-sre-observability`
- **Action**: Feeds operational telemetry to Loki/Prometheus, activates alert triggers, and monitors log output.

### Phase 12: Documentation Pack & Governance Handoff
- **Primary Agent**: `omega-docs-runbook-writer`
- **Action**: Creates permanent Codex entries, updates APIs catalogs, and writes postmortem/incident response runbooks.

### Phase 13: Maintenance Automation & Performance Audits
- **Primary Agent**: `omega-database-engineer` & `omega-local-ai-engineer`
- **Action**: Measures database execution times, profiles inference latency, and optimizes cache keys.

### Phase 14: Continuous Learning & Instinct Tuning
- **Primary Agent**: `omega-master-orchestrator`
- **Action**: Stores developer modifications, tunes model prompt guides, and generates custom skills updates.

### Phase 15: Enterprise Governance & Disaster Recovery
- **Primary Agent**: `omega-compliance-meta-agent` & `omega-security-engineer`
- **Action**: Audits identity provider metadata configurations, implements compliance lockdowns, and validates DR plans.
