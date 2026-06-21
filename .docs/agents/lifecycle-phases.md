# Lifecycle Phases (00 to 15)

This document describes the 16 standard lifecycle phases used in the ZeaZ Platform Omega Master Agent Matrix to take a project from discovery to enterprise governance.

---

## Phase List

### Phase 00: Discovery & Audit (F0 / P00)
- **Objective**: Conduct a comprehensive code and resource audit. Catalog existing structures, configs, dependencies, and identify blockers.
- **Key Inputs**: Repository tree, existing configs, manual reviews.
- **Key Outputs**: Audit inventory, blocker report, initial target plan.

### Phase 01: Requirements & Scope Definition (F1 / P01)
- **Objective**: Define specifications, constraints, user intents, and environment context.
- **Key Inputs**: User request, platform capabilities, environment matrix.
- **Key Outputs**: PRD, API schemas, target configuration boundaries.

### Phase 02: Architecture & System Design (F2 / P02)
- **Objective**: Design the modules, patterns, state machines, and system boundary topologies.
- **Key Inputs**: PRD, technology stack guidelines, performance metrics.
- **Key Outputs**: Architecture document, UML/Mermaid flows, component mapping.

### Phase 03: Platform Foundation & Workspace Context (F3 / P03)
- **Objective**: Scaffold workspace files, `.env.example`, makefiles, preflight verification scripts, and offline validation gates.
- **Key Inputs**: Architecture specs, runtime variables matrix.
- **Key Outputs**: Validation configs, local workspace structure, Makefile targets.

### Phase 04: Implementation & Code Scaffolding (F4 / P04)
- **Objective**: Execute code construction following TDD patterns, writing clean, modular codebase components.
- **Key Inputs**: Architecture, foundation scripts, code template blocks.
- **Key Outputs**: Production code, unit tests, local verification logs.

### Phase 05: Security, Threat Modeling & Compliance (F5 / P05)
- **Objective**: Perform secret scans, WAF rules setup, network isolation checks, WAF abuse mitigation design, and regulatory checks.
- **Key Inputs**: Implemented code, compliance guidelines, static analysis reports.
- **Key Outputs**: Security audit report, threat models, hardened configurations.

### Phase 06: Test-Driven Validation & Quality Gates (F6 / P06)
- **Objective**: Run unit, integration, and E2E test coverage suite (enforcing 80%+ threshold). Check edge cases.
- **Key Inputs**: Implemented tests, code quality parameters.
- **Key Outputs**: Test coverage report, quality gate signoff, bug patches.

### Phase 07: DevOps, Pipelines & CI Validation (F7 / P07)
- **Objective**: Construct GitHub Actions, Docker Compose environments, Traefik routes, and CI policy checks.
- **Key Inputs**: DevOps specs, target platforms, infrastructure configs.
- **Key Outputs**: Operational workflow configurations, build logs, container health metrics.

### Phase 08: Integration & Monorepo Convergence (F8 / P08)
- **Objective**: Conduct end-to-end integration and ensure all `apps/*` operate cohesively in the unified monorepo.
- **Key Inputs**: Integrated codebases, compose setups, system logs.
- **Key Outputs**: Convergence report, integration validation tests.

### Phase 09: Human Review & Handoff Readiness (F9 / P09)
- **Objective**: Prepare deployment preflight briefs, human-operator checkbooks, and manual intervention templates.
- **Key Inputs**: Verified branch, checklist templates, test metrics.
- **Key Outputs**: Pre-flight readiness report, operator checklists.

### Phase 10: Controlled Deployment & Rollback (F10 / P10)
- **Objective**: Deploy resources with canary gates, blue-green setups, or environment-prefixed domains.
- **Key Inputs**: Release candidate artifacts, deployment credentials (externalized).
- **Key Outputs**: Deployment logs, service health validation, rollback triggers.

### Phase 11: Operations, Telemetry & Observability (F11 / P11)
- **Objective**: Install Prometheus, Grafana, Loki dashboards, and configure alerting metrics.
- **Key Inputs**: Operational telemetry, log flows, server alerts.
- **Key Outputs**: Active dashboard configs, Alertmanager setup.

### Phase 12: Documentation Pack & Governance Handoff (F12 / P12)
- **Objective**: Package code maps, API specs, developer guidelines, and architectural decisions.
- **Key Inputs**: Project code, architecture doc, code comments.
- **Key Outputs**: Authoritative Codex Pack, long-term ownership guidelines.

### Phase 13: Maintenance Automation & Performance Audits (F13 / P13)
- **Objective**: Automate cleanup scripts, dependency updates, and run cost/performance optimization benchmarks.
- **Key Inputs**: Runtime telemetry, package versions.
- **Key Outputs**: Cost-performance report, upgrade patches.

### Phase 14: Continuous Learning & Instinct Tuning (F14 / P14)
- **Objective**: Extract reusable developer patterns, rules, and save them as permanent local skills.
- **Key Inputs**: Session history, developer adjustments.
- **Key Outputs**: Refined `.agents/` rules and skills portfolio.

### Phase 15: Enterprise Governance & Disaster Recovery (F15 / P15)
- **Objective**: Build multi-tenant boundary checks, compliance audit logs, and DR runbooks.
- **Key Inputs**: Threat models, DR scenario matrix.
- **Key Outputs**: Audited governance logs, DR runbooks.
