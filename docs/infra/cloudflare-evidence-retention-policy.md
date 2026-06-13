# Cloudflare Evidence Retention Policy — Phase 16

## 1. Purpose

This policy defines the retention periods, storage restrictions, audit controls, and ownership roles for all Cloudflare change evidence archived in the ZeaZ Platform repository. This ensures compliance with security audit trail requirements while preventing the accidental storage of sensitive secrets.

## 2. Retention Periods by Evidence Type

All Cloudflare platform change evidence must be retained according to the following schedule:

| Evidence Type | Minimum Retention | Maximum Retention | Storage Location | Notes |
|---|---|---|---|---|
| **CI Reports** | 90 days | Indefinite (Git history) | `docs/infra/evidence/cloudflare/` | Sanitized logs only |
| **Release Approvals** | 1 year | Indefinite (Git history) | `docs/infra/evidence/cloudflare/` | Required for compliance |
| **Incident Reviews** | 2 years | Indefinite (Git history) | `docs/infra/evidence/cloudflare/` | Post-incident templates |
| **Drift Reports** | 1 year | Indefinite (Git history) | `docs/infra/` | History of weekly checks |
| **Exception Register** | 1 year after closure | Indefinite | [cloudflare-drift-exception-register.md](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-drift-exception-register.md) | Retains historical context |

Since the archive resides in the git repository, the main git history serves as an indefinite store. However, local or secondary copies stored in external backup buckets or logging systems must adhere to these minimum durations.

## 3. Archive Ownership

- **Cloudflare Runtime Owner**: Primary owner responsible for the creation of directories, populating evidence, updating the [index template](file:///home/zeazdev/zeaz-platform/docs/infra/cloudflare-evidence-index-template.md), and ensuring all entries are properly cataloged.
- **Platform Security Team**: Responsible for performing secret leak scanning and verifying compliance with the sanitization guidelines.

## 4. Deletion / Expiry Process

Because files committed to git are part of the permanent history, standard deletes via `git rm` do not purge historical commits.
- If a record exceeds its maximum retention window and needs physical deletion from repository history for compliance or storage optimization, it requires review board approval and git history rewriting (e.g., `git-filter-repo`).
- For secondary offline backups, a quarterly automated clean-up job must run to prune logs older than the minimum retention window.

## 5. What Must Never Be Deleted

- The master change index file `docs/infra/evidence/cloudflare/index.md`
- High-severity incident reviews
- Executive sign-offs on release approvals for major network topology changes

## 6. What Must Never Be Stored

Under no circumstances may any of the following items be stored within the evidence archive:
- Real API tokens or credentials (`CLOUDFLARE_API_TOKEN`, `CF_API_KEY`, etc.)
- Active systemd service tokens or tunnel credential json files (`creds.json`)
- Private keys (`*.key`, `*.pem`)
- Raw API responses containing unmasked sensitive values
- Active database passwords or configuration secrets
