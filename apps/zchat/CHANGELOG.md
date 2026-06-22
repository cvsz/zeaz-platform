# Changelog

All notable changes to ZeaZ Omega Chat are documented in this file.

## Unreleased

### Added

- Added a Node HTTP API for issuing, verifying, and revoking user keys.
- Added an authorization endpoint for downstream services to validate user keys and required scopes.
- Added a third-party application flow with apply, review, approve, and reject endpoints.
- Added OAuth-style client credentials exchange for approved third-party applications.
- Added browser UI support for creating and copying user keys from Settings.
- Added a curated Hugging Face free/open model fallback chain with user-controlled ordering.
- Added GitHub issue and pull request templates plus a local security guidance file.

### Changed

- Reduced Node module-type warnings by marking `src/` as an ESM package boundary.
- Switched the test runner from Jest to Vitest to reduce dependency risk and simplify local validation.
- Updated provider import paths to use explicit `.js` extensions where required by Node ESM resolution.

### Fixed

- Removed the remaining Node module reparse warning from the Vitest test run.
- Cleaned up API validation and test coverage for the new auth and third-party flows.
