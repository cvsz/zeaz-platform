# ZeaZ Platform full repository audit report

Generated: 2026-06-10T02:00:00+07:00  
Repository: `cvsz/zeaz-platform`  
Default branch: `main`  
Audit mode: GitHub-accessible repository review plus durable local audit generator

## Executive summary

The repository contains mature release-gating infrastructure, but the current generated evidence still shows go-live blockers. The most important blocker is the existing `apps-source-review` evidence: `apps/openwork` is marked with two critical findings and one warning. The final-release process must not claim production-ready status until these findings are reviewed and either fixed or explicitly accepted by the release owner.

A repeatable audit generator has been added at:

```text
scripts/repo/full-repo-audit.sh
```

The canonical final go-live verifier remains:

```text
scripts/platform/final-go-live-complete.sh
```

## Release decision

Status: **GO-LIVE BLOCKED UNTIL LOCAL AUDIT PASSES**

Reason:

- Existing generated source review shows `apps/openwork` with `Critical = 2` and `Warnings = 1`.
- The final verifier must be run locally on `/home/zeazdev/zeaz-platform` to regenerate current evidence.
- GitHub connector review cannot execute local Terraform, Docker, dependency install, Cloudflare token checks, or live route checks.

## Critical findings

### P0-1: `apps/openwork` is not release-clean in generated source review

Evidence from `reports/platform/apps-source-review.md`:

```text
openwork | docker, node, npm, pnpm | Critical: 2 | Warnings: 1
```

Detailed findings:

```text
critical nested_git: Nested .git directory exists under app path
warn local_env_file: Local env file exists: apps/openwork/apps/app/.env.migration-release
critical secret_like_hits: 34 secret-like hit(s) found; review redacted report before commit
```

Impact:

- Nested Git metadata means the app import/adoption boundary is not clean.
- Local env files can create accidental release drift.
- Secret-like hits may be false positives in tests, but they must be reviewed before final release.

Required fix:

```bash
cd /home/zeazdev/zeaz-platform
python3 scripts/platform/review-apps-source.py --fail-on-critical
```

If the command fails, review `reports/platform/apps-source-review.md`, then fix or explicitly classify the findings.

### P0-2: Final go-live evidence must be regenerated locally

The final release report defines completion as:

```text
bash scripts/platform/final-go-live-complete.sh exits 0
reports/platform/final-go-live-complete.md says Status: GO-LIVE GATES PASSED
```

Required command:

```bash
cd /home/zeazdev/zeaz-platform
git pull --ff-only origin main
chmod +x scripts/platform/final-go-live-complete.sh scripts/repo/full-repo-audit.sh
bash scripts/repo/full-repo-audit.sh
bash scripts/platform/final-go-live-complete.sh
```

## Root causes

| Area | Root cause | Release impact |
|---|---|---|
| App adoption | `apps/openwork` appears to retain nested Git metadata | Blocks clean monorepo ownership/release evidence |
| Source review | Secret-like matches are detected in source/test paths | Blocks strict source review until confirmed safe |
| Env hygiene | Non-example local env file is present under app tree | Warning; must be untracked and protected |
| Evidence freshness | Reports are generated artifacts and can become stale | Local rerun required before final release |
| Infrastructure validation | Terraform/Cloudflare checks require local credentials/tools | Cannot be proven through static GitHub review alone |

## Existing release gates found

The root `Makefile` includes major release-gating targets:

```text
repo-deep-dive
makefile-audit
apps-deep-dive
apps-inventory-validate
phase58-validate
apps-routing-generate
phase59-validate
apps-stack-deep-dive
apps-port-refactor-generate
phase60-validate
build-all-stacks
build-all-stacks-full
go-live-preflight
go-live-report
apps-source-review
apps-source-review-strict
apps-source-review-report
```

This is a strong release foundation. The remaining task is to make the generated evidence pass cleanly.

## Security audit

### Positive controls

- The go-live verifier is explicitly read-only.
- It does not deploy, mutate Cloudflare, rotate tokens, run live trading, run social automation, or apply Terraform.
- It checks forbidden tracked release files such as `.env`, `.tfstate`, `.tfvars`, `.tfplan`, `.db`, `.log`, and private key filenames.
- Source review redacts secret-like previews.

