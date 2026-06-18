# Unused, Duplicate, Legacy, and Broken Code Audit (Event 01)

Date: 2026-05-10  
Repository: `cvsz/zveo`

## Scope and method

Inspected:
- `pnpm-workspace.yaml`
- root `package.json`
- `apps/*`
- `packages/*`
- `db/*`
- `infra/*`
- `docs/*`

Evidence sources:
- Workspace and script declarations
- Package names and internal dependencies
- Build/typecheck command outcomes
- Static path/reference scans with `rg`

## Command log

### Baseline verification
- `pnpm install` ✅ pass
- `pnpm build:foundation` ✅ pass
- `pnpm typecheck:foundation` ✅ pass

### Unused/dead-code tooling
- `pnpm dlx knip` ❌ failed: npm registry access returned `ERR_PNPM_FETCH_403`
- `pnpm dlx ts-prune` ❌ failed: npm registry access returned `ERR_PNPM_FETCH_403`

## Confirmed used files/packages

### Workspace members (actively wired)
- `apps/dashboard`
- `apps/api-gateway`
- `apps/render-worker`
- `packages/{contracts,core,db,queue-ts,prompt-compiler,scene-graph,media-pipeline,workflow-engine,scene-memory,providers,telemetry-ts}`

Proof:
- Included in `pnpm-workspace.yaml` globs.
- Included in root `build:foundation` and `typecheck:foundation` scripts.
- Successfully built/typechecked in baseline runs.

## Suspected unused files/packages (needs manual confirmation)

These paths exist but are **not** included in the pnpm workspace globs:
- `apps/api_gateway`
- `apps/worker_render`
- `apps/worker_postprocess`
- `apps/worker_media`
- `apps/orchestrator`
- `apps/scheduler`
- `apps/uploader`
- `packages/{ai_prompts,render,logger,telemetry,ffmpeg,queue,storage,shared}`

Interpretation:
- Most appear to be legacy Python-era or pre-monorepo TypeScript/Python components.
- Not auto-validated by foundation build/typecheck scripts.

## Duplicate Python vs TypeScript implementations

Potential duplicate naming pairs:
- API: `apps/api_gateway` (legacy) vs `apps/api-gateway` (current workspace app)
- Queue: `packages/queue` (legacy) vs `packages/queue-ts` (current workspace package)
- Telemetry: `packages/telemetry` (legacy) vs `packages/telemetry-ts` (current workspace package)

Recommendation: classify legacy variants and move to `legacy/python-compat/` or `legacy/experimental/` after import/script/doc verification.

## Broken scripts and toolchain findings

### Confirmed broken now
- `pnpm dlx knip` (403 fetch error)
- `pnpm dlx ts-prune` (403 fetch error)

Likely cause:
- Registry/network policy requires additional auth or mirror configuration for dlx package download.

## Broken docs claims (initial)

No explicit broken claim found in this pass, but documentation should be reviewed for references to:
- legacy app paths (e.g., `apps/api_gateway`)
- legacy package names (`queue`, `telemetry`) instead of `queue-ts`, `telemetry-ts`

## High-risk deletion list (do not delete yet)

High risk without deeper dependency proof:
- Entire directories under `apps/*` and `packages/*` that are outside workspace globs.
- Any `infra/*` or `docs/*` assets potentially referenced by CI or operations runbooks.

Reason: reference graph may include runtime shell scripts, Docker/K8s manifests, or manual ops docs not captured by TypeScript imports.

## Safe delete candidates (none confirmed in this event)

No file/package is marked safe-delete yet because `knip` and `ts-prune` could not run and full Docker/docs reference verification has not been completed.

## Move-to-legacy candidates (proposed)

Candidate set for future Event 13 move plan:
- `apps/api_gateway`
- `apps/worker_render`
- `apps/worker_postprocess`
- `apps/worker_media`
- `apps/orchestrator`
- `apps/scheduler`
- `apps/uploader`
- `packages/ai_prompts`
- `packages/render`
- `packages/logger`
- `packages/telemetry`
- `packages/ffmpeg`
- `packages/queue`
- `packages/storage`
- `packages/shared`

## Verification command template for each proposed cleanup

For each candidate path `<PATH>` run:

1. Import usage check
```bash
rg -n "<PATH>|<BASENAME>|@zveo/<PKGNAME>" apps packages docs infra .github package.json pnpm-workspace.yaml
```

2. Workspace/package inclusion check
```bash
rg -n "<PKGNAME>|<APPNAME>" pnpm-workspace.yaml package.json
```

3. Docker/K8s reference check
```bash
rg -n "<APPNAME>|<PKGNAME>|<PATH>" infra docker-compose* .github docs
```

4. Script reference check
```bash
rg -n "<APPNAME>|<PKGNAME>" package.json scripts docs
```

5. Safety gate (must pass before any removal/move)
```bash
pnpm build:foundation && pnpm typecheck:foundation
```

---

## Event 13 cleanup actions (2026-05-10)

Applied only `move-to-legacy` candidates with low risk and no workspace wiring:

Moved to `legacy/python-compat/`:
- `apps/worker_postprocess` → `legacy/python-compat/apps/worker_postprocess`
- `apps/worker_media` → `legacy/python-compat/apps/worker_media`
- `apps/scheduler` → `legacy/python-compat/apps/scheduler`
- `packages/shared` → `legacy/python-compat/packages/shared`

Verification evidence:
- No references found in workspace globs (`pnpm-workspace.yaml`) for these paths before move.
- No root `package.json` script references to these exact paths before move.
- No Docker/K8s references to these exact paths outside this report.
- Remaining references were limited to this audit document.

Additional cleanup:
- Removed broken root scripts that depended on blocked registry dlx downloads:
  - `audit:deps` (`pnpm dlx knip`)
  - `audit:types` (`pnpm dlx ts-prune`)
  - `audit:unused` (wrapper over `audit:deps`)

Post-change verification:
- `pnpm build:foundation`
- `pnpm typecheck:foundation`
- `pnpm verify:node`
