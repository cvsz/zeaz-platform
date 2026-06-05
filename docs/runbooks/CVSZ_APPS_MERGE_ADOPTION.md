# CVSZ Apps Merge Adoption

Phase 58 creates the local adoption system for cvsz application repositories that live under `apps/*`.

`zeaz-platform` remains the operator monorepo. The adoption scripts only prepare local files for review. They never stage, commit, push, deploy, rotate tokens, mutate Cloudflare, run Terraform apply, run live trading, or trigger social/external automation.

## Scope

Internal root apps are excluded by default:

- `apps/api`
- `apps/web`

Protected app:

- `apps/zdash` is already integrated and must not be changed by the cvsz apps adoption flow.

P1 deep-dive targets:

- `apps/ABTPi18n`
- `apps/zkbtrader`

Mapped cvsz adoption candidates are defined in `configs/repos/cvsz-apps-merge-map.json`.

## Commands

Generate the P1 deep-dive report:

```bash
make critical-apps-deep-dive
```

Generate the offline adoption plan:

```bash
make cvsz-apps-merge-plan
```

Validate adoption hygiene and blocker state:

```bash
make cvsz-apps-merge-validate
```

Run the guarded local preparation step only after reviewing the plan:

```bash
APPLY=true CONFIRM_CVSZ_APPS_MERGE=yes make cvsz-apps-merge-apply
```

Run the Phase 58 wrapper:

```bash
make phase58-validate
```

Reports are written under `reports/cvsz-apps-merge/`, which is intentionally ignored by Git.

## Guarded Apply Behavior

The apply helper requires both:

```bash
APPLY=true
CONFIRM_CVSZ_APPS_MERGE=yes
```

When those guards are present, the script may:

- write `apps/<app>/IMPORT_SOURCE.md`
- back up a nested `.git` directory under `reports/cvsz-apps-merge/backups/`
- remove the nested `.git` directory
- remove broad root `.gitignore` entries that hide adopt-local app directories
- append managed local-artifact guardrails to app-local `.gitignore` files

Before any nested `.git` removal, `IMPORT_SOURCE.md` must include:

- source repository
- nested origin
- nested branch
- nested HEAD
- adoption path and timestamp

The script stops after preparing files. It does not run `git add`.

## Files That Must Not Be Committed

Do not stage or commit:

- `.env`, `.env.production`, `.env.cloudflare`, or other local env files
- Terraform/OpenTofu state, tfvars, or plan files
- `node_modules/`, `.venv/`, virtualenvs, package stores, or dependency caches
- build outputs such as `dist/`, `build/`, `.next/`, coverage, or cache folders
- token logs or secret scan outputs
- sqlite or database files
- generated reports under `reports/`, `generated/`, or `docs/reports/generated/`

Use:

```bash
git status --short --untracked-files=all
git diff --cached --name-only
git diff --check
```

before staging or committing any adoption result.

## Expected Current Blockers

On a pre-adoption checkout, validation can fail by design. Common blockers are:

- root `.gitignore` still ignores an adopt-local app directory
- an adopt-local app has no root-tracked files yet
- local env files exist and must remain ignored
- local dependency/cache directories exist and must remain ignored

Resolve blockers with the guarded apply helper, then manually review and stage only safe source files.
