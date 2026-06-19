# Frontend Runtime Migration Plan

## Target Architecture

The migration moves the legacy WebForms/asset runtime to a strict TypeScript and SSR-first architecture using Next.js application-router conventions. Server components own data access, routing, and HTML generation; client components are limited to explicitly declared interactive islands with narrow props and no ambient DOM mutation.

## Compatibility Strategy

1. **Strangler routes:** keep legacy ASP.NET routes active while new SSR routes are introduced behind a reverse-proxy route map.
2. **Island hydration:** migrate high-value pages first by rendering static shells on the server and hydrating only typed interactive widgets.
3. **Adapter layer:** wrap remaining jQuery and Bootstrap plugin behavior behind typed component adapters, then remove adapters as pages are rebuilt.
4. **CSP report-only phase:** deploy the generated CSP in report-only mode for one release, triage violations, then enforce `require-trusted-types-for 'script'`.
5. **Dual-build validation:** keep the legacy bundle and the SSR bundle in CI until the SSR route reaches parity for accessibility, performance, and security checks.

## Codemod Workflow

1. Run `npm run audit:frontend-runtime` to refresh migration reports.
2. Run `npm run codemod:frontend-runtime -- --dry app/path/to/page.js` for a dry run.
3. Review generated replacements for jQuery selectors, unsafe HTML sinks, dynamic code execution, and TypeScript annotations.
4. Apply codemods to a small route slice and commit page-by-page for rollback isolation.
5. Run strict type checking, CSP tests, and browser smoke tests before switching traffic.

## Rollback Plan

1. Route traffic back to the legacy path by removing the reverse-proxy mapping for the migrated route.
2. Disable CSP enforcement by switching to report-only headers while keeping nonce generation in place.
3. Revert the page-level codemod commit; codemod commits must stay route-scoped.
4. Restore the previous static asset manifest and invalidate CDN caches for the affected route.
5. Keep the runtime attestation event stream enabled to confirm the legacy fallback does not introduce new unsafe sinks.

## Production Readiness Gates

- TypeScript strict mode passes with no `any` escape hatches.
- No `eval`, `new Function`, string timers, inline scripts, or unsafe DOM sinks remain in the migrated route.
- Trusted Types policy is active and CSP contains a per-request nonce.
- Hydration integrity snapshots match before client interactivity is enabled.
- Server components own data access; client components receive serialized, validated props only.
