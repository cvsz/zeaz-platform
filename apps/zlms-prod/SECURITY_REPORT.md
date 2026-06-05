# Security Report

## Scope

This remediation pass focused on high-risk application flaws that were directly observable in the ASP.NET Web Forms codebase: arbitrary file write/path traversal, SQL injection through concatenated statements, reflected script injection in client-side notifications, and certificate-template directory traversal.

## Findings fixed

### 1. Unsafe upload path construction

Multiple upload endpoints concatenated `Request["ID"]` and attacker-controlled file names directly into server paths before calling `SaveAs`. This allowed path traversal, arbitrary file overwrite, dangerous extension uploads, and unbounded upload sizes.

**Remediation:** centralized upload validation in `FileUploadSecurity`, including safe owner identifiers, allow-listed extensions, size limits, canonical path checks, server-side filename normalization, and collision-resistant generated filenames. Updated course, question, QA activity, QA result, and QA evidence upload flows to use the centralized guard.

### 2. SQL injection in upload metadata and registration lookup

Several endpoints persisted upload metadata by concatenating request IDs, file names, file paths, and timestamps into SQL strings. User registration also checked duplicate users with a concatenated username query.

**Remediation:** converted remediated statements to parameterized `SqlCommand` execution through existing `CConnect` parameter methods or direct `SqlCommand` usage. `CConnect.sqlCmdText` now clears stale parameters before preparing a new command.

### 3. Reflected JavaScript injection in notification helpers

Notification helpers embedded arbitrary message text inside a JavaScript string literal without JavaScript encoding.

**Remediation:** encoded notification message strings with `HttpUtility.JavaScriptStringEncode` before registering startup scripts.

### 4. Certificate template path traversal

Certificate detail generation used a raw request ID as a directory name and copied a template file through string-concatenated paths.

**Remediation:** the certificate flow now validates the directory segment through the centralized path guard and combines canonical paths with `Path.Combine`.

## Residual risk

This repository contains a large amount of decompiled legacy Web Forms code and vendored third-party assets. Additional concatenated SQL and HTML-rendering patterns remain outside this targeted pass and should be remediated iteratively with CodeQL/Semgrep findings, regression tests, and database-aware validation.

## Recommended next steps

1. Run CodeQL and Semgrep in CI for every pull request.
2. Continue replacing `CConnect.sqlCmd(string)` and `sqlCmdReturn(string)` call sites with parameterized statements.
3. Add authorization checks to upload/delete web methods before mutating records.
4. Move uploaded files outside the executable web root where IIS configuration allows it.
5. Add malware scanning for uploaded content before making files available to users.
