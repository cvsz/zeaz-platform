# Cloudflare Access Security Governance Plan

## Purpose
Build a REVIEW-FIRST Cloudflare governance phase for Access applications, policies, security headers, and Cloudflare rulesets.

## Scope
1. Cloudflare Access / Zero Trust ownership
2. Access applications, policies, groups, IdP references, service tokens
3. Security headers ownership
4. Cloudflare rulesets / WAF / rate-limit / redirect / transform governance
5. Offline validation gates

## Non-goals
- Deploying anything to production.
- Mutating Cloudflare state.

## No-mutation Safety Policy
This phase must NOT deploy anything and must NOT mutate Cloudflare. The goal is evidence, inventory, risk classification, ownership mapping, and safe review documentation only.

## Ownership Model
- **Access / Zero Trust**: Owned by security governance module/docs.
- **Security Headers**: Owned either by Cloudflare Rulesets, app middleware, Nginx, or Workers.
- **Rulesets / WAF**: Cloudflare Rulesets manage WAF and rate limit rules.

## Risk Labels
- `missing-owner`, `missing-domain`, `broad-allow-policy`, `bypass-policy-risk`, `service-token-secret-risk`, `identity-provider-review-required`, `domain-overlap`, `stale-resource-syntax`
- `missing-security-header`, `duplicate-header-owner`, `conflicting-header-value`, `hsts-review-required`, `csp-review-required`, `permissive-frame-policy`, `missing-https-redirect`
- `broad-skip-rule`, `broad-allow-rule`, `duplicate-ruleset-owner`, `legacy-page-rule`, `waf-review-required`, `rate-limit-review-required`, `redirect-routing-overlap`
- `manual-review-required`, `ok`

## Remediation Workflow
1. Run offline scanners to identify risks.
2. Produce markdown inventory docs.
3. Review manual decisions queue.
4. Implement remediation in follow-up phases.

## Manual Decisions Needed Before Live Changes
1. Which ZEAZ domains require Access protection?
2. Which domains must remain public?
3. Which apps require service-token auth?
4. Who owns Access policy reviews?
5. What is the source of truth for security headers?
   - Cloudflare rulesets
   - app middleware
   - Nginx
   - Workers
6. What is the source of truth for WAF / rate limits?
7. Should broad allow/bypass rules be forbidden in CI?
8. Should HSTS preload be enabled later?
9. Should CSP be enforced or report-only first?
10. Should Phase 10 add CI enforcement?
