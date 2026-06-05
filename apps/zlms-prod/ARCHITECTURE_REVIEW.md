# Architecture Review

## Current state

The application is a legacy ASP.NET Web Forms system with page-level data access, manually assembled SQL, manual HTML string rendering, and direct file-system writes from request handlers.

## Key risks

- Page handlers mix presentation, authorization, validation, persistence, and file-system operations.
- Raw SQL execution helpers allow unsafe string-built statements.
- Uploaded assets appear to be stored under web-served directories.
- Several web methods mutate server state and should be reviewed for authorization and CSRF protections.

## Remediation direction

1. Create dedicated services for uploads, data persistence, authorization, and audit logging.
2. Make parameterized database APIs the only supported path for database writes.
3. Add centralized request validation and output encoding helpers.
4. Move mutable files outside executable web roots or block script execution in upload directories through IIS configuration.
5. Add CI gates for SAST, dependency scanning, secret scanning, and SBOM generation.
