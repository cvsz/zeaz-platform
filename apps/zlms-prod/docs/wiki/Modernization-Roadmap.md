# Modernization Roadmap

## Guiding principles

- Preserve LMS behavior while shrinking legacy risk.
- Prefer small, testable, reversible changes.
- Keep production secure defaults intact.
- Treat modernization as a staged migration, not a big-bang rewrite.
- Maintain a clear line between first-party app code and vendor/generated payloads.

## Phase 0: Stabilize and document

- Maintain this wiki and module inventory.
- Keep install/readiness scripts passing.
- Document database restore and environment-specific configuration.
- Identify production-exposed directories and disable unnecessary utilities.
- Build smoke tests for login, course, QA/report, upload, ebook, and certificate flows.

## Phase 1: Security debt reduction

- Convert raw SQL concatenation to parameterized commands.
- Centralize authorization checks for rank/group/module access.
- Route all uploads through `FileUploadSecurity`.
- Replace empty catch blocks with centralized error handling and audit logging.
- Add structured logs with correlation IDs for critical operations.
- Introduce password-hash migration while supporting staged legacy verification.

## Phase 2: Runtime hardening

- Move from inline JavaScript/CSS toward nonce/hash CSP.
- Apply Trusted Types patterns where browser support and code paths allow.
- Enforce upload directory no-execute policies.
- Remove or isolate phpMyAdmin/test/phpinfo/sample PHP exposure.
- Add dependency and binary provenance documentation for DevExpress and embedded vendor packages.

## Phase 3: Frontend/runtime evolution

The repository includes `frontend/`, `security/runtime/`, `trusted-types.ts`, `hydration-integrity.ts`, and migration scripts that can support a hardened frontend runtime. Use them to incrementally:

- Inventory unsafe DOM sinks and inline event handlers.
- Move static UI behaviors into typed modules.
- Introduce secure rendering wrappers.
- Validate hydration/integrity assumptions.
- Isolate high-risk dynamic content in sandboxed runtimes.

## Phase 4: Data and service boundaries

- Create schema-first migrations for new database changes.
- Introduce a repository/service layer for new features.
- Define API boundaries for course, QA, question, and reporting modules.
- Add integration tests against restored test databases.
- Consider strangler-pattern extraction only after authorization and data access are centralized.

## Phase 5: Deployment modernization

- Build signed, reproducible release artifacts.
- Run CI on ephemeral zero-trust runners.
- Add environment promotion gates and rollback automation.
- Track SBOM/provenance and vulnerability exceptions.
- Document operational SLOs, alerts, and disaster recovery drills.

## Refactor priority matrix

| Priority | Target | Reason |
| --- | --- | --- |
| P0 | Authentication, password reset, authorization, upload, report generation | Direct security impact. |
| P1 | Course assignment, QA/asset workflows, question edits/deletes | User data integrity and high-volume workflows. |
| P2 | Knowledge/forum/vendor exposure | Large attack surface and stale dependencies. |
| P3 | UI cleanup and static asset modernization | Needed for CSP/Trusted Types but should follow core security fixes. |
