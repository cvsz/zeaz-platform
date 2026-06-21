import os

prompts = {
    "phase-00-discovery.prompt": """# Phase Prompt: Phase 00 - Discovery & Audit

You are activating in Phase 00 (Discovery & Audit). Your objective is to map target files, run environment audits, list dependencies, and compile a baseline blocker report.

## Action Steps
1. Map the directory structure scope using specific target filters.
2. Read main build and routing entry points (`package.json`, `Makefile`, `wrangler.toml`).
3. Identify existing TODOs, FIXMEs, and deprecation markers.
4. Verify that no hardcoded credentials or production tokens exist.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Do not execute mutating shell commands.
""",
    "phase-01-requirements.prompt": """# Phase Prompt: Phase 01 - Requirements & Scope

You are activating in Phase 01 (Requirements & Scope). Your objective is to capture the user's intent, map platform capabilities, and build a Lean PRD.

## Action Steps
1. Analyze user request and define core features.
2. Verify API schemas, environment limits, and plan compatibility.
3. Formulate validation boundaries and configuration constraints.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Avoid placeholders or fake values in configuration outputs.
""",
    "phase-02-architecture.prompt": """# Phase Prompt: Phase 02 - Architecture & Design

You are activating in Phase 02 (Architecture & Design). Your objective is to design the module interactions, state machines, and system boundary topologies.

## Action Steps
1. Create data models, state flows, and modular structures.
2. Design interactions using UML or Mermaid flow diagrams.
3. Align components with the monorepo architecture and central design tokens.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Ensure strict separation of UI components and business logic.
""",
    "phase-03-foundation.prompt": """# Phase Prompt: Phase 03 - Platform Foundation

You are activating in Phase 03 (Platform Foundation). Your objective is to set up configurations, variables, makefile commands, and preflight offline gates.

## Action Steps
1. Scaffold `.env.example` configurations.
2. Define Makefile validation targets and offline check boundaries.
3. Establish environment-gated configuration files.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Never commit real credentials. Externalize all secrets.
""",
    "phase-04-implementation.prompt": """# Phase Prompt: Phase 04 - Implementation

You are activating in Phase 04 (Implementation). Your objective is to build high-quality, production-ready modules following TDD guidelines.

## Action Steps
1. Implement features incrementally.
2. Adhere to TypeScript standards for edge workers and vanilla design system styling for UI.
3. Maintain error envelopes (`ok: false`, public safe messages) on all endpoints.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- No inline styles or raw Tailwind classes (unless requested with a verified version).
""",
    "phase-05-security.prompt": """# Phase Prompt: Phase 05 - Security & Compliance

You are activating in Phase 05 (Security & Compliance). Your objective is to audit authentication scopes, WAF rules, and token separation.

## Action Steps
1. Enforce specific client identity headers (`CF-ZVEO-User`, `CF-ZPAY-User`).
2. Run Semgrep and check for hardcoded secrets or API key scopes.
3. Verify session TTL boundaries (e.g. <= 4h for finance systems).

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Never weaken policy rules to bypass tests.
""",
    "phase-06-testing.prompt": """# Phase Prompt: Phase 06 - Testing & Quality Gates

You are activating in Phase 06 (Testing & Quality Gates). Your objective is to verify logic correctness and achieve 80%+ test coverage.

## Action Steps
1. Run local test suites and document results.
2. Implement missing unit, integration, and E2E mock suites.
3. Verify logic edge cases and simulated error triggers.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
- Write tests FIRST (TDD approach).
""",
    "phase-07-devops.prompt": """# Phase Prompt: Phase 07 - DevOps & CI

You are activating in Phase 07 (DevOps & CI). Your objective is to configure deployment files, actions, pipelines, and routing gateways.

## Action Steps
1. Design Traefik ingress rules and docker compose boundaries.
2. Validate workflow timeouts and least-privilege configurations.
3. Ensure no artifacts leak configuration environment variables.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
""",
    "phase-08-release.prompt": """# Phase Prompt: Phase 08 - Release Candidate

You are activating in Phase 08 (Release Candidate). Your objective is to run integrity checks, placeholder audits, and compile release metadata.

## Action Steps
1. Validate monorepo convergence and shared assets.
2. Run full repo checks and package verification.
3. Produce release candidate changelogs and tag configurations.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
""",
    "phase-09-operations.prompt": """# Phase Prompt: Phase 09 - Operations & SRE

You are activating in Phase 09 (Operations & SRE). Your objective is to verify telemetry pipelines, Grafana alerts, and deploy runbooks.

## Action Steps
1. Audit Loki log pipelines, Prometheus metrics, and alert triggers.
2. Validate DR containing procedures and escalation schedules.
3. Ensure cost anomaly checks are active.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
""",
    "phase-10-growth.prompt": """# Phase Prompt: Phase 10 - Governance & Expansion

You are activating in Phase 10 (Governance & Expansion). Your objective is to establish multi-tenant limits, tenant policies, and growth frameworks.

## Action Steps
1. Review tenant quota limits, database indexes, and scaling thresholds.
2. Generate compliance audit exports and tenant billing boundaries.

## Rules & Constraints
- Talk in Thai to the user. All code, comments, and logs must be in English.
"""
}

