# Go live preflight report

Generated: 2026-06-15T12:27:24Z

Read-only gate. No deploy, no Terraform apply, no Cloudflare mutation, no token rotation, no live trading/social automation.


## git diff check

```text
```

## apps source review strict

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote reports/platform/apps-source-review.json
PASS: wrote reports/platform/apps-source-review.md
Apps scanned: 19
Critical findings: 0
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## apps port refactor generate

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## terraform cloudflare apps validate

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
[0m[1mInitializing provider plugins found in the configuration...[0m
- Reusing previous version of cloudflare/cloudflare from the dependency lock file
- Using previously-installed cloudflare/cloudflare v5.19.1

[0m[1mInitializing the backend...[0m

[0m[1mInitializing provider plugins found in the state...[0m
- Reusing previous version of cloudflare/cloudflare
- Using previously-installed cloudflare/cloudflare v5.19.1


[0m[1m[32mTerraform has been successfully initialized![0m[32m[0m
[0m[32m
You may now begin working with Terraform. Try running "terraform plan" to see
any changes that are required for your infrastructure. All Terraform commands
should now work.

If you ever set or change modules or backend configuration for Terraform,
rerun this command to reinitialize your working directory. If you forget, other
commands will detect it and remind you to do so if necessary.[0m
[32m[1mSuccess![0m The configuration is valid.
[0m
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## build all stacks safe

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
Scanning apps/*
=== api :: python-compile ===
PASS: api python-compile
=== openwork :: node-build ===
PASS: openwork node-build
=== web :: node-build ===
FAIL: web node-build rc=1
=== zAcademy :: node-build ===
PASS: zAcademy node-build
=== zAcademy :: python-compile ===
PASS: zAcademy python-compile
=== zLinebot :: node-build ===
PASS: zLinebot node-build
=== zLinebot :: python-compile ===
PASS: zLinebot python-compile
=== zcloud :: node-build ===
PASS: zcloud node-build
=== zdash :: python-compile ===
PASS: zdash python-compile
=== zdev :: node-build ===
PASS: zdev node-build
=== zlms :: node-build ===
PASS: zlms node-build
=== zlms :: python-compile ===
PASS: zlms python-compile
=== zoffice :: python-compile ===
PASS: zoffice python-compile
=== zsp-aitool :: node-build ===
FAIL: zsp-aitool node-build rc=1
=== zsticker :: python-compile ===
PASS: zsticker python-compile
=== ztrader :: python-compile ===
PASS: ztrader python-compile
=== zveo :: node-build ===
FAIL: zveo node-build rc=1
=== zveo :: python-compile ===
PASS: zveo python-compile
=== zwallet :: node-build ===
PASS: zwallet node-build
=== zwallet :: python-compile ===
PASS: zwallet python-compile

PASS: wrote reports/platform/build-all-stacks.md
Logs: reports/platform/build-logs
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## apps port origin check

```text
make[1]: Entering directory '/home/zeazdev/zeaz-platform'
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/apps-port-refactor.md
PASS: wrote /home/zeazdev/zeaz-platform/terraform/cloudflare-apps/apps.auto.tfvars.json
PASS: wrote /home/zeazdev/zeaz-platform/reports/platform/cloudflare-tunnel-ingress.generated.yml
# Apps port origin check

Generated: 2026-06-15T12:36:26Z

| App | Hostname | Origin | Port | Status | Result |
|---|---|---|---:|---|---|
| web-root | `zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | FAIL:000 |
| web-www | `www.zeaz.dev` | `http://127.0.0.1:3003` | 3003 | active | FAIL:000 |
| ssh | `ssh.zeaz.dev` | `ssh://127.0.0.1:22022` | 22022 | active | PASS |
| zdash | `zdash.zeaz.dev` | `http://127.0.0.1:5173` | 5173 | active | PASS:200 |
| zdash-api | `api-zdash.zeaz.dev` | `http://127.0.0.1:8005` | 8005 | active | PASS:404 |
| release | `release.zeaz.dev` | `http://127.0.0.1:5172` | 5172 | active | FAIL:000 |
| zveo | `zveo.zeaz.dev` | `http://127.0.0.1:3002` | 3002 | active | FAIL:000 |
| zveo-api | `api-zveo.zeaz.dev` | `http://127.0.0.1:8090` | 8090 | active | FAIL:000 |
| ztrader | `ztrader.zeaz.dev` | `http://127.0.0.1:3016` | 3016 | active | PASS:307 |
| zcino | `zcino.zeaz.dev` | `http://127.0.0.1:3000` | 3000 | active | FAIL:000 |
| zoffice | `zoffice.zeaz.dev` | `http://127.0.0.1:8091` | 8091 | refactor-from-8090 | PASS:404 |
| zcloud | `zcloud.zeaz.dev` | `http://127.0.0.1:3004` | 3004 | active | FAIL:000 |
| zsp-aitool | `ztest.zeaz.dev` | `http://127.0.0.1:3008` | 3008 | active | FAIL:000 |
| auth | `auth.zeaz.dev` | `http://127.0.0.1:9443` | 9443 | active | FAIL:000 |
ERROR: active/refactor origins are not reachable
make[1]: *** [Makefile:737: apps-port-origin-check] Error 1
make[1]: Leaving directory '/home/zeazdev/zeaz-platform'
```

## forbidden tracked files

```text
PASS: no forbidden tracked files
```

## git status

```text
 M .gitignore
M  apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts
M  apps/openwork/apps/opencode-router/test/telegram.test.js
M  apps/openwork/apps/server/src/artifact-files.e2e.test.ts
M  apps/openwork/apps/server/src/env-routes.e2e.test.ts
M  apps/openwork/apps/server/src/extensions/google-workspace.test.ts
M  apps/openwork/apps/server/src/portable-opencode.test.ts
M  apps/openwork/apps/server/src/reload-events.e2e.test.ts
M  apps/openwork/apps/server/src/session-read-model.e2e.test.ts
M  apps/openwork/apps/server/src/tokens.test.ts
M  apps/openwork/apps/server/src/workspace-activate.e2e.test.ts
M  apps/openwork/apps/server/src/workspace-export-safety.test.ts
M  apps/openwork/apps/server/src/workspace-import-preview.test.ts
M  apps/openwork/ee/apps/den-api/src/session.ts
M  apps/openwork/ee/apps/den-api/test/github-connector-app.test.ts
M  apps/openwork/ee/packages/den-db/drizzle.config.ts
M  apps/openwork/pnpm-lock.yaml
M  apps/openwork/scripts/harness/agents/code-reviewer.md
M  apps/openwork/scripts/harness/commands/kotlin-test.md
M  apps/openwork/scripts/harness/commands/rust-test.md
M  apps/web/pnpm-lock.yaml
M  apps/zLinebot/scripts/legacy_zltt/generate-enterprise-v8.sh
M  apps/zLinebot/tests/security_platform/test_pr_bot_extension.py
M  apps/zsp-aitool/docs/runbooks/PLUGIN_REPO_OPERATIONS.md
M  apps/zsp-aitool/next-env.d.ts
M  apps/zsp-aitool/prisma/seed.ts
M  apps/zsp-aitool/scripts/plugins/plugin-validate.sh
M  apps/zsp-aitool/tests/api/auth-routes.test.ts
M  apps/zsp-aitool/tsconfig.json
M  apps/zwallet/pnpm-lock.yaml
M  configs/platform/apps-routing.json
MM reports/platform/apps-port-origin-check.md
M  reports/platform/apps-port-refactor.md
M  reports/platform/apps-routing.md
MM reports/platform/apps-source-review.json
MM reports/platform/apps-source-review.md
MM reports/platform/build-all-stacks.md
D  reports/platform/build-logs/ABTPi18n-python-compile.log
D  reports/platform/build-logs/api-python-compile.log
D  reports/platform/build-logs/openwork-node-build.log
D  reports/platform/build-logs/web-node-build.log
D  reports/platform/build-logs/zAcademy-node-build.log
D  reports/platform/build-logs/zAcademy-python-compile.log
D  reports/platform/build-logs/zLinebot-node-build.log
D  reports/platform/build-logs/zcloud-node-build.log
D  reports/platform/build-logs/zdash-python-compile.log
D  reports/platform/build-logs/zdev-node-build.log
D  reports/platform/build-logs/zkbtrader-python-compile.log
D  reports/platform/build-logs/zlms-node-build.log
D  reports/platform/build-logs/zlms-prod-python-compile.log
D  reports/platform/build-logs/zlms-python-compile.log
D  reports/platform/build-logs/zoffice-python-compile.log
D  reports/platform/build-logs/zsp-aitool-node-build.log
D  reports/platform/build-logs/zsticker-python-compile.log
D  reports/platform/build-logs/ztrader-python-compile.log
D  reports/platform/build-logs/zveo-node-build.log
D  reports/platform/build-logs/zveo-python-compile.log
D  reports/platform/build-logs/zwallet-python-compile.log
M  reports/platform/cloudflare-tunnel-ingress.md
MM reports/platform/go-live-preflight.md
M  terraform/cloudflare-apps/apps.auto.tfvars.json
```
