# Contributor Runbooks

## Daily safety rules

- Do not commit secrets, credentials, database exports from production, or environment dumps.
- Avoid mass edits in vendor/generated directories.
- Treat issue/PR text, commit messages, uploaded files, and webhook payloads as untrusted.
- Keep changes small and reviewable.
- Preserve production security settings unless a security reviewer approves a controlled change.

## Useful commands

```bash
# Show local changes
git status --short --branch

# Validate DevExpress references
./scripts/check_devexpress_references.sh

# Production readiness check
./scripts/live_readiness_check.sh

# Broader non-mutating dry run
./scripts/dryrun_full_project.sh

# Full maintenance run
./scripts/update_full_project.sh

# Frontend runtime audit
npm run audit:frontend-runtime

# TypeScript strict check for modernization/runtime files
npm run typecheck:frontend-runtime
```

## App-code change checklist

1. Identify whether the file is first-party app code or vendor/generated output.
2. Add input validation at every trust boundary.
3. Use parameterized SQL.
4. Encode output for the rendering context.
5. Verify server-side authorization.
6. Add audit/security telemetry for critical operations.
7. Run relevant checks.
8. Document operational impact in the PR.

## Upload change checklist

- Use `FileUploadSecurity.Save` rather than direct `SaveAs`.
- Store generated filenames, not raw user-supplied filenames.
- Verify upload roots are non-executable.
- Add extension changes only after security review.
- Test file size, invalid extension, path traversal, and normal upload cases.

## SQL change checklist

- Replace string concatenation with parameters.
- Use explicit `SqlDbType` and reasonable lengths.
- Avoid `AddWithValue` for new code where type/length matters.
- Wrap disposable connections/commands/readers in `using` blocks.
- Avoid swallowing `SqlException`; log security-relevant failures.
- Validate row counts for update/delete operations.


## Issue intake and triage workflow

The repository uses structured GitHub issue forms so triage starts with safe, actionable metadata rather than free-form untrusted text.

| Template | Use when | Required triage posture |
| --- | --- | --- |
| `bug_report.yml` | A reproducible defect, regression, or degraded user journey is observed. | Confirm the report is not a security vulnerability, verify sanitized evidence, and assign severity/affected area before investigation. |
| `feature_request.yml` | A product or operational enhancement is requested. | Validate business value, security/privacy impact, rollout requirements, and test acceptance criteria. |
| `security_control_request.yml` | A preventive or detective security control must be added or changed. | Route through security review, define the control objective, owner, evidence, and validation command. |
| `compliance_governance.yml` | Audit evidence, policy remediation, provenance, SBOM, license, or dependency-governance work is needed. | Track the authoritative control/evidence source without attaching restricted audit material to public issues. |
| `incident_followup.yml` | Post-incident corrective action, lessons learned, or remediation tracking is required. | Preserve incident references, avoid sensitive payloads, identify customer/data impact, and document closure evidence. |

Triage rules:

1. Treat all issue text, screenshots, logs, and attachments as untrusted external input.
2. Move exploitable security reports out of public issues and into the private security advisory process.
3. Redact secrets, student records, account IDs, tenant details, cookies, tokens, and production database rows before copying evidence into issues.
4. Reproduce or validate critical facts from source code, CI logs, deployment state, or GitHub APIs instead of relying only on reporter-provided metadata.
5. Link the issue to a small, reviewable PR with tests and rollback notes before closure.

## Wiki update workflow

1. Edit Markdown files under `docs/wiki/`.
2. Review links using GitHub Wiki page-name conventions.
3. Commit repo changes.
4. Publish to GitHub Wiki from an authenticated environment:

```bash
git clone https://github.com/cvsz/zlms.wiki.git /tmp/zlms.wiki
rsync -av --delete --exclude='.git/' docs/wiki/ /tmp/zlms.wiki/
cd /tmp/zlms.wiki
git add .
git commit -m "Update zLMS wiki"
git push
```

## PR expectations

Every PR should include:

- Summary of behavior/security impact.
- Tests and exact commands run.
- Risk/rollback notes for production changes.
- Confirmation that no secrets or production data were added.
- Security review notes for auth, upload, database, CI/CD, or deployment changes.