checklists = {
    "start-project.md": """# Checklist: Start Project (Phase 00 - Phase 01)

This checklist verifies the completion of project initialization and scope validation.

- [ ] Repository audit completed; all dependencies inventoried.
- [ ] No hardcoded secrets, passwords, or tokens found in the active workspace.
- [ ] Monorepo boundaries respected (all files inside `apps/<app-name>`).
- [ ] Central `.env.example` created and mapped.
- [ ] Core specifications and PRD agreed upon and documented.
""",
    "architecture-review.md": """# Checklist: Architecture Review (Phase 02)

This checklist ensures the architecture aligns with ZeaZ Platform engineering guidelines.

- [ ] System boundary and component interaction diagrams compiled (Mermaid/UML).
- [ ] Monorepo rules enforced; apps do not cross-import business models directly.
- [ ] Separation of concerns validated (UI separate from edge logic).
- [ ] Plan-gated fallback mechanisms documented (Free, Pro, Enterprise limitations).
- [ ] API payload contracts defined and schema validation models established.
""",
    "qa-review.md": """# Checklist: QA & Quality Gates Review (Phase 06)

This checklist validates implementation testing and code quality rules.

- [ ] Unit tests, Integration, and E2E mock suites implemented.
- [ ] Test coverage meets or exceeds the mandatory 80% threshold.
- [ ] Edge cases (rate limiting, auth errors, network failures) covered.
- [ ] Static analysis, lint checks, and code formats pass successfully.
- [ ] Public-facing error shapes verified (user-friendly message, request ID).
""",
    "security-review.md": """# Checklist: Security & Hardening Review (Phase 05)

This checklist verifies the cryptographic boundaries and token configurations.

- [ ] All inputs validated against specific boundary schema (Zod/Pydantic).
- [ ] Secret scanners executed; zero production-grade secrets committed.
- [ ] WAF abuse controls, bot block limits, and CORS parameters hardened.
- [ ] Dedicated tokens category separated (DNS, ZT, WAF, Tunnel, etc.).
- [ ] Session TTL limits enforced <= 4 hours for financial domain actions.
""",
    "production-release.md": """# Checklist: Production Release Candidate (Phase 08 - Phase 09)

This checklist ensures the release candidate is ready for human operator approval.

- [ ] Integrity check executed; zero placeholder variables in production paths.
- [ ] pre-flight readiness briefs prepared and manual checklists validated.
- [ ] Container ingress rules and Traefik router setups mapped.
- [ ] Conventional commit tags verified and changelog compiled.
- [ ] Rollback and disaster recovery triggers defined.
""",
    "final-signoff.md": """# Checklist: Final Sign-off & Handoff (Phase 12)

This checklist handles final developer handoff and platform governance controls.

- [ ] Detailed Codex architectural docs packaged.
- [ ] SRE logging dashboards, Prometheus alerts, and dashboards active.
- [ ] DR runbooks (tunnel down, tokens leak, certificate expired) verified.
- [ ] Security keys rotated and verified.
- [ ] Multi-tenant isolation verified and signed off by the platform leads.
"""
}

# Write prompts
for file, content in prompts.items():
    path = os.path.join(".docs", "prompts", file)
    with open(path, "w") as f:
        f.write(content)
    print(f"Populated prompt: {path}")

# Write checklists
for file, content in checklists.items():
    path = os.path.join(".docs", "checklists", file)
    with open(path, "w") as f:
        f.write(content)
    print(f"Populated checklist: {path}")
