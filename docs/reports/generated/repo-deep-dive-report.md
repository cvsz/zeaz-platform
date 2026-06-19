# zeaz-platform repository deep-dive report

Generated: 2026-06-15T12:36:51Z

## Git

```text
## main...origin/main [ahead 4]
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
M  apps/zeaz-web/pnpm-lock.yaml
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
 M docs/reports/generated/full-repo-audit-report.md
 M docs/reports/generated/repo-deep-dive-report.md
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

## Top-level layout

```text
.
./.agent
./.agent/.agents
./.agent/rules
./.agent/skills
./.agent/workflows
./.agent/zeaz-cloudflare-routing
./.agents
./.agents/agents
./.agents/skills
./.ai-factory
./.backup
./.backup/terraform-broken-20260516T094429Z
./.backup/terraform-broken-20260516T094433Z
./.backups
./.backups/apps-adopt
./.backups/makefile
./.benchmarks
./.cache
./.cache/cloudflare-docs
./.cache/cloudflare-permissions
./.cache/ecc
./.cache/free-claude-code
./.cache/supabase-ai-tools
./.claude
./.claude/.agents
./.claude/agents
./.claude/commands
./.claude/ecc.disabled-20260615-065359
./.claude/homunculus
./.claude/hooks
./.claude/mcp-configs
./.claude/rules
./.claude/scripts
./.claude/skills
./.cloudflare-backups
./.codex
./.codex/agents
./.codex/suite
./.cursor
./.cursor/.agents
./.cursor/agents
./.cursor/commands
./.cursor/hooks
./.cursor/mcp-configs
./.cursor/rules
./.cursor/scripts
./.cursor/skills
./.docs
./.docs/agents
./.docs/checklists
./.docs/prompts
./.gemini
./.github
./.github/ISSUE_TEMPLATE
./.github/workflows
./.opencode
./.opencode/node_modules
./.ops
./.ops/backups
./.pytest_cache
./.pytest_cache/v
./.ruff_cache
./.ruff_cache/0.15.17
./.runtime
./.runtime/logs
./.venv
./.venv/bin
./.venv/include
./.venv/lib
./agents
./ai
./ai/providers
./apps
./apps/.codex
./apps/zeaz-api
./apps/openwork
./apps/zeaz-web
./apps/zAcademy
./apps/zLinebot
./apps/zai-factory
./apps/zcfdash
./apps/zcino
./apps/zcloud
./apps/zdash
./apps/zdev
./apps/zlms
./apps/zoffice
./apps/zquest
./apps/zsp-aitool
./apps/zsticker
./apps/ztrader
./apps/zveo
./apps/zwallet
./backups
./backups/snapshots
./bootstrap
./compose
./configs
./configs/cloudflare
./configs/platform
./configs/repos
./controllers
./dns
./docs
./docs/ai
./docs/ai-cloudflare-routing
./docs/architecture
./docs/audit
./docs/business
./docs/cloudflare
./docs/codex
./docs/infra
./docs/integrations
./docs/plans
./docs/prompts
./docs/releases
./docs/reports
./docs/runbooks
./docs/security
./docs/zdash
./generated
./generated/cloudflare
./infra
./infra/ai-runtime
./infra/authentik
./infra/backend
./infra/cloudflare
./infra/environments
./infra/eventbus
./infra/modules
./infra/observability
./infra/security
./infra/shre
./infra/traefik
./infrastructure
./infrastructure/nginx
./installer
./installer/compose
./installer/scripts
./kubernetes
./kubernetes/secrets
./legacy
./legacy/github-workflows
./make
./monitoring
./monitoring/alertmanager
./monitoring/grafana
./monitoring/loki
./monitoring/otel
./monitoring/prometheus
./ops
./ops/bin
./ops/scripts
./policies
./python
./python/__pycache__
./reports
./reports/cvsz-apps-merge
./reports/mcp
./reports/merge
./reports/openwork-audit
./reports/platform
./reports/startup-clean
./reports/verify
./runtime
./runtime/__pycache__
./runtime/app-servers
./runtime/authentik
./runtime/governance
./runtime/llm
./runtime/mcp
./runtime/platform_memory
./runtime/scheduler
./runtime/streaming
./runtime/swarm
./runtime/telemetry
./runtime/trading
./runtime/zquest
./scripts
./scripts/__pycache__
./scripts/ai
./scripts/apps
./scripts/backup
./scripts/ci
./scripts/cloudflare
./scripts/db
./scripts/docker
./scripts/env
./scripts/environments
./scripts/fixers
./scripts/lib
./scripts/maintenance
./scripts/make
./scripts/mcp
./scripts/platform
./scripts/ports
./scripts/proxy
./scripts/release
./scripts/repo
```

## Makefile audit

```text
Makefile audit
- file: Makefile
- targets: 185
- duplicate targets: 0
- issues: 0
- warnings: 0
PASS: Makefile audit clean
```

## Make targets

```text
36:.PHONY: help bootstrap cloudflare-stability-check setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars
37:.PHONY: refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context supabase-ai-tools supabase-docs-context supabase-mcp-check
38:.PHONY: supabase-mcp-config upgrade-report validate validate-agent codex-suite-validate ci ci-validate validate-env validate-env-strict
39:.PHONY: env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint
40:.PHONY: shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan secret-scan-history
41:.PHONY: tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan
42:.PHONY: tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan
43:.PHONY: tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-clean-delete token-clean-all
44:.PHONY: token-clean-all-delete token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan agent-scan sbom
45:.PHONY: cosign-sign doctor clean zdash-origin-check zdash-tunnel-config zdash-edge-readiness zdash-go-live-evidence zdash-public-release-evidence
46:.PHONY: phase50-validate zdash-install zdash-validate-fast zdash-backend-test zdash-frontend-test zdash-build zdash-server-start zdash-server-stop
47:.PHONY: zdash-server-restart zdash-server-status zdash-validate zdash-release-evidence zdash-phase48-validate zdash-cloudflare-handoff phase51-validate zeaz-dev-plan
48:.PHONY: zeaz-dev-apply zeaz-dev-rollback-plan zeaz-dev-verify-live zeaz-dev-public-evidence phase52-validate workflow-policy workflow-validate gitops-validate
49:.PHONY: git-status gpg-commit gpg-push gpg-finalize git-finalize zaiz-validate zaiz-prod zaiz-fix-google-genai
50:.PHONY: zaiz-deps-check
51:.PHONY: zquest-start zquest-stop zquest-status zquest-restart zquest-smoke
53:help:
56:bootstrap:
59:setup: setup-free
61:setup-free:
64:setup-legacy:
67:generate-env-all:
70:refactor-cloudflare-vars-dry:
73:refactor-cloudflare-vars:
76:check-no-cf-vars:
79:docs-context:
82:supabase-docs-context:
85:supabase-mcp-check:
88:supabase-mcp-config:
91:supabase-ai-tools: supabase-docs-context supabase-mcp-check
94:upgrade-report:
97:env: load-env
99:load-env:
102:ci: validate
104:validate-agent: ci-validate codex-suite-validate
106:codex-suite-validate:
109:ci-validate: test env-format-validate yaml-validate gitlink-validate check-no-cf-vars tf-fmt-check
112:validate: test validate-env env-format-validate yaml-validate gitlink-validate check-no-cf-vars tf-fmt-check
115:validate-env:
118:validate-env-strict:
121:env-format-validate:
124:env-format-validate-local:
127:env-normalize-local:
131:maintenance:
134:test:
137:fmt: tf-fmt
139:fmt-check: tf-fmt-check
141:lint:
144:shellcheck:
147:yaml-validate:
150:gitlink-validate:
152:tf-init:
155:tf-fmt:
158:tf-fmt-check:
161:tf-validate: tf-init
164:tf-plan: tf-init
167:tf-plan-out: tf-init
171:tf-apply tf-apply-plan tf-destroy tf-state-rm-waf:
174:tf-env-init:
178:tf-env-validate: tf-env-init
181:tf-env-plan: tf-env-init
184:tofu-init:
187:tofu-validate: tofu-init
190:tofu-plan: tofu-init
193:drift: drift-detect
195:drift-detect: tf-init
198:token-clean:
201:token-clean-delete:
205:token-clean-all:
208:token-clean-all-delete:
212:token-verify:
215:token-verify-strict:
218:token-rotate-dry:
221:token-rotate:
226:token-rotate-refresh: token-rotate-dry
228:secret-scan:
231:secret-scan-history:
234:security-scan:
237:agent-scan:
240:sbom:
243:cosign-sign:
246:policy-test: workflow-policy
249:sbom-generation: sbom
250:sbom-validate: sbom
251:security-validate: security-scan
252:waf-validate: waf-validation
254:waf-validation:
257:tunnel-validation:
260:workflow-policy:
263:workflow-validate: workflow-policy
266:gitops-validate: workflow-validate drift-detect
269:git-status:
272:gpg-commit:
279:gpg-push:
282:gpg-pull:
285:gpg-finalize: validate
291:git-finalize: gpg-finalize
293:zaiz-validate: validate
295:zaiz-prod:
298:zaiz-fix-google-genai:
301:zaiz-deps-check:
308:doctor:
314:clean:
322:.PHONY: zdash-origin-check
323:zdash-origin-check: ## Verify zDash origin configuration
326:.PHONY: zdash-tunnel-config
327:zdash-tunnel-config: ## Verify zDash tunnel configuration
330:.PHONY: zdash-edge-readiness
331:zdash-edge-readiness: ## Verify zDash edge readiness
334:.PHONY: zdash-go-live-evidence
335:zdash-go-live-evidence: ## Collect zDash go-live evidence
338:.PHONY: zdash-public-release-evidence
339:zdash-public-release-evidence: ## Collect zDash public release evidence
342:.PHONY: phase50-validate
343:phase50-validate: ## Validate Phase 50 zDash integration
350:.PHONY: zdash-install
351:zdash-install: ## Install zDash dependencies (apps/zdash)
355:.PHONY: zdash-validate-fast
356:zdash-validate-fast: ## Run zDash validate-fast with dependency bootstrap
359:.PHONY: zdash-backend-test
360:zdash-backend-test: ## Run zDash backend tests (apps/zdash)
364:.PHONY: zdash-frontend-test
365:zdash-frontend-test: ## Run zDash frontend tests (apps/zdash)
369:.PHONY: zdash-build
370:zdash-build: ## Build zDash frontend production bundle (apps/zdash)
374:.PHONY: zdash-server-start
375:zdash-server-start: ## Start zDash backend + frontend servers (apps/zdash)
379:.PHONY: zdash-server-stop
380:zdash-server-stop: ## Stop zDash servers (apps/zdash)
384:.PHONY: zdash-server-restart
385:zdash-server-restart: ## Restart zDash servers (apps/zdash)
389:.PHONY: zdash-server-status
390:zdash-server-status: ## Show zDash server status (apps/zdash)
394:.PHONY: zdash-validate
395:zdash-validate: ## Run full zDash validation (apps/zdash)
399:.PHONY: zdash-release-evidence
400:zdash-release-evidence: ## Collect zDash release evidence (apps/zdash)
404:.PHONY: zdash-phase48-validate
405:zdash-phase48-validate: ## Run zDash Phase 48 validation (apps/zdash)
409:.PHONY: zdash-cloudflare-handoff
410:zdash-cloudflare-handoff: ## Run zDash Cloudflare handoff checks
419:.PHONY: phase51-validate
420:phase51-validate: ## Validate Phase 51 zDash monorepo import
481:.PHONY: zeaz-dev-plan
482:zeaz-dev-plan: ## Print the zeaz.dev production route plan
485:.PHONY: zeaz-dev-apply
486:zeaz-dev-apply: ## Run controlled zeaz.dev apply checks
490:.PHONY: zeaz-dev-rollback-plan
491:zeaz-dev-rollback-plan: ## Generate zeaz.dev rollback plan
494:.PHONY: zeaz-dev-verify-live
495:zeaz-dev-verify-live: ## Verify live zeaz.dev public URLs
498:.PHONY: zeaz-dev-public-evidence
499:zeaz-dev-public-evidence: ## Generate zeaz.dev public release evidence
502:.PHONY: phase52-validate
503:phase52-validate: ## Validate Phase 52 zeaz.dev production routing update
536:cloudflare-stability-check: ## Run full Cloudflare stability checks
548:.PHONY: authentik-env authentik-install authentik-pull authentik-up authentik-start authentik-down authentik-stop authentik-restart authentik-status authentik-logs authentik-update authentik-open
550:authentik-env:
565:authentik-install: authentik-env
571:authentik-pull:
574:authentik-up authentik-start:
578:authentik-down authentik-stop:
581:authentik-restart:
584:authentik-status:
587:authentik-logs:
590:authentik-update: authentik-env
595:authentik-open:
602:.PHONY: zdash-terraform-integrate
603:zdash-terraform-integrate: ## Generate zDash Terraform source files
606:.PHONY: cf-zdash-preflight
607:cf-zdash-preflight: ## Resolve Cloudflare zone/tunnel/DNS IDs for zDash
610:.PHONY: cf-zdash-import-existing
611:cf-zdash-import-existing: ## Import existing zDash DNS records into Terraform state
614:.PHONY: tf-zdash-init
615:tf-zdash-init: ## Init zDash Cloudflare Terraform
618:.PHONY: tf-zdash-fmt
619:tf-zdash-fmt: ## Format zDash Cloudflare Terraform
622:.PHONY: tf-zdash-fmt-check
623:tf-zdash-fmt-check: ## Check zDash Cloudflare Terraform formatting
626:.PHONY: tf-zdash-validate
627:tf-zdash-validate: tf-zdash-init ## Validate zDash Cloudflare Terraform
630:.PHONY: tf-zdash-plan
631:tf-zdash-plan: tf-zdash-init ## Plan zDash Cloudflare Terraform
634:.PHONY: tf-zdash-plan-out
635:tf-zdash-plan-out: tf-zdash-init ## Save zDash Cloudflare Terraform plan
639:.PHONY: tf-zdash-apply
640:tf-zdash-apply: ## Guarded zDash Terraform apply
648:.PHONY: cf-zdash-token-diagnose
649:cf-zdash-token-diagnose: ## Diagnose Cloudflare token permissions for zDash
652:.PHONY: cf-zdash-sync-env
653:cf-zdash-sync-env: ## Sync zDash Terraform env vars from Cloudflare API into .env/.env.cloudflare
660:.PHONY: repo-deep-dive makefile-audit makefile-refactor
661:repo-deep-dive: ## Generate full repository deep-dive report
664:makefile-audit: ## Audit root Makefile for duplicate targets and risky patterns
667:makefile-refactor: ## Re-run safe root Makefile cleanup
675:.PHONY: apps-deep-dive apps-inventory
676:apps-deep-dive: ## Deep-dive local apps under apps/*
679:apps-inventory: apps-deep-dive ## Alias for local apps inventory
681:.PHONY: apps-inventory-validate
682:apps-inventory-validate: apps-deep-dive ## Validate generated apps inventory
689:.PHONY: critical-apps-deep-dive cvsz-apps-merge-plan cvsz-apps-merge-apply cvsz-apps-merge-validate phase58-validate
690:critical-apps-deep-dive: ## Deep-dive apps/ABTPi18n and apps/zkbtrader
693:cvsz-apps-merge-plan: ## Plan adoption of apps/* from cvsz/*
696:cvsz-apps-merge-apply: ## Adopt local apps/* into zeaz-platform; guarded
700:cvsz-apps-merge-validate: ## Validate apps/* merge/adoption hygiene
703:phase58-validate: ## Validate Phase 58 app merge system
712:.PHONY: apps-routing-generate apps-routing-report tf-cloudflare-apps-init tf-cloudflare-apps-fmt tf-cloudflare-apps-validate tf-cloudflare-apps-plan phase59-validate
713:apps-routing-generate: ## Generate apps routing report and Terraform app route vars
716:apps-routing-report: apps-routing-generate ## Print apps routing report
719:phase59-validate: apps-routing-generate tf-cloudflare-apps-fmt tf-cloudflare-apps-validate
726:.PHONY: apps-stack-deep-dive apps-port-refactor-generate apps-port-refactor-report apps-port-origin-check tf-cloudflare-apps-init tf-cloudflare-apps-fmt tf-cloudflare-apps-validate tf-cloudflare-apps-plan tf-cloudflare-apps-apply apply-port-plan add-route phase60-validate
727:apps-stack-deep-dive: ## Deep-dive all stacks under apps/*
730:apps-port-refactor-generate: ## Generate canonical app port/Terraform/tunnel assets
733:apps-port-refactor-report: apps-stack-deep-dive apps-port-refactor-generate ## Print app stack and port plan
736:apps-port-origin-check: apps-port-refactor-generate ## Check active local origins
739:add-route: ## Register new domain/subdomain (Usage: make add-route HOSTNAME=test.zeaz.dev PORT=3005 APP_ID=test [ROLE=ui] or run interactive: make add-route)
746:tf-cloudflare-apps-init: ## Init Cloudflare apps Terraform
749:tf-cloudflare-apps-fmt: ## Format Cloudflare apps Terraform
752:tf-cloudflare-apps-validate: apps-port-refactor-generate tf-cloudflare-apps-init ## Validate Cloudflare apps Terraform
755:tf-cloudflare-apps-plan: apps-port-refactor-generate tf-cloudflare-apps-init ## Plan Cloudflare apps Terraform
759:tf-cloudflare-apps-apply: apps-port-refactor-generate tf-cloudflare-apps-init ## Apply Cloudflare apps Terraform
765:apply-port-plan: tf-cloudflare-apps-apply ## Generate port refactor assets and apply to Cloudflare
767:phase60-validate: apps-stack-deep-dive apps-port-refactor-generate tf-cloudflare-apps-fmt tf-cloudflare-apps-validate
774:.PHONY: build-all-stacks build-all-stacks-full go-live-preflight go-live-report
775:build-all-stacks: ## Build/check all apps/* stacks without install or docker build
778:build-all-stacks-full: ## Build/check all apps/* stacks with installs and docker build
781:go-live-preflight: ## Run go-live readiness checks without deploy/apply
784:go-live-report: build-all-stacks go-live-preflight ## Generate full go-live reports
794:.PHONY: apps-source-review apps-source-review-strict apps-source-review-report
795:apps-source-review: ## Review source-owned files under apps/* before build/go-live
798:apps-source-review-strict: ## Review apps/* and fail on critical findings
801:apps-source-review-report: apps-source-review ## Print apps source review report
808:.PHONY: app-%
820:.PHONY: all-apps-install
821:all-apps-install: ## Run install across all apps
829:.PHONY: all-apps-build
830:all-apps-build: ## Run build across all apps
838:zquest-start: ## Start the zQuest frontend plus backend-backed database server
841:zquest-stop: ## Stop the zQuest frontend plus backend-backed database server
844:zquest-status: ## Show zQuest server status
847:zquest-restart: zquest-stop zquest-start ## Restart zQuest server
849:zquest-smoke: ## Run zQuest smoke tests against the local server
856:install:
859:omega-validate:
862:package:
865:harness-audit:
```

## zDash integration

```text
apps/zdash: present
apps/zdash/docker-compose.prod.yml: present
apps/zdash/Makefile: present
```

## Cloudflare/Terraform files

```text
configs/cloudflare/access/zeaz-dev-zdash-access-policy.example.json
configs/cloudflare/access/zeaz-dev-zdash-access-policy.json
configs/cloudflare/zdash/zdash-access-policy.example.json
configs/cloudflare/zdash/zdash-dns-intent.example.json
configs/cloudflare/zdash/zdash.edge.routes.example.json
configs/cloudflare/zdash/zdash.production.routes.example.json
configs/cloudflare/zdash/zdash.production.routes.json
configs/cloudflare/zeaz-dev/zeaz-dev-route-intent.example.json
configs/cloudflare/zeaz-dev/zeaz-dev-route-intent.json
generated/cloudflare/zdash-production-tunnel-ingress.yml
generated/cloudflare/zdash-tunnel-ingress.yml
scripts/cloudflare/apply-account-token-endpoint-patch.sh
scripts/cloudflare/apply-zero-global-key-patch.sh
scripts/cloudflare/check-cloudflare-config.sh
scripts/cloudflare/clean-and-regenerate-tokens.sh
scripts/cloudflare/clean-env-empty-values.sh
scripts/cloudflare/cloudflare-api-lib.sh
scripts/cloudflare/cloudflare-stability-check.sh
scripts/cloudflare/discover-permission-groups.sh
scripts/cloudflare/export-tf-vars.sh
scripts/cloudflare/fetch-cloudflare-llms-context.sh
scripts/cloudflare/gen-token.sh
scripts/cloudflare/generate-tokens.sh
scripts/cloudflare/install-zeaz-loading-local.sh
scripts/cloudflare/install-zero-key-system.sh
scripts/cloudflare/lib/env-scope.sh
scripts/cloudflare/list-permission-groups.sh
scripts/cloudflare/load-env.sh
scripts/cloudflare/master-gen-tokens.sh
scripts/cloudflare/permissions.sh
scripts/cloudflare/repair-cloudflared-service.sh
scripts/cloudflare/rotate-tokens-with-permission-preflight.sh
scripts/cloudflare/rotate-tokens.sh
scripts/cloudflare/run-token-rotation.sh
scripts/cloudflare/select-zone.sh
scripts/cloudflare/setup-cloudflare-tunnel.sh
scripts/cloudflare/sync-cloudflare-env-files.sh
scripts/cloudflare/sync-tunnel-token.sh
scripts/cloudflare/sync-zdash-terraform-env-from-api.sh
scripts/cloudflare/validate-tokens.sh
scripts/cloudflare/verify-token-env.sh
scripts/cloudflare/write-env.sh
scripts/cloudflare/zdash-cloudflare-preflight.sh
scripts/cloudflare/zdash-cloudflare-token-diagnose.sh
scripts/cloudflare/zdash-terraform-env-guard.sh
scripts/cloudflare/zdash-terraform-import-existing.sh
scripts/cloudflare/zdash-terraform-integrate.sh
scripts/cloudflare/zeaz-dev-apply.sh
scripts/cloudflare/zeaz-dev-plan.sh
scripts/cloudflare/zeaz-dev-rollback-plan.sh
scripts/cloudflare/zeaz-dev-verify-live.sh
terraform/.terraform.lock.hcl
terraform/.terraform/modules/modules.json
terraform/backend.local.tf.example
terraform/backend.r2.tf.example
terraform/backend.s3.tf.example
terraform/cloudflare-apps/.terraform.lock.hcl
terraform/cloudflare-apps/README.md
terraform/cloudflare-apps/apps.auto.tfvars.json
terraform/cloudflare-apps/main.tf
terraform/cloudflare-apps/outputs.tf
terraform/cloudflare-apps/providers.tf
terraform/cloudflare-apps/terraform.tfstate
terraform/cloudflare-apps/terraform.tfstate.backup
terraform/cloudflare-apps/variables.tf
terraform/cloudflare-apps/versions.tf
terraform/environments/dev/main.tf
terraform/environments/dev/outputs.tf
terraform/environments/dev/providers.tf
terraform/environments/dev/variables.tf
terraform/environments/dev/versions.tf
terraform/environments/prod/main.tf
terraform/environments/prod/outputs.tf
terraform/environments/prod/providers.tf
terraform/environments/prod/variables.tf
terraform/environments/prod/versions.tf
terraform/environments/staging/main.tf
terraform/environments/staging/outputs.tf
terraform/environments/staging/providers.tf
terraform/environments/staging/variables.tf
terraform/environments/staging/versions.tf
terraform/main.tf
terraform/main.tf.bak.20260610-021103
terraform/main.tf.bak.20260610-021131
terraform/providers.tf
terraform/terraform.tfstate
terraform/tfplan.drift
terraform/traefik/dynamic.yml.tpl
terraform/traefik/main.tf
terraform/traefik/outputs.tf
terraform/traefik/providers.tf
terraform/traefik/variables.tf
terraform/traefik/versions.tf
terraform/variables.tf
terraform/versions.tf
terraform/zeaz.tfplan
```

## Stale references

```text
.agents/skills/zai-build-automation/references/BEST-PRACTICES.md:520:serve       → symfony server:start (or php -S localhost:8000 -t public/)
.agents/skills/zai-build-automation/templates/justfile-php:42:    {{ php }} -S localhost:8000 -t public/
.agents/skills/zai-build-automation/templates/makefile-php.mk:44:	$(PHP) -S localhost:8000 -t public/
.agents/skills/zai-build-automation/templates/taskfile-php.yml:45:      - '{{.PHP}} -S localhost:8000 -t public/'
apps/zeaz-api/docker-compose.yml:16:      test: ["CMD", "python3", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/runtime/services')"]
apps/openwork/zeaz/installer/mcp-fix-phase2.sh:113:	Try: http://localhost:8000/sse
apps/zeaz-web/src/app/dashboard/swarm-runtime/page.tsx:13:      const res = await fetch('http://localhost:8000/api/runtime/swarm/agents');
apps/zeaz-web/src/app/dashboard/swarm-runtime/page.tsx:18:    const ws = new WebSocket('ws://localhost:8000/api/runtime/swarm/ws/swarm');
apps/zeaz-web/src/lib/api.ts:11:  return "http://localhost:8000";
apps/zdash/.codex/cloud/AGENTS.template.md:25:- Never introduce `localhost:8000`.
apps/zdash/.codex/cloud/general-custom-instructions.md:31:- never introduce localhost:8000 in repo changes
apps/zdash/.codex/cloud/maintenance.sh:100:  tracked_source_grep "localhost:8000|BACKEND_PORT=8000"
apps/zdash/.codex/cloud/maintenance.sh:107:if tracked_source_grep "localhost:8000|BACKEND_PORT=8000" >/tmp/zdash-codex-port8000.txt && [ -s /tmp/zdash-codex-port8000.txt ]; then
apps/zdash/.codex/cloud/phase-runner.md:27:- never introduce localhost:8000
apps/zdash/.codex/cloud/phase-runner.md:58:- never use localhost:8000
apps/zdash/.codex/cloud/phase-runner.md:126:Never use `localhost:8000`; backend port is `8005`.
apps/zdash/.codex/cloud/setup.sh:110:if grep -RIn "localhost:8000\|BACKEND_PORT=8000" \
apps/zdash/Makefile:117:	@tmp=$$(mktemp); git grep -nE 'localhost:8000|BACKEND_PORT=8000' -- . ':(exclude)Makefile' ':(exclude)docs/**' ':(exclude)**/*.md' > $$tmp 2>/dev/null || true; if [ -s $$tmp ]; then cat $$tmp; rm -f $$tmp; exit 1; else rm -f $$tmp; echo "PASSED: no old backend port 8000 found"; fi
apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md:11:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` in tracked runtime/source files.
apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md:116:- runtime/source references to `localhost:8000` or `BACKEND_PORT=8000`
apps/zdash/docs/prompts/phase02-exec.prompt:550:curl http://localhost:8000/api/trading/status
apps/zdash/docs/prompts/phase02-exec.prompt:554:curl -X POST http://localhost:8000/api/trading/scan \
apps/zdash/docs/prompts/phase03-exec.prompt:622:curl -X POST http://localhost:8000/api/risk/check \
apps/zdash/docs/prompts/phase03-exec.prompt:636:curl -X POST http://localhost:8000/api/risk/halt \
apps/zdash/docs/prompts/phase03-exec.prompt:642:curl -X POST http://localhost:8000/api/risk/resume \
apps/zdash/docs/prompts/phase04-exec.prompt:818:curl http://localhost:8000/api/scheduler/status
apps/zdash/docs/prompts/phase04-exec.prompt:822:curl http://localhost:8000/api/scheduler/jobs
apps/zdash/docs/prompts/phase04-exec.prompt:826:curl -X POST http://localhost:8000/api/scheduler/jobs \
apps/zdash/docs/prompts/phase04-exec.prompt:842:curl -X POST http://localhost:8000/api/scheduler/jobs/JOB_ID/run
apps/zdash/docs/prompts/phase04-exec.prompt:846:curl http://localhost:8000/api/iot/status
apps/zdash/docs/prompts/phase04-exec.prompt:850:curl -X POST http://localhost:8000/api/iot/power-cycle \
apps/zdash/docs/prompts/phase05-exec.prompt:1035:curl http://localhost:8000/api/backtesting/strategies
apps/zdash/docs/prompts/phase05-exec.prompt:1039:curl -X POST http://localhost:8000/api/backtesting/run \
apps/zdash/docs/prompts/phase05-exec.prompt:1053:curl -X POST http://localhost:8000/api/backtesting/optimize \
apps/zdash/docs/prompts/phase05-exec.prompt:1073:curl -X POST http://localhost:8000/api/backtesting/results/RESULT_ID/promotion-check
apps/zdash/docs/prompts/phase05-exec.prompt:1077:curl http://localhost:8000/api/backtesting/results/RESULT_ID/report
apps/zdash/docs/prompts/phase06-exec.prompt:1144:curl -X POST http://localhost:8000/api/content/create \
apps/zdash/docs/prompts/phase06-exec.prompt:1160:curl -X POST http://localhost:8000/api/content/generate-graphic \
apps/zdash/docs/prompts/phase06-exec.prompt:1171:curl -X POST http://localhost:8000/api/content/approve \
apps/zdash/docs/prompts/phase06-exec.prompt:1181:curl -X POST http://localhost:8000/api/content/post \
apps/zdash/docs/prompts/phase06-exec.prompt:1191:curl -X POST http://localhost:8000/api/content/pipeline/run \
apps/zdash/docs/prompts/phase07-exec.prompt:268:VITE_API_BASE_URL=http://localhost:8000
apps/zdash/docs/prompts/phase08-exec.prompt:268:VITE_API_BASE_URL=http://localhost:8000
apps/zdash/docs/prompts/phase08-exec.prompt:870:curl -X POST http://localhost:8000/api/auth/bootstrap-admin
apps/zdash/docs/prompts/phase08-exec.prompt:874:curl -X POST http://localhost:8000/api/auth/login \
apps/zdash/docs/prompts/phase08-exec.prompt:883:curl http://localhost:8000/api/admin/safety-check \
apps/zdash/docs/prompts/phase10-exec.prompt:1499:curl http://localhost:8000/api/billing/plans \
apps/zdash/docs/prompts/phase10-exec.prompt:1504:curl http://localhost:8000/api/billing/status \
apps/zdash/docs/prompts/phase10-exec.prompt:1509:curl http://localhost:8000/api/billing/usage \
apps/zdash/docs/prompts/phase10-exec.prompt:1514:curl -X POST http://localhost:8000/api/billing/mock/apply-plan \
apps/zdash/docs/prompts/phase10-exec.prompt:1521:curl http://localhost:8000/api/marketplace/plugins \
apps/zdash/docs/prompts/phase10-exec.prompt:1526:curl http://localhost:8000/api/enterprise/status \
apps/zdash/docs/prompts/phase11-exec.prompt:1744:curl http://localhost:8000/api/aiops/models \
apps/zdash/docs/prompts/phase11-exec.prompt:1749:curl http://localhost:8000/api/aiops/prompts \
apps/zdash/docs/prompts/phase11-exec.prompt:1754:curl -X POST http://localhost:8000/api/governance/dlp/scan-text \
apps/zdash/docs/prompts/phase11-exec.prompt:1761:curl http://localhost:8000/api/governance/approvals \
apps/zdash/docs/prompts/phase11-exec.prompt:1766:curl -X POST http://localhost:8000/api/compliance/reports/generate \
apps/zdash/docs/prompts/phase12-exec.prompt:1848:curl -X POST http://localhost:8000/api/ops/evaluate \
apps/zdash/docs/prompts/phase12-exec.prompt:1853:curl http://localhost:8000/api/ops/incidents \
apps/zdash/docs/prompts/phase12-exec.prompt:1858:curl -X POST http://localhost:8000/api/managed/support/cases \
apps/zdash/docs/prompts/phase12-exec.prompt:1869:curl -X POST http://localhost:8000/api/integrations/siem/export \
apps/zdash/docs/prompts/phase12-exec.prompt:1876:curl -X POST http://localhost:8000/api/ops/dr/backup-validation \
apps/zdash/docs/prompts/phase13-exec.prompt:469:EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
apps/zdash/docs/prompts/phase13-exec.prompt:1610:curl -X POST http://localhost:8000/api/developer/api-keys \
apps/zdash/docs/prompts/phase13-exec.prompt:1621:curl http://localhost:8000/partner/v1/health \
apps/zdash/docs/prompts/phase13-exec.prompt:1626:curl http://localhost:8000/partner/v1/risk/status \
apps/zdash/docs/prompts/phase14-exec.prompt:453:VITE_API_BASE_URL=http://localhost:8000
apps/zdash/docs/prompts/phase23-exec.prompt:929:curl http://localhost:8000/api/governance/status \
apps/zdash/docs/prompts/phase23-exec.prompt:934:curl -X POST http://localhost:8000/api/governance/simulate \
apps/zdash/docs/prompts/phase23-exec.prompt:951:curl -X POST http://localhost:8000/api/compliance/collect-evidence \
apps/zdash/docs/prompts/phase23-exec.prompt:956:curl -X POST http://localhost:8000/api/disaster-recovery/restore-drill \
apps/zdash/docs/prompts/phase23-exec.prompt:966:curl -X POST http://localhost:8000/api/incidents/runbooks/execute \
apps/zdash/docs/prompts/phase35-exec-master-meta-final-release.prompt:123:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` outside archived/local-only prompt artifacts.
apps/zdash/docs/prompts/phase35.1-backend-release-hardening.prompt:25:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000`.
apps/zdash/docs/prompts/phase35.4-docs-runbooks-api-examples.prompt:19:- Do not introduce `localhost:8000` or `BACKEND_PORT=8000`.
apps/zdash/docs/prompts/phase35.5-makefile-ci-maintenance-validation.prompt:18:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` in tracked runtime/source files.
apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:155:  - /opt/zdash/runtime/scripts/zdash-health.sh
apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:156:  - /opt/zdash/runtime/scripts/zdash-logs.sh
apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:157:  - /opt/zdash/runtime/scripts/zdash-backup.sh
apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:158:  - /opt/zdash/runtime/scripts/zdash-update.sh
apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:436:- production wrapper scripts fail safely if /opt/zdash/runtime is absent.
apps/zdash/docs/prompts/phase39-exec-production-deployment-dryrun-bservability-verification.prompt:41:- If /opt/zdash/runtime is missing, fail clearly with:
apps/zdash/docs/prompts/phase40-exec-production-install-rehearsal-go-live-evidence-capture.prompt:41:- If /opt/zdash/runtime is absent, fail safely and tell user to run:
apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:53:.codex/cloud/maintenance.sh:100:  tracked_source_grep "localhost:8000|BACKEND_PORT=8000"
apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:54:.codex/cloud/maintenance.sh:107:if tracked_source_grep "localhost:8000|BACKEND_PORT=8000" >/tmp/zdash-codex-port8000.txt && [ -s /tmp/zdash-codex-port8000.txt ]; then
apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:77:.codex/cloud/setup.sh:110:if grep -RIn "localhost:8000\|BACKEND_PORT=8000" \
apps/zdash/docs/runbooks/GO_LIVE_REHEARSAL.md:17:- Production runtime installed at `/opt/zdash/runtime`.
apps/zdash/docs/runbooks/INSTALLATION.md:56:sudo nano /opt/zdash/runtime/.env.production
apps/zdash/docs/runbooks/PHASE36_SERVER_COMMAND_CENTER.md:51:| Runtime | `.runtime/` (gitignored) | `/opt/zdash/` (systemd) |
apps/zdash/docs/runbooks/PHASE36_SERVER_COMMAND_CENTER.md:64:- **Production scripts fail safely** — clear error if `/opt/zdash/runtime` is absent
apps/zdash/docs/runbooks/PRODUCTION_DRY_RUN_VERIFICATION.md:26:Checks that the production runtime directory exists at `/opt/zdash/runtime` and contains all required components.
apps/zdash/docs/runbooks/PRODUCTION_DRY_RUN_VERIFICATION.md:44:Production runtime not found at /opt/zdash/runtime
apps/zdash/docs/runbooks/START_SERVER.md:57:Production runs via systemd + Docker Compose under `/opt/zdash/`.
apps/zdash/install-zdash-prod.sh:21:INSTALL_ROOT="${INSTALL_ROOT:-/opt/zdash}"
apps/zdash/install-zdash-prod.sh:158:  # When executed from elsewhere, clone/update /opt/zdash/app.
apps/zdash/scripts/prod/capture-go-live-evidence.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/run-go-live-rehearsal.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/verify-go-live-safety-locks.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/verify-prod-health.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/verify-prod-observability.sh:13:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/verify-prod-rollback-readiness.sh:13:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/prod/verify-prod-runtime.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
apps/zdash/scripts/server/logs-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
apps/zdash/scripts/server/logs-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
apps/zdash/scripts/server/logs-prod.sh:12:if [[ -f "/opt/zdash/runtime/scripts/zdash-logs.sh" ]]; then
apps/zdash/scripts/server/logs-prod.sh:13:  exec bash "/opt/zdash/runtime/scripts/zdash-logs.sh" "$SERVICE"
apps/zdash/scripts/server/logs-prod.sh:15:  echo "Production log helper not found at /opt/zdash/runtime/scripts/zdash-logs.sh"
apps/zdash/scripts/server/start-prod.sh:4:RUNTIME_DIR="/opt/zdash/runtime"
apps/zdash/scripts/server/status-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
apps/zdash/scripts/server/status-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
apps/zdash/scripts/server/status-prod.sh:16:COMPOSE_DIR="/opt/zdash"
apps/zdash/scripts/server/status-prod.sh:23:if [[ -f "/opt/zdash/runtime/scripts/zdash-health.sh" ]]; then
apps/zdash/scripts/server/status-prod.sh:25:  bash "/opt/zdash/runtime/scripts/zdash-health.sh" || true
apps/zdash/scripts/server/stop-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
apps/zdash/scripts/server/stop-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
apps/zlms/app/assets/global/plugins/bootstrap-pwstrength/README.md:175:And go to [localhost:8000](http://localhost:8000).
apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md:175:And go to [localhost:8000](http://localhost:8000).
apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md:175:And go to [localhost:8000](http://localhost:8000).
apps/zsticker/Dockerfile:29:  CMD curl -f http://localhost:8000/health || exit 1
apps/ztrader/backend/src/ztrader/abt/api/tradingview_endpoints.py:339:    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
apps/ztrader/backend/src/ztrader/api/v1/webhooks.py:86:        "webhook_url": "http://localhost:8000/api/v1/tradingview/webhook",
apps/ztrader/frontend/.env.example:5:# Backend API URL (default: http://localhost:8000)
apps/ztrader/frontend/.env.example:6:NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
apps/ztrader/frontend/src/app/[lng]/admin/page.tsx:71:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/app/[lng]/dashboard/page.tsx:147:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/app/[lng]/settings/page.tsx:47:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/components/auth/GoogleSignIn.tsx:19:        process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/components/settings/NotificationPreferences.tsx:34:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/components/settings/PromptPayTopup.tsx:67:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/components/settings/TelegramLink.tsx:31:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/frontend/src/components/settings/TradingViewConfig.tsx:22:    'http://localhost:8000/api/v1/tradingview/webhook',
apps/ztrader/frontend/src/components/settings/TradingViewConfig.tsx:28:    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ztrader/scripts/integrations/verify.sh:112:echo "  3. Access Backend API docs: http://localhost:8000/docs"
docs/prompts/cloudflare-routing/00-master-meta-cloudflare-architect.prompt.md:45:- Detect conflicts such as `zdash-api.zeaz.dev` vs requested `api-zdash.zeaz.dev`.
docs/prompts/fix-cloudflare-terraform-zdash-official.prompt:17:   - REPLACE_WITH_ZEAZ_DEV_ZONE_ID
docs/prompts/fix-cloudflare-terraform-zdash-official.prompt:18:   - REPLACE_WITH_TUNNEL_UUID
docs/reports/ZTRADER_COMPLETION_FIX_REPORT.md:21:| Env example | `.env.example` used backend `PORT=8000`, frontend URL `localhost:8000`, and live kill switch false. | Did not match app route plan or safety-first release posture. |
docs/reports/generated/repo-deep-dive-report.md:654:.agents/skills/zai-build-automation/references/BEST-PRACTICES.md:520:serve       → symfony server:start (or php -S localhost:8000 -t public/)
docs/reports/generated/repo-deep-dive-report.md:655:.agents/skills/zai-build-automation/templates/justfile-php:42:    {{ php }} -S localhost:8000 -t public/
docs/reports/generated/repo-deep-dive-report.md:656:.agents/skills/zai-build-automation/templates/makefile-php.mk:44:	$(PHP) -S localhost:8000 -t public/
docs/reports/generated/repo-deep-dive-report.md:657:.agents/skills/zai-build-automation/templates/taskfile-php.yml:45:      - '{{.PHP}} -S localhost:8000 -t public/'
docs/reports/generated/repo-deep-dive-report.md:658:apps/zeaz-api/docker-compose.yml:16:      test: ["CMD", "python3", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8000/api/runtime/services')"]
docs/reports/generated/repo-deep-dive-report.md:659:apps/openwork/zeaz/installer/mcp-fix-phase2.sh:113:	Try: http://localhost:8000/sse
docs/reports/generated/repo-deep-dive-report.md:660:apps/zeaz-web/src/app/dashboard/swarm-runtime/page.tsx:13:      const res = await fetch('http://localhost:8000/api/runtime/swarm/agents');
docs/reports/generated/repo-deep-dive-report.md:661:apps/zeaz-web/src/app/dashboard/swarm-runtime/page.tsx:18:    const ws = new WebSocket('ws://localhost:8000/api/runtime/swarm/ws/swarm');
docs/reports/generated/repo-deep-dive-report.md:662:apps/zeaz-web/src/lib/api.ts:11:  return "http://localhost:8000";
docs/reports/generated/repo-deep-dive-report.md:663:apps/zdash/.codex/cloud/AGENTS.template.md:25:- Never introduce `localhost:8000`.
docs/reports/generated/repo-deep-dive-report.md:664:apps/zdash/.codex/cloud/general-custom-instructions.md:31:- never introduce localhost:8000 in repo changes
docs/reports/generated/repo-deep-dive-report.md:665:apps/zdash/.codex/cloud/maintenance.sh:100:  tracked_source_grep "localhost:8000|BACKEND_PORT=8000"
docs/reports/generated/repo-deep-dive-report.md:666:apps/zdash/.codex/cloud/maintenance.sh:107:if tracked_source_grep "localhost:8000|BACKEND_PORT=8000" >/tmp/zdash-codex-port8000.txt && [ -s /tmp/zdash-codex-port8000.txt ]; then
docs/reports/generated/repo-deep-dive-report.md:667:apps/zdash/.codex/cloud/phase-runner.md:27:- never introduce localhost:8000
docs/reports/generated/repo-deep-dive-report.md:668:apps/zdash/.codex/cloud/phase-runner.md:58:- never use localhost:8000
docs/reports/generated/repo-deep-dive-report.md:669:apps/zdash/.codex/cloud/phase-runner.md:126:Never use `localhost:8000`; backend port is `8005`.
docs/reports/generated/repo-deep-dive-report.md:670:apps/zdash/.codex/cloud/setup.sh:110:if grep -RIn "localhost:8000\|BACKEND_PORT=8000" \
docs/reports/generated/repo-deep-dive-report.md:671:apps/zdash/Makefile:117:	@tmp=$$(mktemp); git grep -nE 'localhost:8000|BACKEND_PORT=8000' -- . ':(exclude)Makefile' ':(exclude)docs/**' ':(exclude)**/*.md' > $$tmp 2>/dev/null || true; if [ -s $$tmp ]; then cat $$tmp; rm -f $$tmp; exit 1; else rm -f $$tmp; echo "PASSED: no old backend port 8000 found"; fi
docs/reports/generated/repo-deep-dive-report.md:672:apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md:11:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` in tracked runtime/source files.
docs/reports/generated/repo-deep-dive-report.md:673:apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md:116:- runtime/source references to `localhost:8000` or `BACKEND_PORT=8000`
docs/reports/generated/repo-deep-dive-report.md:674:apps/zdash/docs/prompts/phase02-exec.prompt:550:curl http://localhost:8000/api/trading/status
docs/reports/generated/repo-deep-dive-report.md:675:apps/zdash/docs/prompts/phase02-exec.prompt:554:curl -X POST http://localhost:8000/api/trading/scan \
docs/reports/generated/repo-deep-dive-report.md:676:apps/zdash/docs/prompts/phase03-exec.prompt:622:curl -X POST http://localhost:8000/api/risk/check \
docs/reports/generated/repo-deep-dive-report.md:677:apps/zdash/docs/prompts/phase03-exec.prompt:636:curl -X POST http://localhost:8000/api/risk/halt \
docs/reports/generated/repo-deep-dive-report.md:678:apps/zdash/docs/prompts/phase03-exec.prompt:642:curl -X POST http://localhost:8000/api/risk/resume \
docs/reports/generated/repo-deep-dive-report.md:679:apps/zdash/docs/prompts/phase04-exec.prompt:818:curl http://localhost:8000/api/scheduler/status
docs/reports/generated/repo-deep-dive-report.md:680:apps/zdash/docs/prompts/phase04-exec.prompt:822:curl http://localhost:8000/api/scheduler/jobs
docs/reports/generated/repo-deep-dive-report.md:681:apps/zdash/docs/prompts/phase04-exec.prompt:826:curl -X POST http://localhost:8000/api/scheduler/jobs \
docs/reports/generated/repo-deep-dive-report.md:682:apps/zdash/docs/prompts/phase04-exec.prompt:842:curl -X POST http://localhost:8000/api/scheduler/jobs/JOB_ID/run
docs/reports/generated/repo-deep-dive-report.md:683:apps/zdash/docs/prompts/phase04-exec.prompt:846:curl http://localhost:8000/api/iot/status
docs/reports/generated/repo-deep-dive-report.md:684:apps/zdash/docs/prompts/phase04-exec.prompt:850:curl -X POST http://localhost:8000/api/iot/power-cycle \
docs/reports/generated/repo-deep-dive-report.md:685:apps/zdash/docs/prompts/phase05-exec.prompt:1035:curl http://localhost:8000/api/backtesting/strategies
docs/reports/generated/repo-deep-dive-report.md:686:apps/zdash/docs/prompts/phase05-exec.prompt:1039:curl -X POST http://localhost:8000/api/backtesting/run \
docs/reports/generated/repo-deep-dive-report.md:687:apps/zdash/docs/prompts/phase05-exec.prompt:1053:curl -X POST http://localhost:8000/api/backtesting/optimize \
docs/reports/generated/repo-deep-dive-report.md:688:apps/zdash/docs/prompts/phase05-exec.prompt:1073:curl -X POST http://localhost:8000/api/backtesting/results/RESULT_ID/promotion-check
docs/reports/generated/repo-deep-dive-report.md:689:apps/zdash/docs/prompts/phase05-exec.prompt:1077:curl http://localhost:8000/api/backtesting/results/RESULT_ID/report
docs/reports/generated/repo-deep-dive-report.md:690:apps/zdash/docs/prompts/phase06-exec.prompt:1144:curl -X POST http://localhost:8000/api/content/create \
docs/reports/generated/repo-deep-dive-report.md:691:apps/zdash/docs/prompts/phase06-exec.prompt:1160:curl -X POST http://localhost:8000/api/content/generate-graphic \
docs/reports/generated/repo-deep-dive-report.md:692:apps/zdash/docs/prompts/phase06-exec.prompt:1171:curl -X POST http://localhost:8000/api/content/approve \
docs/reports/generated/repo-deep-dive-report.md:693:apps/zdash/docs/prompts/phase06-exec.prompt:1181:curl -X POST http://localhost:8000/api/content/post \
docs/reports/generated/repo-deep-dive-report.md:694:apps/zdash/docs/prompts/phase06-exec.prompt:1191:curl -X POST http://localhost:8000/api/content/pipeline/run \
docs/reports/generated/repo-deep-dive-report.md:695:apps/zdash/docs/prompts/phase07-exec.prompt:268:VITE_API_BASE_URL=http://localhost:8000
docs/reports/generated/repo-deep-dive-report.md:696:apps/zdash/docs/prompts/phase08-exec.prompt:268:VITE_API_BASE_URL=http://localhost:8000
docs/reports/generated/repo-deep-dive-report.md:697:apps/zdash/docs/prompts/phase08-exec.prompt:870:curl -X POST http://localhost:8000/api/auth/bootstrap-admin
docs/reports/generated/repo-deep-dive-report.md:698:apps/zdash/docs/prompts/phase08-exec.prompt:874:curl -X POST http://localhost:8000/api/auth/login \
docs/reports/generated/repo-deep-dive-report.md:699:apps/zdash/docs/prompts/phase08-exec.prompt:883:curl http://localhost:8000/api/admin/safety-check \
docs/reports/generated/repo-deep-dive-report.md:700:apps/zdash/docs/prompts/phase10-exec.prompt:1499:curl http://localhost:8000/api/billing/plans \
docs/reports/generated/repo-deep-dive-report.md:701:apps/zdash/docs/prompts/phase10-exec.prompt:1504:curl http://localhost:8000/api/billing/status \
docs/reports/generated/repo-deep-dive-report.md:702:apps/zdash/docs/prompts/phase10-exec.prompt:1509:curl http://localhost:8000/api/billing/usage \
docs/reports/generated/repo-deep-dive-report.md:703:apps/zdash/docs/prompts/phase10-exec.prompt:1514:curl -X POST http://localhost:8000/api/billing/mock/apply-plan \
docs/reports/generated/repo-deep-dive-report.md:704:apps/zdash/docs/prompts/phase10-exec.prompt:1521:curl http://localhost:8000/api/marketplace/plugins \
docs/reports/generated/repo-deep-dive-report.md:705:apps/zdash/docs/prompts/phase10-exec.prompt:1526:curl http://localhost:8000/api/enterprise/status \
docs/reports/generated/repo-deep-dive-report.md:706:apps/zdash/docs/prompts/phase11-exec.prompt:1744:curl http://localhost:8000/api/aiops/models \
docs/reports/generated/repo-deep-dive-report.md:707:apps/zdash/docs/prompts/phase11-exec.prompt:1749:curl http://localhost:8000/api/aiops/prompts \
docs/reports/generated/repo-deep-dive-report.md:708:apps/zdash/docs/prompts/phase11-exec.prompt:1754:curl -X POST http://localhost:8000/api/governance/dlp/scan-text \
docs/reports/generated/repo-deep-dive-report.md:709:apps/zdash/docs/prompts/phase11-exec.prompt:1761:curl http://localhost:8000/api/governance/approvals \
docs/reports/generated/repo-deep-dive-report.md:710:apps/zdash/docs/prompts/phase11-exec.prompt:1766:curl -X POST http://localhost:8000/api/compliance/reports/generate \
docs/reports/generated/repo-deep-dive-report.md:711:apps/zdash/docs/prompts/phase12-exec.prompt:1848:curl -X POST http://localhost:8000/api/ops/evaluate \
docs/reports/generated/repo-deep-dive-report.md:712:apps/zdash/docs/prompts/phase12-exec.prompt:1853:curl http://localhost:8000/api/ops/incidents \
docs/reports/generated/repo-deep-dive-report.md:713:apps/zdash/docs/prompts/phase12-exec.prompt:1858:curl -X POST http://localhost:8000/api/managed/support/cases \
docs/reports/generated/repo-deep-dive-report.md:714:apps/zdash/docs/prompts/phase12-exec.prompt:1869:curl -X POST http://localhost:8000/api/integrations/siem/export \
docs/reports/generated/repo-deep-dive-report.md:715:apps/zdash/docs/prompts/phase12-exec.prompt:1876:curl -X POST http://localhost:8000/api/ops/dr/backup-validation \
docs/reports/generated/repo-deep-dive-report.md:716:apps/zdash/docs/prompts/phase13-exec.prompt:469:EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
docs/reports/generated/repo-deep-dive-report.md:717:apps/zdash/docs/prompts/phase13-exec.prompt:1610:curl -X POST http://localhost:8000/api/developer/api-keys \
docs/reports/generated/repo-deep-dive-report.md:718:apps/zdash/docs/prompts/phase13-exec.prompt:1621:curl http://localhost:8000/partner/v1/health \
docs/reports/generated/repo-deep-dive-report.md:719:apps/zdash/docs/prompts/phase13-exec.prompt:1626:curl http://localhost:8000/partner/v1/risk/status \
docs/reports/generated/repo-deep-dive-report.md:720:apps/zdash/docs/prompts/phase14-exec.prompt:453:VITE_API_BASE_URL=http://localhost:8000
docs/reports/generated/repo-deep-dive-report.md:721:apps/zdash/docs/prompts/phase23-exec.prompt:929:curl http://localhost:8000/api/governance/status \
docs/reports/generated/repo-deep-dive-report.md:722:apps/zdash/docs/prompts/phase23-exec.prompt:934:curl -X POST http://localhost:8000/api/governance/simulate \
docs/reports/generated/repo-deep-dive-report.md:723:apps/zdash/docs/prompts/phase23-exec.prompt:951:curl -X POST http://localhost:8000/api/compliance/collect-evidence \
docs/reports/generated/repo-deep-dive-report.md:724:apps/zdash/docs/prompts/phase23-exec.prompt:956:curl -X POST http://localhost:8000/api/disaster-recovery/restore-drill \
docs/reports/generated/repo-deep-dive-report.md:725:apps/zdash/docs/prompts/phase23-exec.prompt:966:curl -X POST http://localhost:8000/api/incidents/runbooks/execute \
docs/reports/generated/repo-deep-dive-report.md:726:apps/zdash/docs/prompts/phase35-exec-master-meta-final-release.prompt:123:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` outside archived/local-only prompt artifacts.
docs/reports/generated/repo-deep-dive-report.md:727:apps/zdash/docs/prompts/phase35.1-backend-release-hardening.prompt:25:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000`.
docs/reports/generated/repo-deep-dive-report.md:728:apps/zdash/docs/prompts/phase35.4-docs-runbooks-api-examples.prompt:19:- Do not introduce `localhost:8000` or `BACKEND_PORT=8000`.
docs/reports/generated/repo-deep-dive-report.md:729:apps/zdash/docs/prompts/phase35.5-makefile-ci-maintenance-validation.prompt:18:- Backend port is `8005`; do not introduce `localhost:8000` or `BACKEND_PORT=8000` in tracked runtime/source files.
docs/reports/generated/repo-deep-dive-report.md:730:apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:155:  - /opt/zdash/runtime/scripts/zdash-health.sh
docs/reports/generated/repo-deep-dive-report.md:731:apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:156:  - /opt/zdash/runtime/scripts/zdash-logs.sh
docs/reports/generated/repo-deep-dive-report.md:732:apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:157:  - /opt/zdash/runtime/scripts/zdash-backup.sh
docs/reports/generated/repo-deep-dive-report.md:733:apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:158:  - /opt/zdash/runtime/scripts/zdash-update.sh
docs/reports/generated/repo-deep-dive-report.md:734:apps/zdash/docs/prompts/phase36-exec-server-command-center.prompt:436:- production wrapper scripts fail safely if /opt/zdash/runtime is absent.
docs/reports/generated/repo-deep-dive-report.md:735:apps/zdash/docs/prompts/phase39-exec-production-deployment-dryrun-bservability-verification.prompt:41:- If /opt/zdash/runtime is missing, fail clearly with:
docs/reports/generated/repo-deep-dive-report.md:736:apps/zdash/docs/prompts/phase40-exec-production-install-rehearsal-go-live-evidence-capture.prompt:41:- If /opt/zdash/runtime is absent, fail safely and tell user to run:
docs/reports/generated/repo-deep-dive-report.md:737:apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:53:.codex/cloud/maintenance.sh:100:  tracked_source_grep "localhost:8000|BACKEND_PORT=8000"
docs/reports/generated/repo-deep-dive-report.md:738:apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:54:.codex/cloud/maintenance.sh:107:if tracked_source_grep "localhost:8000|BACKEND_PORT=8000" >/tmp/zdash-codex-port8000.txt && [ -s /tmp/zdash-codex-port8000.txt ]; then
docs/reports/generated/repo-deep-dive-report.md:739:apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt:77:.codex/cloud/setup.sh:110:if grep -RIn "localhost:8000\|BACKEND_PORT=8000" \
docs/reports/generated/repo-deep-dive-report.md:740:apps/zdash/docs/runbooks/GO_LIVE_REHEARSAL.md:17:- Production runtime installed at `/opt/zdash/runtime`.
docs/reports/generated/repo-deep-dive-report.md:741:apps/zdash/docs/runbooks/INSTALLATION.md:56:sudo nano /opt/zdash/runtime/.env.production
docs/reports/generated/repo-deep-dive-report.md:742:apps/zdash/docs/runbooks/PHASE36_SERVER_COMMAND_CENTER.md:51:| Runtime | `.runtime/` (gitignored) | `/opt/zdash/` (systemd) |
docs/reports/generated/repo-deep-dive-report.md:743:apps/zdash/docs/runbooks/PHASE36_SERVER_COMMAND_CENTER.md:64:- **Production scripts fail safely** — clear error if `/opt/zdash/runtime` is absent
docs/reports/generated/repo-deep-dive-report.md:744:apps/zdash/docs/runbooks/PRODUCTION_DRY_RUN_VERIFICATION.md:26:Checks that the production runtime directory exists at `/opt/zdash/runtime` and contains all required components.
docs/reports/generated/repo-deep-dive-report.md:745:apps/zdash/docs/runbooks/PRODUCTION_DRY_RUN_VERIFICATION.md:44:Production runtime not found at /opt/zdash/runtime
docs/reports/generated/repo-deep-dive-report.md:746:apps/zdash/docs/runbooks/START_SERVER.md:57:Production runs via systemd + Docker Compose under `/opt/zdash/`.
docs/reports/generated/repo-deep-dive-report.md:747:apps/zdash/install-zdash-prod.sh:21:INSTALL_ROOT="${INSTALL_ROOT:-/opt/zdash}"
docs/reports/generated/repo-deep-dive-report.md:748:apps/zdash/install-zdash-prod.sh:158:  # When executed from elsewhere, clone/update /opt/zdash/app.
docs/reports/generated/repo-deep-dive-report.md:749:apps/zdash/scripts/prod/capture-go-live-evidence.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:750:apps/zdash/scripts/prod/run-go-live-rehearsal.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:751:apps/zdash/scripts/prod/verify-go-live-safety-locks.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:752:apps/zdash/scripts/prod/verify-prod-health.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:753:apps/zdash/scripts/prod/verify-prod-observability.sh:13:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:754:apps/zdash/scripts/prod/verify-prod-rollback-readiness.sh:13:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:755:apps/zdash/scripts/prod/verify-prod-runtime.sh:4:ZDASH_RUNTIME="${ZDASH_PROD_RUNTIME:-/opt/zdash/runtime}"
docs/reports/generated/repo-deep-dive-report.md:756:apps/zdash/scripts/server/logs-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
docs/reports/generated/repo-deep-dive-report.md:757:apps/zdash/scripts/server/logs-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
docs/reports/generated/repo-deep-dive-report.md:758:apps/zdash/scripts/server/logs-prod.sh:12:if [[ -f "/opt/zdash/runtime/scripts/zdash-logs.sh" ]]; then
docs/reports/generated/repo-deep-dive-report.md:759:apps/zdash/scripts/server/logs-prod.sh:13:  exec bash "/opt/zdash/runtime/scripts/zdash-logs.sh" "$SERVICE"
infra/ai-runtime/Dockerfile:8:HEALTHCHECK --interval=30s --timeout=10s --retries=3 CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/')" || exit 1
infra/ai-runtime/compose.yaml:80:      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
reports/merge/ztrader/ztrader-keyword-scan.txt:210:docs/reports/generated/critical-apps-deep-dive.md:49:apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py:252:    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
reports/merge/ztrader/ztrader-keyword-scan.txt:214:docs/reports/generated/critical-apps-deep-dive.md:53:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:25:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/pnl`)
reports/merge/ztrader/ztrader-keyword-scan.txt:215:docs/reports/generated/critical-apps-deep-dive.md:54:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:53:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/strategies`)
reports/merge/ztrader/ztrader-keyword-scan.txt:216:docs/reports/generated/critical-apps-deep-dive.md:55:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:71:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/start`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:217:docs/reports/generated/critical-apps-deep-dive.md:56:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:80:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/stop`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:218:docs/reports/generated/critical-apps-deep-dive.md:57:apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx:27:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/exchange/keys`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:219:docs/reports/generated/critical-apps-deep-dive.md:58:apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx:26:      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:220:docs/reports/generated/critical-apps-deep-dive.md:59:apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx:30:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:221:docs/reports/generated/critical-apps-deep-dive.md:60:apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx:33:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:224:docs/reports/generated/critical-apps-deep-dive.md:63:apps/ABTPi18n/.env.example:23:NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:226:docs/reports/generated/critical-apps-deep-dive.md:65:apps/ABTPi18n/.env.example:78:API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:229:docs/reports/generated/critical-apps-deep-dive.md:68:apps/ABTPi18n/verify.sh:112:echo "  3. Access Backend API docs: http://localhost:8000/docs"
reports/merge/ztrader/ztrader-keyword-scan.txt:250:docs/reports/generated/critical-apps-deep-dive.md:89:apps/ABTPi18n/README.md:125:   - Backend API: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:262:docs/reports/generated/critical-apps-deep-dive.md:101:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:264:docs/reports/generated/critical-apps-deep-dive.md:103:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:161:   - Navigate to: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:274:docs/reports/generated/critical-apps-deep-dive.md:113:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:276:docs/reports/generated/critical-apps-deep-dive.md:115:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:161:   - นำทางไปที่: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:280:docs/reports/generated/critical-apps-deep-dive.md:119:apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md:9:Development: http://localhost:8000/v1
reports/merge/ztrader/ztrader-keyword-scan.txt:281:docs/reports/generated/critical-apps-deep-dive.md:120:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:37:curl -X GET "http://localhost:8000/audit/logs?userId=1&action=CREATE&startDate=2025-11-01T00:00:00Z"
reports/merge/ztrader/ztrader-keyword-scan.txt:282:docs/reports/generated/critical-apps-deep-dive.md:121:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:70:curl -X GET "http://localhost:8000/audit/logs/1"
reports/merge/ztrader/ztrader-keyword-scan.txt:283:docs/reports/generated/critical-apps-deep-dive.md:122:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:86:curl -X GET "http://localhost:8000/audit/export?format=csv&startDate=2025-11-01T00:00:00Z" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:284:docs/reports/generated/critical-apps-deep-dive.md:123:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:16:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:285:docs/reports/generated/critical-apps-deep-dive.md:124:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:22:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:286:docs/reports/generated/critical-apps-deep-dive.md:125:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:25:curl http://localhost:8000/audit/logs?limit=5
reports/merge/ztrader/ztrader-keyword-scan.txt:287:docs/reports/generated/critical-apps-deep-dive.md:126:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:30:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:288:docs/reports/generated/critical-apps-deep-dive.md:127:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:69:curl http://localhost:8000/health/detailed | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:289:docs/reports/generated/critical-apps-deep-dive.md:128:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:74:curl "http://localhost:8000/audit/export?format=csv&startDate=$(date -d '7 days ago' -I)" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:290:docs/reports/generated/critical-apps-deep-dive.md:129:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:79:curl http://localhost:8000/secrets/rotation/due?daysAhead=30 | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:291:docs/reports/generated/critical-apps-deep-dive.md:130:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:92:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:292:docs/reports/generated/critical-apps-deep-dive.md:131:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:105:curl "http://localhost:8000/audit/logs?userId=1&action=CREATE"
reports/merge/ztrader/ztrader-keyword-scan.txt:293:docs/reports/generated/critical-apps-deep-dive.md:132:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:108:curl "http://localhost:8000/audit/logs" | jq '.logs[] | select(.statusCode >= 500)'
reports/merge/ztrader/ztrader-keyword-scan.txt:294:docs/reports/generated/critical-apps-deep-dive.md:133:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:115:  curl -s http://localhost:8000/health | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:295:docs/reports/generated/critical-apps-deep-dive.md:134:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:110:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:296:docs/reports/generated/critical-apps-deep-dive.md:135:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:114:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:297:docs/reports/generated/critical-apps-deep-dive.md:136:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:118:curl http://localhost:8000/health/database
reports/merge/ztrader/ztrader-keyword-scan.txt:298:docs/reports/generated/critical-apps-deep-dive.md:137:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:125:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:299:docs/reports/generated/critical-apps-deep-dive.md:138:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:128:curl http://localhost:8000/audit/logs?limit=10
reports/merge/ztrader/ztrader-keyword-scan.txt:300:docs/reports/generated/critical-apps-deep-dive.md:139:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:132:curl http://localhost:8000/audit/stats
reports/merge/ztrader/ztrader-keyword-scan.txt:301:docs/reports/generated/critical-apps-deep-dive.md:140:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:139:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:302:docs/reports/generated/critical-apps-deep-dive.md:141:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:143:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:303:docs/reports/generated/critical-apps-deep-dive.md:142:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:153:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:304:docs/reports/generated/critical-apps-deep-dive.md:143:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:429:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:305:docs/reports/generated/critical-apps-deep-dive.md:144:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:430:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:306:docs/reports/generated/critical-apps-deep-dive.md:145:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:433:curl http://localhost:8000/audit/logs
reports/merge/ztrader/ztrader-keyword-scan.txt:307:docs/reports/generated/critical-apps-deep-dive.md:146:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:436:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:308:docs/reports/generated/critical-apps-deep-dive.md:147:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:53:    "http://localhost:8000/payment/promptpay/create",
reports/merge/ztrader/ztrader-keyword-scan.txt:309:docs/reports/generated/critical-apps-deep-dive.md:148:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:106:curl -X GET http://localhost:8000/rental/contract \
reports/merge/ztrader/ztrader-keyword-scan.txt:310:docs/reports/generated/critical-apps-deep-dive.md:149:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:241:    "http://localhost:8000/plugins/install",
reports/merge/ztrader/ztrader-keyword-scan.txt:311:docs/reports/generated/critical-apps-deep-dive.md:150:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:289:    "http://localhost:8000/portfolio/accounts",
reports/merge/ztrader/ztrader-keyword-scan.txt:312:docs/reports/generated/critical-apps-deep-dive.md:151:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:328:    "http://localhost:8000/portfolio/summary",
reports/merge/ztrader/ztrader-keyword-scan.txt:313:docs/reports/generated/critical-apps-deep-dive.md:152:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:367:    "http://localhost:8000/backtest/run",
reports/merge/ztrader/ztrader-keyword-scan.txt:314:docs/reports/generated/critical-apps-deep-dive.md:153:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:393:    f"http://localhost:8000/backtest/runs/{backtest_id}",
reports/merge/ztrader/ztrader-keyword-scan.txt:315:docs/reports/generated/critical-apps-deep-dive.md:154:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:449:    "http://localhost:8000/backtest/paper/start",
reports/merge/ztrader/ztrader-keyword-scan.txt:316:docs/reports/generated/critical-apps-deep-dive.md:155:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:477:    "http://localhost:8000/backtest/paper/stop",
reports/merge/ztrader/ztrader-keyword-scan.txt:317:docs/reports/generated/critical-apps-deep-dive.md:156:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:721:curl -X POST http://localhost:8000/payment/webhook/promptpay \
reports/merge/ztrader/ztrader-keyword-scan.txt:322:docs/reports/generated/critical-apps-deep-dive.md:161:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:974:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:323:docs/reports/generated/critical-apps-deep-dive.md:162:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:975:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:324:docs/reports/generated/critical-apps-deep-dive.md:163:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:976:- **Metrics**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:328:docs/reports/generated/critical-apps-deep-dive.md:167:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:218:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:332:docs/reports/generated/critical-apps-deep-dive.md:171:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:222:- **Metrics Endpoint**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:333:docs/reports/generated/critical-apps-deep-dive.md:172:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:63:Access the API at: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:334:docs/reports/generated/critical-apps-deep-dive.md:173:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:64:API Documentation: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:339:docs/reports/generated/critical-apps-deep-dive.md:178:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:312:- Backend API: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:340:docs/reports/generated/critical-apps-deep-dive.md:179:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:313:- API Docs: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:345:docs/reports/generated/critical-apps-deep-dive.md:184:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:373:NEXT_PUBLIC_API_URL="http://localhost:8000"
reports/merge/ztrader/ztrader-keyword-scan.txt:346:docs/reports/generated/critical-apps-deep-dive.md:185:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:533:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:347:docs/reports/generated/critical-apps-deep-dive.md:186:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:534:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:352:docs/reports/generated/critical-apps-deep-dive.md:191:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:13:curl -X POST http://localhost:8000/ml/signal/score \
reports/merge/ztrader/ztrader-keyword-scan.txt:353:docs/reports/generated/critical-apps-deep-dive.md:192:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:51:curl -X POST http://localhost:8000/ml/volatility/predict \
reports/merge/ztrader/ztrader-keyword-scan.txt:354:docs/reports/generated/critical-apps-deep-dive.md:193:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:81:curl -X POST http://localhost:8000/ml/tune/start \
reports/merge/ztrader/ztrader-keyword-scan.txt:355:docs/reports/generated/critical-apps-deep-dive.md:194:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:109:curl http://localhost:8000/ml/tune/status/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:356:docs/reports/generated/critical-apps-deep-dive.md:195:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:114:curl http://localhost:8000/ml/tune/results/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:357:docs/reports/generated/critical-apps-deep-dive.md:196:apps/ABTPi18n/docs/integrations/TRADINGVIEW_INTEGRATION.md:353:- Review [API documentation](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:358:docs/reports/generated/critical-apps-deep-dive.md:197:apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md:115:  API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:360:docs/reports/generated/critical-apps-deep-dive.md:199:apps/ABTPi18n/Grok.md:1793:  CMD python -c "import requests; requests.get('http://localhost:8000/health')"
reports/merge/ztrader/ztrader-keyword-scan.txt:361:docs/reports/generated/critical-apps-deep-dive.md:200:apps/ABTPi18n/Grok.md:1994:  metrics)   curl http://localhost:8000/metrics | grep omega_ ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:362:docs/reports/generated/critical-apps-deep-dive.md:201:apps/ABTPi18n/Grok.md:1995:  health)    docker-compose exec omega-bot curl http://localhost:8000/health ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:364:docs/reports/generated/critical-apps-deep-dive.md:203:apps/ABTPi18n/install.sh:57:echo "Backend:  http://localhost:8000/docs"
reports/merge/ztrader/ztrader-keyword-scan.txt:427:docs/reports/generated/critical-apps-deep-dive.md:355:apps/zkbtrader/.vendor/ECC/skills/deployment-patterns/SKILL.md:164:HEALTHCHECK --interval=30s --timeout=3s CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000/health/')" || exit 1
reports/merge/ztrader/ztrader-keyword-scan.txt:449:docs/reports/generated/critical-apps-deep-dive.md:377:apps/zkbtrader/.vendor/ECC/skills/django-verification/SKILL.md:252:# Visit http://localhost:8000/swagger/ in browser
reports/merge/ztrader/ztrader-keyword-scan.txt:513:docs/reports/generated/critical-apps-deep-dive.md:441:apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/django-verification/SKILL.md:243:# ブラウザで http://localhost:8000/swagger/ を訪問
reports/merge/ztrader/ztrader-keyword-scan.txt:578:docs/reports/generated/apps-deep-dive.md:83:- `http://localhost:8000/health` from `apps/ABTPi18n/Grok.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md, apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md`
reports/merge/ztrader/ztrader-keyword-scan.txt:579:docs/reports/generated/apps-deep-dive.md:84:- `http://localhost:8000/health/database` from `apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md`
reports/merge/ztrader/ztrader-keyword-scan.txt:580:docs/reports/generated/apps-deep-dive.md:85:- `http://localhost:8000/health/detailed` from `apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md, apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md`
reports/merge/ztrader/ztrader-keyword-scan.txt:635:docs/reports/generated/apps-deep-dive.md:979:- `http://localhost:8000/health/` from `apps/zkbtrader/.vendor/ECC/.kiro/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/tr/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/deployment-patterns/SKILL.md`
reports/merge/ztrader/ztrader-keyword-scan.txt:711:docs/reports/generated/repo-deep-dive-report.md:549:apps/ABTPi18n/.env.example:23:NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:712:docs/reports/generated/repo-deep-dive-report.md:550:apps/ABTPi18n/.env.example:78:API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:713:docs/reports/generated/repo-deep-dive-report.md:551:apps/ABTPi18n/Grok.md:1793:  CMD python -c "import requests; requests.get('http://localhost:8000/health')"
reports/merge/ztrader/ztrader-keyword-scan.txt:714:docs/reports/generated/repo-deep-dive-report.md:552:apps/ABTPi18n/Grok.md:1994:  metrics)   curl http://localhost:8000/metrics | grep omega_ ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:715:docs/reports/generated/repo-deep-dive-report.md:553:apps/ABTPi18n/Grok.md:1995:  health)    docker-compose exec omega-bot curl http://localhost:8000/health ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:716:docs/reports/generated/repo-deep-dive-report.md:554:apps/ABTPi18n/README.md:125:   - Backend API: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:717:docs/reports/generated/repo-deep-dive-report.md:555:apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py:252:    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
reports/merge/ztrader/ztrader-keyword-scan.txt:718:docs/reports/generated/repo-deep-dive-report.md:556:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:25:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/pnl`)
reports/merge/ztrader/ztrader-keyword-scan.txt:719:docs/reports/generated/repo-deep-dive-report.md:557:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:53:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/strategies`)
reports/merge/ztrader/ztrader-keyword-scan.txt:720:docs/reports/generated/repo-deep-dive-report.md:558:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:71:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/start`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:721:docs/reports/generated/repo-deep-dive-report.md:559:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:80:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/stop`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:722:docs/reports/generated/repo-deep-dive-report.md:560:apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx:27:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/exchange/keys`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:723:docs/reports/generated/repo-deep-dive-report.md:561:apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx:26:      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:724:docs/reports/generated/repo-deep-dive-report.md:562:apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx:33:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:725:docs/reports/generated/repo-deep-dive-report.md:563:apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx:30:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:726:docs/reports/generated/repo-deep-dive-report.md:564:apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md:115:  API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:727:docs/reports/generated/repo-deep-dive-report.md:565:apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md:9:Development: http://localhost:8000/v1
reports/merge/ztrader/ztrader-keyword-scan.txt:728:docs/reports/generated/repo-deep-dive-report.md:566:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:729:docs/reports/generated/repo-deep-dive-report.md:567:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:161:   - Navigate to: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:730:docs/reports/generated/repo-deep-dive-report.md:568:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:731:docs/reports/generated/repo-deep-dive-report.md:569:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:161:   - นำทางไปที่: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:732:docs/reports/generated/repo-deep-dive-report.md:570:apps/ABTPi18n/docs/integrations/TRADINGVIEW_INTEGRATION.md:353:- Review [API documentation](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:733:docs/reports/generated/repo-deep-dive-report.md:571:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:63:Access the API at: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:734:docs/reports/generated/repo-deep-dive-report.md:572:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:64:API Documentation: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:735:docs/reports/generated/repo-deep-dive-report.md:573:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:312:- Backend API: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:736:docs/reports/generated/repo-deep-dive-report.md:574:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:313:- API Docs: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:737:docs/reports/generated/repo-deep-dive-report.md:575:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:373:NEXT_PUBLIC_API_URL="http://localhost:8000"
reports/merge/ztrader/ztrader-keyword-scan.txt:738:docs/reports/generated/repo-deep-dive-report.md:576:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:533:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:739:docs/reports/generated/repo-deep-dive-report.md:577:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:534:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:740:docs/reports/generated/repo-deep-dive-report.md:578:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:974:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:741:docs/reports/generated/repo-deep-dive-report.md:579:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:975:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:742:docs/reports/generated/repo-deep-dive-report.md:580:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:976:- **Metrics**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:743:docs/reports/generated/repo-deep-dive-report.md:581:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:218:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:744:docs/reports/generated/repo-deep-dive-report.md:582:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:222:- **Metrics Endpoint**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:745:docs/reports/generated/repo-deep-dive-report.md:583:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:53:    "http://localhost:8000/payment/promptpay/create",
reports/merge/ztrader/ztrader-keyword-scan.txt:746:docs/reports/generated/repo-deep-dive-report.md:584:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:106:curl -X GET http://localhost:8000/rental/contract \
reports/merge/ztrader/ztrader-keyword-scan.txt:747:docs/reports/generated/repo-deep-dive-report.md:585:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:241:    "http://localhost:8000/plugins/install",
reports/merge/ztrader/ztrader-keyword-scan.txt:748:docs/reports/generated/repo-deep-dive-report.md:586:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:289:    "http://localhost:8000/portfolio/accounts",
reports/merge/ztrader/ztrader-keyword-scan.txt:749:docs/reports/generated/repo-deep-dive-report.md:587:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:328:    "http://localhost:8000/portfolio/summary",
reports/merge/ztrader/ztrader-keyword-scan.txt:750:docs/reports/generated/repo-deep-dive-report.md:588:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:367:    "http://localhost:8000/backtest/run",
reports/merge/ztrader/ztrader-keyword-scan.txt:751:docs/reports/generated/repo-deep-dive-report.md:589:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:393:    f"http://localhost:8000/backtest/runs/{backtest_id}",
reports/merge/ztrader/ztrader-keyword-scan.txt:752:docs/reports/generated/repo-deep-dive-report.md:590:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:449:    "http://localhost:8000/backtest/paper/start",
reports/merge/ztrader/ztrader-keyword-scan.txt:753:docs/reports/generated/repo-deep-dive-report.md:591:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:477:    "http://localhost:8000/backtest/paper/stop",
reports/merge/ztrader/ztrader-keyword-scan.txt:754:docs/reports/generated/repo-deep-dive-report.md:592:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:721:curl -X POST http://localhost:8000/payment/webhook/promptpay \
reports/merge/ztrader/ztrader-keyword-scan.txt:755:docs/reports/generated/repo-deep-dive-report.md:593:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:37:curl -X GET "http://localhost:8000/audit/logs?userId=1&action=CREATE&startDate=2025-11-01T00:00:00Z"
reports/merge/ztrader/ztrader-keyword-scan.txt:756:docs/reports/generated/repo-deep-dive-report.md:594:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:70:curl -X GET "http://localhost:8000/audit/logs/1"
reports/merge/ztrader/ztrader-keyword-scan.txt:757:docs/reports/generated/repo-deep-dive-report.md:595:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:86:curl -X GET "http://localhost:8000/audit/export?format=csv&startDate=2025-11-01T00:00:00Z" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:758:docs/reports/generated/repo-deep-dive-report.md:596:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:429:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:759:docs/reports/generated/repo-deep-dive-report.md:597:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:430:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:760:docs/reports/generated/repo-deep-dive-report.md:598:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:433:curl http://localhost:8000/audit/logs
reports/merge/ztrader/ztrader-keyword-scan.txt:761:docs/reports/generated/repo-deep-dive-report.md:599:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:436:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:762:docs/reports/generated/repo-deep-dive-report.md:600:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:110:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:763:docs/reports/generated/repo-deep-dive-report.md:601:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:114:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:764:docs/reports/generated/repo-deep-dive-report.md:602:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:118:curl http://localhost:8000/health/database
reports/merge/ztrader/ztrader-keyword-scan.txt:765:docs/reports/generated/repo-deep-dive-report.md:603:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:125:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:766:docs/reports/generated/repo-deep-dive-report.md:604:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:128:curl http://localhost:8000/audit/logs?limit=10
reports/merge/ztrader/ztrader-keyword-scan.txt:767:docs/reports/generated/repo-deep-dive-report.md:605:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:132:curl http://localhost:8000/audit/stats
reports/merge/ztrader/ztrader-keyword-scan.txt:768:docs/reports/generated/repo-deep-dive-report.md:606:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:139:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:769:docs/reports/generated/repo-deep-dive-report.md:607:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:143:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:770:docs/reports/generated/repo-deep-dive-report.md:608:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:153:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:771:docs/reports/generated/repo-deep-dive-report.md:609:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:16:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:772:docs/reports/generated/repo-deep-dive-report.md:610:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:22:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:773:docs/reports/generated/repo-deep-dive-report.md:611:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:25:curl http://localhost:8000/audit/logs?limit=5
reports/merge/ztrader/ztrader-keyword-scan.txt:774:docs/reports/generated/repo-deep-dive-report.md:612:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:30:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:775:docs/reports/generated/repo-deep-dive-report.md:613:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:69:curl http://localhost:8000/health/detailed | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:776:docs/reports/generated/repo-deep-dive-report.md:614:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:74:curl "http://localhost:8000/audit/export?format=csv&startDate=$(date -d '7 days ago' -I)" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:777:docs/reports/generated/repo-deep-dive-report.md:615:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:79:curl http://localhost:8000/secrets/rotation/due?daysAhead=30 | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:778:docs/reports/generated/repo-deep-dive-report.md:616:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:92:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:779:docs/reports/generated/repo-deep-dive-report.md:617:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:105:curl "http://localhost:8000/audit/logs?userId=1&action=CREATE"
reports/merge/ztrader/ztrader-keyword-scan.txt:780:docs/reports/generated/repo-deep-dive-report.md:618:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:108:curl "http://localhost:8000/audit/logs" | jq '.logs[] | select(.statusCode >= 500)'
reports/merge/ztrader/ztrader-keyword-scan.txt:781:docs/reports/generated/repo-deep-dive-report.md:619:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:115:  curl -s http://localhost:8000/health | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:782:docs/reports/generated/repo-deep-dive-report.md:620:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:13:curl -X POST http://localhost:8000/ml/signal/score \
reports/merge/ztrader/ztrader-keyword-scan.txt:783:docs/reports/generated/repo-deep-dive-report.md:621:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:51:curl -X POST http://localhost:8000/ml/volatility/predict \
reports/merge/ztrader/ztrader-keyword-scan.txt:784:docs/reports/generated/repo-deep-dive-report.md:622:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:81:curl -X POST http://localhost:8000/ml/tune/start \
reports/merge/ztrader/ztrader-keyword-scan.txt:785:docs/reports/generated/repo-deep-dive-report.md:623:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:109:curl http://localhost:8000/ml/tune/status/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:786:docs/reports/generated/repo-deep-dive-report.md:624:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:114:curl http://localhost:8000/ml/tune/results/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:787:docs/reports/generated/repo-deep-dive-report.md:625:apps/ABTPi18n/install.sh:57:echo "Backend:  http://localhost:8000/docs"
reports/merge/ztrader/ztrader-keyword-scan.txt:788:docs/reports/generated/repo-deep-dive-report.md:626:apps/ABTPi18n/verify.sh:112:echo "  3. Access Backend API docs: http://localhost:8000/docs"
reports/merge/ztrader/ztrader-keyword-scan.txt:789:docs/reports/generated/repo-deep-dive-report.md:757:docs/reports/generated/repo-deep-dive-report.md:549:apps/ABTPi18n/.env.example:23:NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:790:docs/reports/generated/repo-deep-dive-report.md:758:docs/reports/generated/repo-deep-dive-report.md:550:apps/ABTPi18n/.env.example:78:API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:791:docs/reports/generated/repo-deep-dive-report.md:759:docs/reports/generated/repo-deep-dive-report.md:551:apps/ABTPi18n/Grok.md:1793:  CMD python -c "import requests; requests.get('http://localhost:8000/health')"
reports/merge/ztrader/ztrader-keyword-scan.txt:792:docs/reports/generated/repo-deep-dive-report.md:760:docs/reports/generated/repo-deep-dive-report.md:552:apps/ABTPi18n/Grok.md:1994:  metrics)   curl http://localhost:8000/metrics | grep omega_ ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:793:docs/reports/generated/repo-deep-dive-report.md:761:docs/reports/generated/repo-deep-dive-report.md:553:apps/ABTPi18n/Grok.md:1995:  health)    docker-compose exec omega-bot curl http://localhost:8000/health ;;
reports/merge/ztrader/ztrader-keyword-scan.txt:794:docs/reports/generated/repo-deep-dive-report.md:762:docs/reports/generated/repo-deep-dive-report.md:554:apps/ABTPi18n/README.md:125:   - Backend API: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:795:docs/reports/generated/repo-deep-dive-report.md:763:docs/reports/generated/repo-deep-dive-report.md:555:apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py:252:    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
reports/merge/ztrader/ztrader-keyword-scan.txt:796:docs/reports/generated/repo-deep-dive-report.md:764:docs/reports/generated/repo-deep-dive-report.md:556:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:25:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/pnl`)
reports/merge/ztrader/ztrader-keyword-scan.txt:797:docs/reports/generated/repo-deep-dive-report.md:765:docs/reports/generated/repo-deep-dive-report.md:557:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:53:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/strategies`)
reports/merge/ztrader/ztrader-keyword-scan.txt:798:docs/reports/generated/repo-deep-dive-report.md:766:docs/reports/generated/repo-deep-dive-report.md:558:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:71:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/start`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:799:docs/reports/generated/repo-deep-dive-report.md:767:docs/reports/generated/repo-deep-dive-report.md:559:apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:80:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/stop`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:800:docs/reports/generated/repo-deep-dive-report.md:768:docs/reports/generated/repo-deep-dive-report.md:560:apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx:27:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/exchange/keys`, {
reports/merge/ztrader/ztrader-keyword-scan.txt:801:docs/reports/generated/repo-deep-dive-report.md:769:docs/reports/generated/repo-deep-dive-report.md:561:apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx:26:      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:802:docs/reports/generated/repo-deep-dive-report.md:770:docs/reports/generated/repo-deep-dive-report.md:562:apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx:33:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:803:docs/reports/generated/repo-deep-dive-report.md:771:docs/reports/generated/repo-deep-dive-report.md:563:apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx:30:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
reports/merge/ztrader/ztrader-keyword-scan.txt:804:docs/reports/generated/repo-deep-dive-report.md:772:docs/reports/generated/repo-deep-dive-report.md:564:apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md:115:  API_BASE_URL=http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:805:docs/reports/generated/repo-deep-dive-report.md:773:docs/reports/generated/repo-deep-dive-report.md:565:apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md:9:Development: http://localhost:8000/v1
reports/merge/ztrader/ztrader-keyword-scan.txt:806:docs/reports/generated/repo-deep-dive-report.md:774:docs/reports/generated/repo-deep-dive-report.md:566:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:807:docs/reports/generated/repo-deep-dive-report.md:775:docs/reports/generated/repo-deep-dive-report.md:567:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:161:   - Navigate to: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:808:docs/reports/generated/repo-deep-dive-report.md:776:docs/reports/generated/repo-deep-dive-report.md:568:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:153:   curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:809:docs/reports/generated/repo-deep-dive-report.md:777:docs/reports/generated/repo-deep-dive-report.md:569:apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:161:   - นำทางไปที่: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:810:docs/reports/generated/repo-deep-dive-report.md:778:docs/reports/generated/repo-deep-dive-report.md:570:apps/ABTPi18n/docs/integrations/TRADINGVIEW_INTEGRATION.md:353:- Review [API documentation](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:811:docs/reports/generated/repo-deep-dive-report.md:779:docs/reports/generated/repo-deep-dive-report.md:571:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:63:Access the API at: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:812:docs/reports/generated/repo-deep-dive-report.md:780:docs/reports/generated/repo-deep-dive-report.md:572:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:64:API Documentation: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:813:docs/reports/generated/repo-deep-dive-report.md:781:docs/reports/generated/repo-deep-dive-report.md:573:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:312:- Backend API: http://localhost:8000
reports/merge/ztrader/ztrader-keyword-scan.txt:814:docs/reports/generated/repo-deep-dive-report.md:782:docs/reports/generated/repo-deep-dive-report.md:574:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:313:- API Docs: http://localhost:8000/docs
reports/merge/ztrader/ztrader-keyword-scan.txt:815:docs/reports/generated/repo-deep-dive-report.md:783:docs/reports/generated/repo-deep-dive-report.md:575:apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:373:NEXT_PUBLIC_API_URL="http://localhost:8000"
reports/merge/ztrader/ztrader-keyword-scan.txt:816:docs/reports/generated/repo-deep-dive-report.md:784:docs/reports/generated/repo-deep-dive-report.md:576:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:533:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:817:docs/reports/generated/repo-deep-dive-report.md:785:docs/reports/generated/repo-deep-dive-report.md:577:apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:534:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:818:docs/reports/generated/repo-deep-dive-report.md:786:docs/reports/generated/repo-deep-dive-report.md:578:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:974:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:819:docs/reports/generated/repo-deep-dive-report.md:787:docs/reports/generated/repo-deep-dive-report.md:579:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:975:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
reports/merge/ztrader/ztrader-keyword-scan.txt:820:docs/reports/generated/repo-deep-dive-report.md:788:docs/reports/generated/repo-deep-dive-report.md:580:apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:976:- **Metrics**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:821:docs/reports/generated/repo-deep-dive-report.md:789:docs/reports/generated/repo-deep-dive-report.md:581:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:218:- **Backend API**: [http://localhost:8000](http://localhost:8000)
reports/merge/ztrader/ztrader-keyword-scan.txt:822:docs/reports/generated/repo-deep-dive-report.md:790:docs/reports/generated/repo-deep-dive-report.md:582:apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:222:- **Metrics Endpoint**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
reports/merge/ztrader/ztrader-keyword-scan.txt:823:docs/reports/generated/repo-deep-dive-report.md:791:docs/reports/generated/repo-deep-dive-report.md:583:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:53:    "http://localhost:8000/payment/promptpay/create",
reports/merge/ztrader/ztrader-keyword-scan.txt:824:docs/reports/generated/repo-deep-dive-report.md:792:docs/reports/generated/repo-deep-dive-report.md:584:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:106:curl -X GET http://localhost:8000/rental/contract \
reports/merge/ztrader/ztrader-keyword-scan.txt:825:docs/reports/generated/repo-deep-dive-report.md:793:docs/reports/generated/repo-deep-dive-report.md:585:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:241:    "http://localhost:8000/plugins/install",
reports/merge/ztrader/ztrader-keyword-scan.txt:826:docs/reports/generated/repo-deep-dive-report.md:794:docs/reports/generated/repo-deep-dive-report.md:586:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:289:    "http://localhost:8000/portfolio/accounts",
reports/merge/ztrader/ztrader-keyword-scan.txt:827:docs/reports/generated/repo-deep-dive-report.md:795:docs/reports/generated/repo-deep-dive-report.md:587:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:328:    "http://localhost:8000/portfolio/summary",
reports/merge/ztrader/ztrader-keyword-scan.txt:828:docs/reports/generated/repo-deep-dive-report.md:796:docs/reports/generated/repo-deep-dive-report.md:588:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:367:    "http://localhost:8000/backtest/run",
reports/merge/ztrader/ztrader-keyword-scan.txt:829:docs/reports/generated/repo-deep-dive-report.md:797:docs/reports/generated/repo-deep-dive-report.md:589:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:393:    f"http://localhost:8000/backtest/runs/{backtest_id}",
reports/merge/ztrader/ztrader-keyword-scan.txt:830:docs/reports/generated/repo-deep-dive-report.md:798:docs/reports/generated/repo-deep-dive-report.md:590:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:449:    "http://localhost:8000/backtest/paper/start",
reports/merge/ztrader/ztrader-keyword-scan.txt:831:docs/reports/generated/repo-deep-dive-report.md:799:docs/reports/generated/repo-deep-dive-report.md:591:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:477:    "http://localhost:8000/backtest/paper/stop",
reports/merge/ztrader/ztrader-keyword-scan.txt:832:docs/reports/generated/repo-deep-dive-report.md:800:docs/reports/generated/repo-deep-dive-report.md:592:apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:721:curl -X POST http://localhost:8000/payment/webhook/promptpay \
reports/merge/ztrader/ztrader-keyword-scan.txt:833:docs/reports/generated/repo-deep-dive-report.md:801:docs/reports/generated/repo-deep-dive-report.md:593:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:37:curl -X GET "http://localhost:8000/audit/logs?userId=1&action=CREATE&startDate=2025-11-01T00:00:00Z"
reports/merge/ztrader/ztrader-keyword-scan.txt:834:docs/reports/generated/repo-deep-dive-report.md:802:docs/reports/generated/repo-deep-dive-report.md:594:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:70:curl -X GET "http://localhost:8000/audit/logs/1"
reports/merge/ztrader/ztrader-keyword-scan.txt:835:docs/reports/generated/repo-deep-dive-report.md:803:docs/reports/generated/repo-deep-dive-report.md:595:apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:86:curl -X GET "http://localhost:8000/audit/export?format=csv&startDate=2025-11-01T00:00:00Z" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:836:docs/reports/generated/repo-deep-dive-report.md:804:docs/reports/generated/repo-deep-dive-report.md:596:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:429:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:837:docs/reports/generated/repo-deep-dive-report.md:805:docs/reports/generated/repo-deep-dive-report.md:597:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:430:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:838:docs/reports/generated/repo-deep-dive-report.md:806:docs/reports/generated/repo-deep-dive-report.md:598:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:433:curl http://localhost:8000/audit/logs
reports/merge/ztrader/ztrader-keyword-scan.txt:839:docs/reports/generated/repo-deep-dive-report.md:807:docs/reports/generated/repo-deep-dive-report.md:599:apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:436:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:840:docs/reports/generated/repo-deep-dive-report.md:808:docs/reports/generated/repo-deep-dive-report.md:600:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:110:curl http://localhost:8000/health
reports/merge/ztrader/ztrader-keyword-scan.txt:841:docs/reports/generated/repo-deep-dive-report.md:809:docs/reports/generated/repo-deep-dive-report.md:601:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:114:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:842:docs/reports/generated/repo-deep-dive-report.md:810:docs/reports/generated/repo-deep-dive-report.md:602:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:118:curl http://localhost:8000/health/database
reports/merge/ztrader/ztrader-keyword-scan.txt:843:docs/reports/generated/repo-deep-dive-report.md:811:docs/reports/generated/repo-deep-dive-report.md:603:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:125:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:844:docs/reports/generated/repo-deep-dive-report.md:812:docs/reports/generated/repo-deep-dive-report.md:604:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:128:curl http://localhost:8000/audit/logs?limit=10
reports/merge/ztrader/ztrader-keyword-scan.txt:845:docs/reports/generated/repo-deep-dive-report.md:813:docs/reports/generated/repo-deep-dive-report.md:605:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:132:curl http://localhost:8000/audit/stats
reports/merge/ztrader/ztrader-keyword-scan.txt:846:docs/reports/generated/repo-deep-dive-report.md:814:docs/reports/generated/repo-deep-dive-report.md:606:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:139:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:847:docs/reports/generated/repo-deep-dive-report.md:815:docs/reports/generated/repo-deep-dive-report.md:607:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:143:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:848:docs/reports/generated/repo-deep-dive-report.md:816:docs/reports/generated/repo-deep-dive-report.md:608:apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:153:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:849:docs/reports/generated/repo-deep-dive-report.md:817:docs/reports/generated/repo-deep-dive-report.md:609:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:16:curl http://localhost:8000/health/detailed
reports/merge/ztrader/ztrader-keyword-scan.txt:850:docs/reports/generated/repo-deep-dive-report.md:818:docs/reports/generated/repo-deep-dive-report.md:610:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:22:curl http://localhost:8000/strategies
reports/merge/ztrader/ztrader-keyword-scan.txt:851:docs/reports/generated/repo-deep-dive-report.md:819:docs/reports/generated/repo-deep-dive-report.md:611:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:25:curl http://localhost:8000/audit/logs?limit=5
reports/merge/ztrader/ztrader-keyword-scan.txt:852:docs/reports/generated/repo-deep-dive-report.md:820:docs/reports/generated/repo-deep-dive-report.md:612:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:30:curl http://localhost:8000/secrets/rotation/schedule
reports/merge/ztrader/ztrader-keyword-scan.txt:853:docs/reports/generated/repo-deep-dive-report.md:821:docs/reports/generated/repo-deep-dive-report.md:613:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:69:curl http://localhost:8000/health/detailed | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:854:docs/reports/generated/repo-deep-dive-report.md:822:docs/reports/generated/repo-deep-dive-report.md:614:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:74:curl "http://localhost:8000/audit/export?format=csv&startDate=$(date -d '7 days ago' -I)" -o audit_logs.csv
reports/merge/ztrader/ztrader-keyword-scan.txt:855:docs/reports/generated/repo-deep-dive-report.md:823:docs/reports/generated/repo-deep-dive-report.md:615:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:79:curl http://localhost:8000/secrets/rotation/due?daysAhead=30 | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:856:docs/reports/generated/repo-deep-dive-report.md:824:docs/reports/generated/repo-deep-dive-report.md:616:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:92:curl -X POST http://localhost:8000/secrets/rotation/rotate \
reports/merge/ztrader/ztrader-keyword-scan.txt:857:docs/reports/generated/repo-deep-dive-report.md:825:docs/reports/generated/repo-deep-dive-report.md:617:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:105:curl "http://localhost:8000/audit/logs?userId=1&action=CREATE"
reports/merge/ztrader/ztrader-keyword-scan.txt:858:docs/reports/generated/repo-deep-dive-report.md:826:docs/reports/generated/repo-deep-dive-report.md:618:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:108:curl "http://localhost:8000/audit/logs" | jq '.logs[] | select(.statusCode >= 500)'
reports/merge/ztrader/ztrader-keyword-scan.txt:859:docs/reports/generated/repo-deep-dive-report.md:827:docs/reports/generated/repo-deep-dive-report.md:619:apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:115:  curl -s http://localhost:8000/health | jq
reports/merge/ztrader/ztrader-keyword-scan.txt:860:docs/reports/generated/repo-deep-dive-report.md:828:docs/reports/generated/repo-deep-dive-report.md:620:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:13:curl -X POST http://localhost:8000/ml/signal/score \
reports/merge/ztrader/ztrader-keyword-scan.txt:861:docs/reports/generated/repo-deep-dive-report.md:829:docs/reports/generated/repo-deep-dive-report.md:621:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:51:curl -X POST http://localhost:8000/ml/volatility/predict \
reports/merge/ztrader/ztrader-keyword-scan.txt:862:docs/reports/generated/repo-deep-dive-report.md:830:docs/reports/generated/repo-deep-dive-report.md:622:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:81:curl -X POST http://localhost:8000/ml/tune/start \
reports/merge/ztrader/ztrader-keyword-scan.txt:863:docs/reports/generated/repo-deep-dive-report.md:831:docs/reports/generated/repo-deep-dive-report.md:623:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:109:curl http://localhost:8000/ml/tune/status/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:864:docs/reports/generated/repo-deep-dive-report.md:832:docs/reports/generated/repo-deep-dive-report.md:624:apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:114:curl http://localhost:8000/ml/tune/results/tune_abc123
reports/merge/ztrader/ztrader-keyword-scan.txt:865:docs/reports/generated/repo-deep-dive-report.md:833:docs/reports/generated/repo-deep-dive-report.md:625:apps/ABTPi18n/install.sh:57:echo "Backend:  http://localhost:8000/docs"
reports/merge/ztrader/ztrader-keyword-scan.txt:866:docs/reports/generated/repo-deep-dive-report.md:834:docs/reports/generated/repo-deep-dive-report.md:626:apps/ABTPi18n/verify.sh:112:echo "  3. Access Backend API docs: http://localhost:8000/docs"
reports/platform/apps-stack-inventory.json:2011:          "zdash-api.zeaz.dev": [
reports/platform/apps-stack-inventory.md:19:| zsp-aitool | `docker, node, npm` | 1 | `3000, 3001, 5173, 5174, 5175, 5432, 8005` | `api-zdash.zeaz.dev, api-zveo.zeaz.dev, app.zeaz.dev, release.zeaz.dev, studio.zeaz.dev, tunnel.zeaz.dev, www.zeaz.dev, zaiz.zeaz.dev, zdash-api.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` |
reports/platform/apps-stack-inventory.md:391:- `zdash-api.zeaz.dev` from `apps/zsp-aitool/docs/runbooks/PLUGIN_REPO_OPERATIONS.md, apps/zsp-aitool/scripts/plugins/plugin-validate.sh`
scripts/cloudflare/zdash-terraform-env-guard.sh:8:if grep -RIn "REPLACE_WITH_ZEAZ_DEV_ZONE_ID\|REPLACE_WITH_TUNNEL_UUID\|REPLACE_WITH_REAL_ZONE_ID\|REPLACE_WITH_REAL_TUNNEL_UUID" \
scripts/platform/fix-apps-source-review-critical.sh:65:        new_text = new_text.replace("zdash-api.zeaz.dev", "api-zdash.zeaz.dev")
scripts/platform/review-apps-source.py:89:    "zdash-api.zeaz.dev": "api-zdash.zeaz.dev",
scripts/repo/deep-dive-report.sh:62:  git grep -nE 'zdash-api\.zeaz\.dev|/opt/zdash|localhost:8000|REPLACE_WITH_ZEAZ_DEV_ZONE_ID|REPLACE_WITH_TUNNEL_UUID' -- . 2>/dev/null | redact || true
scripts/validate_cognitive_fabric.sh:16:if curl -s http://localhost:8000/api/runtime/llm/health | grep -q "vertex-ai"; then
scripts/validate_cognitive_fabric.sh:25:RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/llm/completion \
scripts/validate_cognitive_fabric.sh:38:if curl -s http://localhost:8000/api/runtime/llm/metrics | grep -q "val-test"; then
scripts/validate_cognitive_fabric.sh:47:if curl -s http://localhost:8000/api/runtime/llm/health | grep -q "\"state\": \"HEALTHY\""; then
scripts/validate_scheduler.sh:8:if curl -s http://localhost:8000/api/runtime/scheduler/topology/health | grep -q "{}"; then
scripts/validate_scheduler.sh:17:TASK_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/scheduler/tasks \
scripts/validate_scheduler.sh:33:LINEAGE=$(curl -s http://localhost:8000/api/runtime/scheduler/tasks/$TASK_ID/lineage)
scripts/validate_scheduler.sh:44:UPDATE_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/scheduler/topology/snapshot \
scripts/validate_swarm.sh:8:if curl -s http://localhost:8000/api/runtime/swarm/agents | grep -q "\["; then
scripts/validate_swarm.sh:17:AGENT_COUNT=$(curl -s http://localhost:8000/api/runtime/swarm/agents | jq '. | length')
scripts/validate_swarm.sh:27:SUBMIT_RESPONSE=$(curl -s -X POST http://localhost:8000/api/runtime/swarm/marketplace \
scripts/validation.sh:21:HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/health || echo "000")
scripts/validation.sh:45:TASK_RES=$(curl -s -X POST http://localhost:8000/execute \
terraform/cloudflare-apps/variables.tf:6:    condition     = length(var.cloudflare_zone_id) == 32 && var.cloudflare_zone_id != "REPLACE_WITH_ZEAZ_DEV_ZONE_ID"
terraform/cloudflare-apps/variables.tf:16:    condition     = can(regex("^[0-9a-fA-F-]{36}$", var.cloudflare_tunnel_id)) && var.cloudflare_tunnel_id != "REPLACE_WITH_TUNNEL_UUID"
```

## Forbidden tracked runtime files

```text
```

## Docker compose inventory

```text
./.ops/backups/ABTPi18n/docker-compose.yml
./.ops/backups/zLinebot-20260609/docker-compose.blue.yml
./.ops/backups/zLinebot-20260609/docker-compose.green.yml
./.ops/backups/zLinebot-20260609/docker-compose.yml
./.ops/backups/zcino-20260609/docker-compose.yml
./.ops/backups/zcino-20260609/infra/docker-compose.yml
./.ops/backups/zcino-20260609/infra/zeaz-testnet/docker-compose.yml
./.ops/backups/zkbtrader/docker-compose.yml
./apps/zeaz-api/docker-compose.yml
./apps/openwork/.devcontainer/docker-compose.yml
./apps/openwork/packaging/docker/docker-compose.den-dev.yml
./apps/openwork/packaging/docker/docker-compose.dev.yml
./apps/openwork/packaging/docker/docker-compose.web-local.yml
./apps/openwork/packaging/docker/docker-compose.yml
./apps/openwork/zeaz/installer/docker-compose.yml
./apps/zLinebot/docker-compose.blue.yml
./apps/zLinebot/docker-compose.green.yml
./apps/zLinebot/docker-compose.yml
./apps/zLinebot/infra/docker-compose.yml
./apps/zcfdash/docker-compose.yml
./apps/zcino/docker-compose.yml
./apps/zcino/infra/docker-compose.yml
./apps/zcino/infra/zeaz-testnet/docker-compose.yml
./apps/zdash/docker-compose.prod.secrets.yml
./apps/zdash/docker-compose.prod.yml
./apps/zdash/docker-compose.yml
./apps/zlms/docker-compose.yml
./apps/zoffice/docker-compose.yml
./apps/zsp-aitool/docker-compose.yml
./apps/zsticker/docker-compose.yml
./apps/ztrader/docker-compose.yml
./apps/zveo/docker-compose.yml
./apps/zveo/infra/docker/docker-compose.yml
./apps/zveo/infra/observability/docker-compose.observability.yml
./apps/zwallet/docker-compose.yml
./apps/zwallet/infra/docker/docker-compose.devops.yml
./apps/zwallet/infra/docker/docker-compose.prod.yml
./apps/zwallet/infra/observability/docker-compose.siem.yml
./apps/zwallet/infra/redis/docker-compose.yml
./docker-compose.yml
./infra/authentik/docker-compose.yml
./installer/compose/ai/docker-compose.yml
./installer/compose/core/docker-compose.yml
./installer/compose/monitoring/docker-compose.yml
./monitoring/docker-compose.yml
./runtime/authentik/compose.yml
./tunnels/docker/docker-compose.yml
```

## Workflow inventory

```text
.github/workflows/backup-validation.yml
.github/workflows/ci.yml
.github/workflows/cloudflare-break-glass-governance.yml
.github/workflows/cloudflare-manual-release-approval.yml
.github/workflows/cloudflare-pr-gates.yml
.github/workflows/cloudflare-release-readiness.yml
.github/workflows/cloudflare-runtime-baseline.yml
.github/workflows/cloudflared-restart.yml
.github/workflows/codeql.yml
.github/workflows/cosign-signing.yml
.github/workflows/deploy-worker.yml
.github/workflows/deploy-zdash-pages.yml
.github/workflows/dr-test.yml
.github/workflows/drift-detect.yml
.github/workflows/ecc-integration-check.yml
.github/workflows/meta-os-ci.yml
.github/workflows/oss-readiness.yml
.github/workflows/phase52-zeaz-dev.yml
.github/workflows/policy-test.yml
.github/workflows/project-upgrade-report.yml
.github/workflows/rotate-secrets.yml
.github/workflows/sbom.yml
.github/workflows/secret-scanning.yml
.github/workflows/security-scan.yml
.github/workflows/terraform-apply.yml
.github/workflows/terraform-plan.yml
.github/workflows/terraform-validate.yml
.github/workflows/tunnel-validation.yml
.github/workflows/validate.yml
.github/workflows/waf-validation.yml
.github/workflows/zdash-monorepo.yml
```
