# Threat Model

## Primary assets

- User identities and credentials.
- Course and assessment data.
- QA evidence files and reports.
- SQL Server data store.
- Deployment secrets stored in GitHub environments.

## Primary threats

- SQL injection through raw query construction.
- Arbitrary file write and stored payload execution through uploads.
- Stored/reflected XSS through unencoded rendering.
- Unauthorized data mutation through weak page-level authorization.
- Supply-chain compromise through actions or dependencies.

## Controls added in this patch

- Central upload validation with canonical path enforcement.
- Parameterized SQL for remediated flows.
- JavaScript string encoding for remediated notification helpers.
- Safer certificate template path construction.
