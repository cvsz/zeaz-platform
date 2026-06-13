# Cloudflare Change Evidence Archive — Phase 16

## 1. Archive Model Overview

The Cloudflare Change Evidence Archive is an immutable, structured repository of evidence for all changes executed on the Cloudflare platform within the ZeaZ Platform. It acts as the single source of truth (SSoT) for:
- CI validation logs
- Baseline diff checks
- Release approvals and checklists
- Post-release live verification results
- Incident reviews associated with changes

All entries are organized in a strict directory structure, indexed centrally, and governed by an immutable change-tracking process to ensure absolute change auditability.

## 2. Directory Structure

All change records must reside in the [evidence directory](file:///home/zeazdev/zeaz-platform/docs/infra/evidence/cloudflare) using the following directory layout:

```text
docs/infra/evidence/cloudflare/
  README.md              ← archive overview and usage guide
  index.md               ← running index of all change records
  YYYY/
    MM/
      CHANGE-ID/
        summary.md                  ← what changed, who approved, when
        ci-report.md                ← CI gate output (sanitized)
        baseline-diff.md            ← diff against last known baseline
        scanner-output.json         ← sanitized scanner result (no secrets)
        release-approval.md         ← filled release approval template
        post-release-verification.md← verified gate results after release
        incident-review.md          ← filled if incident occurred (optional)
```

## 3. CHANGE-ID Naming Convention

Every change record directory and file must be labeled with a unique CHANGE-ID of the following format:
```text
CF-YYYY-MM-NNN
```
Where:
- `CF` indicates a Cloudflare change.
- `YYYY` is the 4-digit calendar year of the change.
- `MM` is the 2-digit calendar month of the change (zero-padded).
- `NNN` is a 3-digit sequential number starting at `001` each month.

*Example*: `CF-2026-06-001` represents the first Cloudflare change in June 2026.

## 4. How to Open a Change Record

1. **Allocate CHANGE-ID**: Query the [index template](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-index-template.md) or the current index file in the archive to find the next sequential number for the current month.
2. **Create Branch**: Create a dedicated git branch using the naming convention `fix/cloudflare-change-evidence-archive` or `feat/cf-change-<change-id>`.
3. **Initialize Folder**: Under `docs/infra/evidence/cloudflare/YYYY/MM/`, create the folder named after the `CHANGE-ID`.
4. **Draft Summary**: Create `summary.md` using the templates, explaining the target scope and purpose of the change.
5. **Add to Index**: Register the open change in `docs/infra/evidence/cloudflare/index.md` with status `OPEN`.

## 5. How to Close and Archive a Change Record

1. **Execute Change**: Once the release approval process is completed, the manual release runbook is executed.
2. **Capture Evidence**: Dump post-release verification results, sanitized CI outputs, and baseline diff reports into the change folder.
3. **Verify Compliance**: Run `make validate` or `scripts/cloudflare/validate-cloudflare-config.sh` to ensure all configurations remain clean.
4. **Update Index**: Change the status of the record in `docs/infra/evidence/cloudflare/index.md` to `CLOSED`.
5. **Submit PR**: Merge the change branch containing the evidence files into `main`. The evidence becomes an immutable part of the git history.

## 6. Retention and Safety Rules

- **Sanitized Examples Only**: No production secrets, private keys, API tokens, SAML credentials, or raw Cloudflare authentication headers are allowed in the archive. Use placeholder tokens (`00000000000000000000000000000000`) or standard domains like `example.invalid`.
- **Retention**: For retention guidelines by document type, refer to the [Cloudflare Evidence Retention Policy](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-retention-policy.md).
