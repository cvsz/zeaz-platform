# Cloudflare Change Evidence Archive — YYYY/MM Directory Guide

Welcome to the Cloudflare Change Evidence Archive. This folder serves as the central directory for immutable change evidence logs for the ZeaZ Platform Cloudflare deployments.

---

## Folder Layout

All changes are archived chronologically by year and month:
```text
docs/infra/evidence/cloudflare/
  README.md              ← (This file) Overview and usage guide
  index.md               ← Master index tracking all changes
  YYYY/
    MM/
      CF-YYYY-MM-NNN/    ← Individual change record folder
```

---

## How to Find a Change Record

1. **Locate the ID**: Open the [Master Index](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-index-template.md) to search by date, type, system area, or owner.
2. **Navigate to Path**: Go to the directory corresponding to the year and month of the change. For example, the evidence files for change `CF-2026-06-001` are located in:
   `docs/infra/evidence/cloudflare/2026/06/CF-2026-06-001/`

---

## Expected Folder Structure and Contents

Each change record folder (`CF-YYYY-MM-NNN`) must contain:

| File | Purpose | Requirement |
|---|---|---|
| `summary.md` | Explains what was modified and why. | Mandatory |
| `ci-report.md` | Contains copy of the CI pipeline validation logs. | Mandatory (Sanitized) |
| `baseline-diff.md` | Shows the `git diff` against the baseline config. | Mandatory |
| `scanner-output.json` | JSON output from the offline port / DNS scanner. | Optional (Sanitized) |
| `release-approval.md` | Copy of the filled release approval checklist. | Mandatory |
| `post-release-verification.md` | Verification evidence (ping / curl logs) after apply. | Mandatory |
| `incident-review.md` | Review log if the change triggered an incident. | Conditional |

---

## Sanitization Standards

To protect ZeaZ Platform resources, all files stored in this archive must be fully sanitized:
- **No API Tokens**: Mask any tokens with `[REDACTED]` or replace with a mock hash.
- **No IP Addresses**: Mask production server IP addresses; use `127.0.0.1` or standard mock domains like `origin.example.invalid`.
- **No Custom User Metadata**: Scrub email addresses or phone numbers of private customers. Use role-based identifiers (e.g., `zveo-admin`, `wallet-operator`).