### Blocking/security-sensitive items

- `apps/openwork` secret-like hits require manual review.
- `.env.migration-release` under `apps/openwork/apps/app/` must remain untracked or be converted to `.env.example` if it is meant to be committed.
- Production secrets must remain in local secret stores, GitHub secrets, Cloudflare secrets, or server-local env files only.

## Infrastructure and Cloudflare audit

### Current status

The repository contains Cloudflare/Terraform release gates and app routing/port generation targets. However, final validity depends on local execution because the checks need installed Terraform, Cloudflare credentials, tunnel credentials, and live origins.

Required local validation:

```bash
make apps-port-refactor-report
make apps-routing-report
bash scripts/platform/final-go-live-complete.sh
```

Then verify public routes:

```bash
curl -I https://zeaz.dev
curl -I https://www.zeaz.dev
curl -I https://zcfdash.zeaz.dev
curl -I https://api-zcfdash.zeaz.dev
curl -I https://zoffice.zeaz.dev
curl -I https://app.zeaz.dev
curl -I https://ztrader.zeaz.dev
curl -I https://zdash.zeaz.dev
curl -I https://api-zdash.zeaz.dev
curl -I https://zaiz.zeaz.dev
```

## Performance and build audit

The repo has safe and full build targets:

```bash
make build-all-stacks
RUN_INSTALL=true RUN_DOCKER_BUILD=true make build-all-stacks-full
```

Recommended production evidence order:

```bash
make build-all-stacks
bash scripts/repo/full-repo-audit.sh
bash scripts/platform/final-go-live-complete.sh
```

For full release evidence:

```bash
RUN_INSTALL=true RUN_DOCKER_BUILD=true make build-all-stacks-full
bash scripts/repo/full-repo-audit.sh
bash scripts/platform/final-go-live-complete.sh
```

## CI and regression audit

Minimum local regression suite before release:

```bash
make makefile-audit
make apps-source-review-strict
make apps-port-refactor-generate
make go-live-preflight
bash scripts/repo/full-repo-audit.sh
bash scripts/platform/final-go-live-complete.sh
```

The release owner should save these generated artifacts:

```text
reports/platform/apps-source-review.md
reports/platform/apps-source-review.json
reports/platform/build-all-stacks.md
reports/platform/go-live-preflight.md
reports/platform/final-go-live-complete.md
reports/platform/full-repo-audit.json
docs/reports/generated/full-repo-audit-report.md
```

## Breaking changes

No application source behavior was changed by this audit. The new file `scripts/repo/full-repo-audit.sh` is read-only and generates reports only.

## Patch summary

Added:

```text
scripts/repo/full-repo-audit.sh
docs/reports/generated/full-repo-audit-report.md
```

Previously added final release assets:

```text
scripts/platform/final-go-live-complete.sh
docs/releases/FINAL_GO_LIVE_COMPLETE.md
```

## Remaining risks

| Risk | Severity | Status | Required owner action |
|---|---|---|---|
| `apps/openwork` critical source review findings | P0 | Open | Run strict source review and resolve/accept findings |
| Local-only env file under app tree | P1 | Open | Confirm untracked, chmod 600, or convert to example |
| Terraform/Cloudflare validation not executed in GitHub connector | P1 | Open | Run local final verifier |
| Live routes not verified from production origin | P1 | Open | Run curl checks after services/tunnels are up |
| Reports may be stale after future commits | P2 | Ongoing | Regenerate reports before every release |

## Next steps

Run this exact sequence on the production server:

```bash
cd /home/zeazdev/zeaz-platform
git pull --ff-only origin main
chmod +x scripts/repo/full-repo-audit.sh scripts/platform/final-go-live-complete.sh
bash scripts/repo/full-repo-audit.sh
bash scripts/platform/final-go-live-complete.sh
```

If blocked by `apps/openwork`, inspect:

```bash
sed -n '1,260p' reports/platform/apps-source-review.md
```

Then remove/ignore nested Git metadata according to your import policy, confirm `.env.migration-release` is not tracked, and review the 34 secret-like hits.

Final release can be claimed only when:

```text
reports/platform/final-go-live-complete.md => Status: GO-LIVE GATES PASSED
```
