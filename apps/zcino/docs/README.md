# Zcino Enterprise Documentation

This directory is the operational and engineering handbook for the Zcino repository. It complements the top-level `README.md` by documenting architecture, APIs, data ownership, operations, security controls, frontend behavior, and the ZEAZ protocol assets in a format suitable for onboarding, production reviews, and change governance.

## Documentation map

| Document | Audience | Purpose |
| --- | --- | --- |
| [Architecture](architecture.md) | Engineering, architecture review, platform teams | Explains bounded contexts, runtime topology, dependency flow, and extension points. |
| [API Reference](api.md) | Backend, frontend, partner integrators | Documents HTTP endpoints, request parameters, response envelopes, and error semantics. |
| [Data Model](data-model.md) | Backend, data, analytics, SRE | Defines PostgreSQL objects, indexes, cache ownership, event contracts, and migration expectations. |
| [Operations Runbook](operations.md) | SRE, DevOps, incident response | Covers local startup, production configuration, deployments, health checks, scaling, and incident handling. |
| [Security and Compliance](security-compliance.md) | Security, compliance, engineering leadership | Describes authentication, rate limiting, tenant isolation, policy guardrails, secrets, and audit posture. |
| [Developer Guide](developer-guide.md) | Contributors and maintainers | Describes repository layout, development workflow, test strategy, and contribution rules. |
| [Frontend Guide](frontend.md) | Frontend, platform, release teams | Documents the Next.js application, API proxy behavior, streaming routes, build pipeline, and runtime variables. |
| [ZEAZ Protocol](zeaz-protocol.md) | Protocol engineers, node operators | Summarizes the signed task-market protocol and references the versioned spec. |
| [Source Coverage Checklist](source-checklist.md) | Maintainers, reviewers | Audits full source-code, logic, option, function, and documentation coverage by repository area. |
| [ZEAZ Validator Architecture](zeaz-validator-architecture.md) | Node operators, protocol engineers | Describes validator/node responsibilities and local testnet shape. |
| [Protocol v1.0.0 Spec](protocol/v1.0.0/spec.md) | Protocol implementers | Canonical versioned protocol specification. |
| [Protocol v1.0.0 Rules](protocol/v1.0.0/rules.md) | Protocol implementers, governance | Versioned validation and execution rules. |
| [Protocol v1.0.0 Governance](protocol/v1.0.0/governance.md) | Governance, operators | Versioned governance process and upgrade model. |

## System inventory

Zcino is a multi-surface repository with four major product areas:

1. **Game catalog API** - a Go REST service that exposes game catalog lookup, provider discovery, authentication, admin identity, tracking ingestion, metrics, and cross-cutting policy enforcement.
2. **Analytics ingestion** - an asynchronous tracking pipeline that validates impression/click events, buffers them in memory, writes batched rows to PostgreSQL, and optionally publishes click events to NATS.
3. **Next.js frontend** - a lobby and dashboard UI that can proxy the Go catalog API through server routes or fall back to deterministic mock data for local demos.
4. **ZEAZ protocol and node scaffolding** - reference protocol definitions, SDKs, node code, Kubernetes manifests, and local testnet assets for signed task-market experimentation.
5. **Source coverage audit** - the [source coverage checklist](source-checklist.md) maps source files, logic areas, runtime options, functions, and required documentation updates for full-repository reviews.

## Enterprise readiness conventions

- Treat documents in this directory as versioned product artifacts. Update them in the same pull request as code, configuration, API, data model, or deployment changes.
- Prefer explicit ownership, operational impact, rollback instructions, and security implications over implementation-only notes.
- Keep production defaults conservative. Development defaults may be convenient, but production deployments must override secrets, tenancy, infrastructure URLs, and credentials.
- Use the versioned protocol folder (`docs/protocol/v1.0.0/`) for wire-contract changes that must be implemented consistently across clients, validators, and SDKs.
