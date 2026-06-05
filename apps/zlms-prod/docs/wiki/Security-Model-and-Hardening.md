# Security Model and Hardening

## Baseline security posture

The repository is governed by OWASP ASVS Level 2+ and zero-trust expectations. Treat every external payload, request parameter, session value, upload, webhook payload, dependency, and generated patch as untrusted until validated.

## Current app controls

| Control | Current implementation |
| --- | --- |
| Secure Web.config defaults | Debug disabled, request validation enabled, encrypted/MACed ViewState, secure HttpOnly Strict cookies, custom errors on. |
| Secure headers | `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, and CSP configured in `app/Web.config`. |
| Login validation | Username/password validation, cache-backed rate limiting, structured security telemetry, and parameterized login query. |
| Password reset | Email validation, generic user-facing responses to prevent account enumeration, random reset token generation, parameterized inserts, SMTP error logging. |
| Upload hardening | `FileUploadSecurity` validates size, owner segment, extension allow-list, safe path containment, generated filenames, and directory creation. |
| Security telemetry | `SecurityTelemetry` generates/propagates trace IDs and writes structured events to the configured trace source. |
| Release checks | `scripts/live_readiness_check.sh` verifies production Web.config posture and scoped source hygiene. |

## Known legacy risk areas

Prioritize review/remediation in these areas:

1. **Raw SQL concatenation:** legacy modules still build SQL with user/session/page values.
2. **Authorization drift:** many pages rely on session variables or UI state; sensitive operations should re-fetch authorization from the database.
3. **Broad catch blocks:** empty `catch` blocks hide failures and can bypass audit trails.
4. **Vendor exposure:** embedded `phpMyAdmin`, `phpinfo.php`, test PHP, database examples, and generated build artifacts must not be internet-accessible unless explicitly approved.
5. **Inline scripts/styles:** CSP currently permits `'unsafe-inline'` for legacy compatibility. Long-term goal is nonce/hash-based scripts and Trusted Types where applicable.
6. **Legacy password storage:** login compares the submitted password against the database column directly. Plan a staged migration to salted adaptive password hashing.
7. **Large generated directories:** `app/bin`, `app/obj`, and vendor trees can contain stale binaries/assets. Do not treat their presence as production approval.

## Secure coding checklist

Before merging app changes:

- Validate all inputs at trust boundaries.
- Use parameterized SQL for all database access.
- Encode output for the correct context: HTML, JavaScript string, URL, CSS, or attribute.
- Verify authorization server-side using fresh data.
- Add audit/security telemetry for authentication, authorization, upload, report generation, and administrative changes.
- Use `FileUploadSecurity` for all file uploads.
- Avoid logging secrets, passwords, tokens, connection strings, cookies, or full request bodies.
- Preserve secure Web.config settings.
- Keep public endpoints rate-limited.
- Add tests or scripted checks for security-sensitive changes.

## Upload policy

Current centralized upload policy:

- Maximum file size: 50 MB.
- Owner directory segment: alphanumeric plus `_` or `-`, length 1-64.
- File extensions: allow-listed Office/PDF/text/image/ZIP-style document formats.
- Stored filename: generated timestamp + GUID + sanitized original base name.
- Path validation: resolved path must stay inside the intended upload root.

When adding a new upload feature, do not call `SaveAs` directly. Route through `FileUploadSecurity.Save`, store the generated file name in metadata, and deny execute permissions in upload directories.

## Incident response basics

For suspected compromise:

1. Preserve web server logs, `App_Data/security.log`, database audit data, and relevant uploaded files.
2. Disable affected public endpoints or restrict network access.
3. Rotate secrets, SMTP credentials, database credentials, and certificates as needed.
4. Search for malicious files in upload/vendor-exposed directories.
5. Review recent commits, workflow runs, artifacts, and runner telemetry.
6. Restore from a known-good backup if integrity is in doubt.
7. Document root cause and add regression controls.

## Security roadmap

- Complete raw SQL parameterization across all modules.
- Introduce central authorization service/helpers for roles/groups/ranks.
- Migrate password storage to a modern adaptive hash with staged rehash-on-login.
- Remove inline scripts/styles or move to nonce/hash CSP.
- Isolate/remove web exposure for phpMyAdmin/test/phpinfo/sample folders.
- Add SAST/DAST gates and upload/path traversal regression tests.
- Add database migration history and audit-event retention policies.
