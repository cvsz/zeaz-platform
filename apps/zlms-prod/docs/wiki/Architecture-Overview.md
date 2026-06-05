# Architecture Overview

## Executive summary

zLMS is a monolithic ASP.NET Web Forms application that preserves a legacy police-training LMS while adding modern security and operational scaffolding around it. The app runs from `app/lms.csproj`, uses SQL Server through `cdas_conn`, renders Web Forms pages with master pages, and depends on DevExpress UI/reporting assemblies.

```text
Browser
  |
  v
ASP.NET Web Forms pages (.aspx + .aspx.cs)
  |
  +--> Master pages enforce coarse session/rank navigation
  +--> C# code-behind executes LMS workflows
  +--> DevExpress controls render grids/schedulers/reports
  |
  v
SQL Server POLICE_LMS database
  |
  v
Uploaded files, courseware, ebooks, knowledge assets, reports
```

## Runtime stack

| Layer | Current implementation |
| --- | --- |
| Web framework | ASP.NET Web Forms, .NET Framework 4.6.1 |
| Compatibility runtime | Mono on Ubuntu 24.04 for the repository installer path |
| Data access | `System.Data.SqlClient`, `asp:SqlDataSource`, and legacy helper methods |
| UI controls | DevExpress 16.2 references in the project file; older binaries also exist in build output/vendor folders |
| Static assets | First-party Web Forms assets plus embedded vendor/static bundles under `app/assets`, `app/bin`, `app/courseware`, `app/knowledge*`, `app/phpMyAdmin`, and related folders |
| Security support | `SecuritySupport.cs`, secure Web.config settings, runtime/security TypeScript policy scaffolding, and CI security workflows |

## Repository map

| Path | Purpose | Ownership guidance |
| --- | --- | --- |
| `app/` | Main LMS application, Web Forms pages, code-behind, master pages, configuration, static/uploaded assets, and vendor payloads. | Treat first-party `.cs`, `.aspx`, and `Web.config` as app code; avoid mass edits to vendor/build output. |
| `db/` | SQL Server database backup/data/log files. | Use only for restoration/reference; do not commit regenerated production data. |
| `scripts/` | Readiness checks, installer/package generation, DevExpress validation, modernization and security analysis scripts. | Prefer non-mutating checks unless explicitly applying a migration. |
| `security/` | Runtime security architecture, policy JSON/YAML, reports, and TypeScript runtime components. | Keep controls aligned with OWASP ASVS Level 2+ and zero-trust requirements. |
| `frontend/` | Modern frontend runtime hardening/isolation prototypes. | Use as migration targets, not as a replacement for legacy pages until validated. |
| `architecture/` | Migration plans and generated reports. | Keep architecture decisions close to current repo state. |
| `.github/` | Dependabot, CodeQL config, PR template, and many security/modernization workflows. | Workflow actions must remain immutable/pinned per repo policy. |
| `z-runner/` | Hardened self-hosted GitHub Actions runner fabric. | Separate operational product; manage credentials through GitHub App and secret managers only. |
| `docs/wiki/` | Source copy of the GitHub Wiki content. | Sync to `https://github.com/cvsz/zlms-prod/wiki` when publishing. |

## Request and session flow

1. Anonymous users reach login or public/static pages.
2. `login.aspx.cs` validates username/password inputs, applies a cache-backed rate limiter, queries active members using parameterized SQL, clears/rebuilds the ASP.NET session, and redirects authenticated users to `Default.aspx`.
3. Master pages read session keys such as `SessionID`, `FULLNAME`, `RANK`, and `group` to drive navigation and coarse role redirects.
4. Feature modules execute page-specific SQL and file operations.
5. Security telemetry writes structured audit/security events through the `zlms.security` trace source to `App_Data/security.log`.

## Important architectural constraints

- **Legacy decompiled code:** many files include decompiler comments and legacy patterns. Preserve behavior carefully and add tests/checks around security-critical rewrites.
- **Mixed SQL style:** some pages use parameterized commands; others still build SQL strings. Treat all request, session, uploaded file, and database-originated values as untrusted.
- **Vendor/build output:** directories such as `app/bin`, `app/obj`, `app/assets`, `app/phpMyAdmin`, `app/knowledge*`, and `app/courseware` contain large generated or third-party payloads. Avoid broad formatting/codemod passes there.
- **DevExpress licensing:** required DevExpress DLLs are not normal NuGet packages in this repo. Validate local availability before build/publish.
- **Production posture:** `app/Web.config` is intentionally release-oriented (`debug="false"`, custom errors on, secure cookies, secure headers). Do not revert it for convenience.
