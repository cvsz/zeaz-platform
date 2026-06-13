# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Added repository security policy guidelines (`SECURITY.md`).
- Added contributor guidelines (`CONTRIBUTING.md`) and Code of Conduct (`CODE_OF_CONDUCT.md`).
- Added platform development Roadmap tracker (`ROADMAP.md`).
- Added GitHub templates: Pull Request template, Bug Report form, and Feature Request form.
- Added GitHub Actions `oss-readiness.yml` workflow for automated validation.
- **ztrader frontend**: Full i18n support (en/th/zh/ja) — 80+ new translation keys, 118+ hardcoded strings replaced via `t()` across 12 component files.
- **ztrader frontend**: Mobile responsive design — LanguageSelector bottom-left on mobile, card-form tables at ≤640px, WCAG 44px touch targets, `clamp()` padding, orb hiding.
- **ztrader frontend**: Security hardening — CSP + HSTS headers, sync URL token cleanup via `replaceState()`, input validation on bot start, no error body leakage to users.
- **ztrader backend**: 16 new platform API endpoints (`api/v1/platform.py`) — auth, ticker, PnL, risk limits, exchange keys, telegram, notifications, payments, market candles.
- **ztrader frontend**: Playwright E2E test suite — 23 tests across 4 spec files (login, dashboard, settings, admin).
- **ztrader/docs/ux-ui-review-2026-06-13.md**: comprehensive UX/UI review covering all 12 pages and components — 15 evaluation criteria, page-by-page analysis, i18n gap audit, missing states checklist, component reuse recommendations, and prioritized P0/P1/P2 implementation plan.
- **ztrader frontend**: Makefile targets — `frontend-build`, `frontend-lint`, `frontend-typecheck`, `frontend-validate`, `test-e2e`, `clean`.
- Cloudflare tunnel consolidation: single tunnel `6fc5dc60` with 30+ domain ingress rules.

### Changed
- Updated `LICENSE` to specify ZeaZDev Company Limited as the copyright holder.
- Merged `zkbtrader` and `ABTPi18n` application stacks into a unified `apps/ztrader` folder.
- Renamed application folder `apps/zlms-prod` to `apps/zlms` to match standard naming.
- Upgraded `@types/react` → `^19.0.0`, `@types/react-dom` → `^19.0.0`, `@types/node` → `^22.15.3`.
- `tsconfig.json` target `es5` → `es2017` (Next.js 16 compat), excluded `.next`.
- `next.config.js` — removed unsupported `i18n`, added `turbopack.root`, security headers.
- `Dockerfile` — `--frozen-lockfile`, `COPY --chown`, `HEALTHCHECK`.

### Fixed
- Added Phase 51 and Phase 52 validation reports.
- Added CI-safe `apps/web` dependency install helper.
- Stabilized Tailwind oxide dependency install for GitHub Actions.
- All ztrader frontend pages connect to real APIs (no mock/simulated data).
- Kill switch — live state from `/health` and admin risk config, toast feedback.
- OAuth callback — token detected from URL, saved to localStorage, URL cleaned synchronously.
- Navigation — token URL-param detection on any page load; removed `console.log` of user info.
- Duplicate React keys (`{symbol}-{idx}` compound) for ticker arrays.
- Catch-block loading state bugs (now uses `finally`).
- Google Sign-In passphrase `type="password"` with `autoComplete="off"`.
- E2E test selectors — 6 flaky/failing tests fixed (ambiguous button locators, missing `h1`, strict-mode violations, wrong kill-switch button text pattern).

## [v2.1.0] - 2026-06-02

### Added
- Latest major release with new features and improvements.

## [v1.0.6-zveo-zwallet-online] - 2026-05-13

### Added
- zveo and zwallet online deployment.

## [v1.0.5-zveo-zwallet-online] - 2026-05-13

### Added
- zveo and zwallet online deployment updates.

## [v1.0.4-zwallet-integrated] - 2026-05-13

### Added
- zwallet integration into the platform.

## [v1.0.3-tunnel-online] - 2026-05-13

### Added
- Cloudflare tunnel online configuration and deployment.

## [v1.0.2-platform-stable] - 2026-05-13

### Changed
- Platform stability improvements.

## [v1.0.1-platform-stable] - 2026-05-13

### Changed
- Platform stability improvements.

## [v1.0.0-platform-stable] - 2026-05-13

### Added
- Initial stable platform release.
