# zeaz-platform repository deep-dive report

Generated: 2026-06-07T02:06:16Z

## Git

```text
## main...origin/main
 M docs/reports/generated/repo-deep-dive-report.md
?? apps/openwork/.npmrc
?? apps/web/.npmrc
?? apps/web/pnpm-lock.yaml
?? apps/web/pnpm-workspace.yaml
?? apps/web/public/index.html
?? apps/web/src/app/loading.tsx
?? apps/web/src/app/reports/
?? apps/zcino/.dockerignore
?? apps/zcino/.github/
?? apps/zcino/.gitkeep
?? apps/zcino/Dockerfile
?? apps/zcino/Dockerfile.zeaznode
?? apps/zcino/README.infra.md
?? apps/zcino/README.md
?? apps/zcino/cmd/
?? apps/zcino/docs/
?? apps/zcino/frontend/
?? apps/zcino/go.mod
?? apps/zcino/go.sum
?? apps/zcino/infra/
?? apps/zcino/internal/
?? apps/zcino/k8s/
?? apps/zcino/legacy_api.go
?? apps/zcino/main.go
?? apps/zcino/migrations/
?? apps/zcino/policies/
?? apps/zcino/protocol/
?? apps/zcino/release/
?? apps/zcino/sdk/
?? apps/zlms-prod/app/phpMyAdmin/composer.phar
?? apps/zlms-prod/app/phpMyAdmin/vendor/composer/InstalledVersions.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/composer/installed.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/BACKERS.md
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/SECURITY.md
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/Blowfish.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/DES.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/Hash.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/RC2.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/RC4.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/RSA.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/TripleDES.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Crypt/Twofish.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/File/
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Math/
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/Net/
?? apps/zlms-prod/app/phpMyAdmin/vendor/phpseclib/phpseclib/phpseclib/System/
?? apps/zlms-prod/app/phpMyAdmin/vendor/symfony/polyfill-ctype/bootstrap80.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/extensions/.gitignore
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/extensions/doc/
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/extensions/test/
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/.gitattributes
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/.github/
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/.gitignore
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/.php-cs-fixer.dist.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/src/Node/CheckSecurityCallNode.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/src/Node/CheckToStringNode.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/src/Node/Expression/ArrowFunctionExpression.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/src/Node/Expression/InlinePrint.php
?? apps/zlms-prod/app/phpMyAdmin/vendor/twig/twig/src/TokenParser/ApplyTokenParser.php
?? apps/zoffice/fixer.py
?? apps/zsp-aitool/
?? apps/ztrader/frontend/.dockerignore
?? apps/zveo/
?? ecosystem.config.cjs
?? project_tree.txt
?? terraform/.terraform.lock.hcl
```

## Top-level layout

```text
.
./.agent
./.agent/.agents
./.agent/rules
./.agents
./agents
./.agents/agents
./.agent/skills
./.agents/skills
./.agent/workflows
./apps
./apps/ABTPi18n
./apps/api
./apps/openwork
./apps/web
./apps/zAcademy
./apps/zcino
./apps/zcino-modern
./apps/zdash
./apps/zkbtrader
./apps/zLinebot
./apps/zlms-prod
./apps/zoffice
./apps/zsp-aitool
./apps/zsticker
./apps/ztrader
./apps/zveo
./apps/zwallet
./.backup
./.backups
./backups
./.backups/apps-adopt
./.backups/makefile
./.backup/terraform-broken-20260516T094429Z
./.backup/terraform-broken-20260516T094433Z
./.benchmarks
./bootstrap
./.cache
./.cache/cloudflare-docs
./.cache/cloudflare-permissions
./.cache/ecc
./.cache/free-claude-code
./.claude
./.claude/.agents
./.claude/agents
./.claude/commands
./.claude/ecc
./.claude/homunculus
./.claude/hooks
./.claude/mcp-configs
./.claude/rules
./.claude/scripts
./.claude/skills
./.cloudflare-backups
./.codex
./.codex/agents
./compose
./configs
./configs/cloudflare
./configs/platform
./configs/repos
./controllers
./.cursor
./.cursor/.agents
./.cursor/agents
./.cursor/commands
./.cursor/hooks
./.cursor/mcp-configs
./.cursor/rules
./.cursor/scripts
./.cursor/skills
./dns
./docs
./docs/ai
./docs/architecture
./docs/audit
./docs/cloudflare
./docs/integrations
./docs/prompt
./docs/prompts
./docs/releases
./docs/reports
./docs/runbooks
./docs/security
./docs/zdash
./.gemini
./generated
./generated/cloudflare
./generated/integration
./.github
./.github/ISSUE_TEMPLATE
./.github/workflows
./infra
./infra/ai-runtime
./infra/authentik
./infra/cloudflare
./infra/eventbus
./infra/observability
./infra/security
./infra/shre
./infra/traefik
./make
./monitoring
./monitoring/alertmanager
./monitoring/grafana
./monitoring/loki
./monitoring/otel
./monitoring/prometheus
./opentofu
./opentofu/backend
./opentofu/environments
./opentofu/modules
./ops
./ops/bin
./ops/scripts
./policies
./.pytest_cache
./.pytest_cache/v
./python
./python/__pycache__
./reports
./reports/cvsz-apps-merge
./reports/platform
./.runtime
./runtime
./runtime/authentik
./runtime/governance
./runtime/llm
./.runtime/logs
./runtime/platform_memory
./runtime/scheduler
./runtime/streaming
./runtime/swarm
./runtime/telemetry
./runtime/trading
./scripts
./scripts/ai
./scripts/apps
./scripts/ci
./scripts/cloudflare
./scripts/environments
./scripts/fixers
./scripts/lib
./scripts/make
./scripts/platform
./scripts/release
./scripts/repo
./scripts/supabase
./scripts/terraform
./scripts/zdash
./scripts/zveo
./scripts/zwallet
./secrets
./security
./src
./terraform
./terraform/cloudflare
./terraform/cloudflare-apps
./terraform/environments
./terraform/.terraform
./terraform/zdash
./tests
./tests/__pycache__
./tests/workers
./tunnels
./tunnels/cloudflared
./tunnels/config
./tunnels/docker
./tunnels/k8s
./tunnels/systemd
./ui
./ui/design-system
./.venv
./.venv/bin
./.venv/include
./.venv/lib
./waf
./workers
./workers-ai
./workers/edge-gateway
./workers/shared
./workers/src
./workers/zeaz-loading
./zero-trust
```

## Makefile audit

```text
Makefile audit
- file: Makefile
- targets: 167
- duplicate targets: 0
- issues: 0
- warnings: 0
PASS: Makefile audit clean
```

## Make targets

```text
35:.PHONY: help bootstrap cloudflare-stability-check setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars
36:.PHONY: refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context supabase-ai-tools supabase-docs-context supabase-mcp-check
37:.PHONY: supabase-mcp-config upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict
38:.PHONY: env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint
39:.PHONY: shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan secret-scan-history
40:.PHONY: tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan
41:.PHONY: tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan
42:.PHONY: tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-clean-delete token-clean-all
43:.PHONY: token-clean-all-delete token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom
44:.PHONY: cosign-sign doctor clean zdash-origin-check zdash-tunnel-config zdash-edge-readiness zdash-go-live-evidence zdash-public-release-evidence
45:.PHONY: phase50-validate zdash-install zdash-validate-fast zdash-backend-test zdash-frontend-test zdash-build zdash-server-start zdash-server-stop
46:.PHONY: zdash-server-restart zdash-server-status zdash-validate zdash-release-evidence zdash-phase48-validate zdash-cloudflare-handoff phase51-validate zeaz-dev-plan
47:.PHONY: zeaz-dev-apply zeaz-dev-rollback-plan zeaz-dev-verify-live zeaz-dev-public-evidence phase52-validate workflow-policy workflow-validate gitops-validate
48:.PHONY: git-status gpg-commit gpg-push gpg-finalize git-finalize zaiz-validate zaiz-prod zaiz-fix-google-genai
49:.PHONY: zaiz-deps-check
51:help:
54:bootstrap:
57:setup: setup-free
59:setup-free:
62:setup-legacy:
65:generate-env-all:
68:refactor-cloudflare-vars-dry:
71:refactor-cloudflare-vars:
74:check-no-cf-vars:
77:docs-context:
80:supabase-docs-context:
83:supabase-mcp-check:
86:supabase-mcp-config:
89:supabase-ai-tools: supabase-docs-context supabase-mcp-check
92:upgrade-report:
95:env: load-env
97:load-env:
100:ci: validate
102:validate-agent: ci-validate
104:ci-validate: test env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
107:validate: test validate-env env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
110:validate-env:
113:validate-env-strict:
116:env-format-validate:
119:env-format-validate-local:
122:env-normalize-local:
126:maintenance:
129:test:
132:fmt: tf-fmt
134:fmt-check: tf-fmt-check
136:lint:
139:shellcheck:
142:yaml-validate:
145:tf-init:
148:tf-fmt:
151:tf-fmt-check:
154:tf-validate: tf-init
157:tf-plan: tf-init
160:tf-plan-out: tf-init
164:tf-apply tf-apply-plan tf-destroy tf-state-rm-waf:
167:tf-env-init:
171:tf-env-validate: tf-env-init
174:tf-env-plan: tf-env-init
177:tofu-init:
180:tofu-validate: tofu-init
183:tofu-plan: tofu-init
186:drift: drift-detect
188:drift-detect: tf-init
191:token-clean:
194:token-clean-delete:
198:token-clean-all:
201:token-clean-all-delete:
205:token-verify:
208:token-verify-strict:
211:token-rotate-dry:
214:token-rotate:
219:token-rotate-refresh: token-rotate-dry
221:secret-scan:
224:secret-scan-history:
227:security-scan:
230:sbom:
233:cosign-sign:
236:policy-test: workflow-policy
239:sbom-generation: sbom
240:sbom-validate: sbom
241:security-validate: security-scan
242:waf-validate: waf-validation
244:waf-validation:
247:tunnel-validation:
250:workflow-policy:
253:workflow-validate: workflow-policy
256:gitops-validate: workflow-validate drift-detect
259:git-status:
262:gpg-commit:
269:gpg-push:
272:gpg-finalize: validate
278:git-finalize: gpg-finalize
280:zaiz-validate: validate
282:zaiz-prod:
285:zaiz-fix-google-genai:
288:zaiz-deps-check:
295:doctor:
301:clean:
309:.PHONY: zdash-origin-check
310:zdash-origin-check: ## Verify zDash origin configuration
313:.PHONY: zdash-tunnel-config
314:zdash-tunnel-config: ## Verify zDash tunnel configuration
317:.PHONY: zdash-edge-readiness
318:zdash-edge-readiness: ## Verify zDash edge readiness
321:.PHONY: zdash-go-live-evidence
322:zdash-go-live-evidence: ## Collect zDash go-live evidence
325:.PHONY: zdash-public-release-evidence
326:zdash-public-release-evidence: ## Collect zDash public release evidence
329:.PHONY: phase50-validate
330:phase50-validate: ## Validate Phase 50 zDash integration
337:.PHONY: zdash-install
338:zdash-install: ## Install zDash dependencies (apps/zdash)
342:.PHONY: zdash-validate-fast
343:zdash-validate-fast: ## Run zDash validate-fast with dependency bootstrap
346:.PHONY: zdash-backend-test
347:zdash-backend-test: ## Run zDash backend tests (apps/zdash)
351:.PHONY: zdash-frontend-test
352:zdash-frontend-test: ## Run zDash frontend tests (apps/zdash)
356:.PHONY: zdash-build
357:zdash-build: ## Build zDash frontend production bundle (apps/zdash)
361:.PHONY: zdash-server-start
362:zdash-server-start: ## Start zDash backend + frontend servers (apps/zdash)
366:.PHONY: zdash-server-stop
367:zdash-server-stop: ## Stop zDash servers (apps/zdash)
371:.PHONY: zdash-server-restart
372:zdash-server-restart: ## Restart zDash servers (apps/zdash)
376:.PHONY: zdash-server-status
377:zdash-server-status: ## Show zDash server status (apps/zdash)
381:.PHONY: zdash-validate
382:zdash-validate: ## Run full zDash validation (apps/zdash)
386:.PHONY: zdash-release-evidence
387:zdash-release-evidence: ## Collect zDash release evidence (apps/zdash)
391:.PHONY: zdash-phase48-validate
392:zdash-phase48-validate: ## Run zDash Phase 48 validation (apps/zdash)
396:.PHONY: zdash-cloudflare-handoff
397:zdash-cloudflare-handoff: ## Run zDash Cloudflare handoff checks
406:.PHONY: phase51-validate
407:phase51-validate: ## Validate Phase 51 zDash monorepo import
468:.PHONY: zeaz-dev-plan
469:zeaz-dev-plan: ## Print the zeaz.dev production route plan
472:.PHONY: zeaz-dev-apply
473:zeaz-dev-apply: ## Run controlled zeaz.dev apply checks
476:.PHONY: zeaz-dev-rollback-plan
477:zeaz-dev-rollback-plan: ## Generate zeaz.dev rollback plan
480:.PHONY: zeaz-dev-verify-live
481:zeaz-dev-verify-live: ## Verify live zeaz.dev public URLs
484:.PHONY: zeaz-dev-public-evidence
485:zeaz-dev-public-evidence: ## Generate zeaz.dev public release evidence
488:.PHONY: phase52-validate
489:phase52-validate: ## Validate Phase 52 zeaz.dev production routing update
522:cloudflare-stability-check: ## Run full Cloudflare stability checks
534:.PHONY: authentik-env authentik-install authentik-pull authentik-up authentik-start authentik-down authentik-stop authentik-restart authentik-status authentik-logs authentik-update authentik-open
536:authentik-env:
551:authentik-install: authentik-env
557:authentik-pull:
560:authentik-up authentik-start:
564:authentik-down authentik-stop:
567:authentik-restart:
570:authentik-status:
573:authentik-logs:
576:authentik-update: authentik-env
581:authentik-open:
588:.PHONY: zdash-terraform-integrate
589:zdash-terraform-integrate: ## Generate zDash Terraform source files
592:.PHONY: cf-zdash-preflight
593:cf-zdash-preflight: ## Resolve Cloudflare zone/tunnel/DNS IDs for zDash
596:.PHONY: cf-zdash-import-existing
597:cf-zdash-import-existing: ## Import existing zDash DNS records into Terraform state
600:.PHONY: tf-zdash-init
601:tf-zdash-init: ## Init zDash Cloudflare Terraform
604:.PHONY: tf-zdash-fmt
605:tf-zdash-fmt: ## Format zDash Cloudflare Terraform
608:.PHONY: tf-zdash-fmt-check
609:tf-zdash-fmt-check: ## Check zDash Cloudflare Terraform formatting
612:.PHONY: tf-zdash-validate
613:tf-zdash-validate: tf-zdash-init ## Validate zDash Cloudflare Terraform
616:.PHONY: tf-zdash-plan
617:tf-zdash-plan: tf-zdash-init ## Plan zDash Cloudflare Terraform
620:.PHONY: tf-zdash-plan-out
621:tf-zdash-plan-out: tf-zdash-init ## Save zDash Cloudflare Terraform plan
625:.PHONY: tf-zdash-apply
626:tf-zdash-apply: ## Guarded zDash Terraform apply
633:.PHONY: cf-zdash-token-diagnose
634:cf-zdash-token-diagnose: ## Diagnose Cloudflare token permissions for zDash
637:.PHONY: cf-zdash-sync-env
638:cf-zdash-sync-env: ## Sync zDash Terraform env vars from Cloudflare API into .env/.env.cloudflare
645:.PHONY: repo-deep-dive makefile-audit makefile-refactor
646:repo-deep-dive: ## Generate full repository deep-dive report
649:makefile-audit: ## Audit root Makefile for duplicate targets and risky patterns
652:makefile-refactor: ## Re-run safe root Makefile cleanup
660:.PHONY: apps-deep-dive apps-inventory
661:apps-deep-dive: ## Deep-dive local apps under apps/*
664:apps-inventory: apps-deep-dive ## Alias for local apps inventory
666:.PHONY: apps-inventory-validate
667:apps-inventory-validate: apps-deep-dive ## Validate generated apps inventory
674:.PHONY: critical-apps-deep-dive cvsz-apps-merge-plan cvsz-apps-merge-apply cvsz-apps-merge-validate phase58-validate
675:critical-apps-deep-dive: ## Deep-dive apps/ABTPi18n and apps/zkbtrader
678:cvsz-apps-merge-plan: ## Plan adoption of apps/* from cvsz/*
681:cvsz-apps-merge-apply: ## Adopt local apps/* into zeaz-platform; guarded
684:cvsz-apps-merge-validate: ## Validate apps/* merge/adoption hygiene
687:phase58-validate: ## Validate Phase 58 app merge system
696:.PHONY: apps-routing-generate apps-routing-report tf-cloudflare-apps-init tf-cloudflare-apps-fmt tf-cloudflare-apps-validate tf-cloudflare-apps-plan phase59-validate
697:apps-routing-generate: ## Generate apps routing report and Terraform app route vars
700:apps-routing-report: apps-routing-generate ## Print apps routing report
703:phase59-validate: apps-routing-generate tf-cloudflare-apps-fmt tf-cloudflare-apps-validate
710:.PHONY: apps-stack-deep-dive apps-port-refactor-generate apps-port-refactor-report apps-port-origin-check tf-cloudflare-apps-init tf-cloudflare-apps-fmt tf-cloudflare-apps-validate tf-cloudflare-apps-plan phase60-validate
711:apps-stack-deep-dive: ## Deep-dive all stacks under apps/*
714:apps-port-refactor-generate: ## Generate canonical app port/Terraform/tunnel assets
717:apps-port-refactor-report: apps-stack-deep-dive apps-port-refactor-generate ## Print app stack and port plan
720:apps-port-origin-check: apps-port-refactor-generate ## Check active local origins
723:tf-cloudflare-apps-init: ## Init Cloudflare apps Terraform
726:tf-cloudflare-apps-fmt: ## Format Cloudflare apps Terraform
729:tf-cloudflare-apps-validate: apps-port-refactor-generate tf-cloudflare-apps-init ## Validate Cloudflare apps Terraform
732:tf-cloudflare-apps-plan: apps-port-refactor-generate tf-cloudflare-apps-init ## Plan Cloudflare apps Terraform
736:phase60-validate: apps-stack-deep-dive apps-port-refactor-generate tf-cloudflare-apps-fmt tf-cloudflare-apps-validate
743:.PHONY: build-all-stacks build-all-stacks-full go-live-preflight go-live-report
744:build-all-stacks: ## Build/check all apps/* stacks without install or docker build
747:build-all-stacks-full: ## Build/check all apps/* stacks with installs and docker build
750:go-live-preflight: ## Run go-live readiness checks without deploy/apply
753:go-live-report: build-all-stacks go-live-preflight ## Generate full go-live reports
763:.PHONY: apps-source-review apps-source-review-strict apps-source-review-report
764:apps-source-review: ## Review source-owned files under apps/* before build/go-live
767:apps-source-review-strict: ## Review apps/* and fail on critical findings
770:apps-source-review-report: apps-source-review ## Print apps source review report
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
configs/cloudflare/zdash/zdash-access-policy.example.json
configs/cloudflare/zdash/zdash-dns-intent.example.json
configs/cloudflare/zdash/zdash.edge.routes.example.json
configs/cloudflare/zdash/zdash.production.routes.example.json
configs/cloudflare/zeaz-dev/zeaz-dev-route-intent.example.json
generated/cloudflare/zdash-production-tunnel-ingress.yml
generated/cloudflare/zdash-tunnel-ingress.yml
scripts/cloudflare/apply-account-token-endpoint-patch.sh
scripts/cloudflare/apply-zero-global-key-patch.sh
scripts/cloudflare/clean-and-regenerate-tokens.sh
scripts/cloudflare/clean-env-empty-values.sh
scripts/cloudflare/cloudflare-api-lib.sh
scripts/cloudflare/cloudflare-stability-check.sh
scripts/cloudflare/discover-permission-groups.sh
scripts/cloudflare/export-tf-vars.sh
scripts/cloudflare/fetch-cloudflare-llms-context.sh
scripts/cloudflare/generate-tokens.sh
scripts/cloudflare/gen-token.sh
scripts/cloudflare/install-zeaz-loading-local.sh
scripts/cloudflare/install-zero-key-system.sh
scripts/cloudflare/lib/env-scope.sh
scripts/cloudflare/list-permission-groups.sh
scripts/cloudflare/load-env.sh
scripts/cloudflare/master-gen-tokens.sh
scripts/cloudflare/permissions.sh
scripts/cloudflare/repair-cloudflared-service.sh
scripts/cloudflare/rotate-tokens.sh
scripts/cloudflare/rotate-tokens-with-permission-preflight.sh
scripts/cloudflare/run-token-rotation.sh
scripts/cloudflare/select-zone.sh
scripts/cloudflare/sync-cloudflare-env-files.sh
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
terraform/cloudflare-apps/apps.auto.tfvars.json
terraform/cloudflare-apps/main.tf
terraform/cloudflare-apps/README.md
terraform/cloudflare-apps/.terraform.lock.hcl
terraform/cloudflare-apps/variables.tf
terraform/cloudflare-apps/versions.tf
terraform/cloudflare/dns.tf
terraform/cloudflare/main.tf
terraform/cloudflare/terraform.tfstate
terraform/environments/dev/main.tf
terraform/environments/prod/main.tf
terraform/environments/staging/main.tf
terraform/main.tf
terraform/providers.tf
terraform/.terraform.lock.hcl
terraform/terraform.tfstate
terraform/tfplan.drift
terraform/variables.tf
terraform/versions.tf
terraform/zdash/main.tf
terraform/zdash/outputs.tf
terraform/zdash/README.md
terraform/zdash/terraform.tfstate
terraform/zdash/terraform.tfstate.backup
terraform/zdash/.terraform.tfstate.lock.info
terraform/zdash/terraform.tfvars.example
terraform/zdash/variables.tf
terraform/zdash/versions.tf
terraform/zdash/zdash-cloudflare.tfplan
terraform/zdash/zdash_edge.auto.tfvars.example
terraform/zeaz.tfplan
```

## Stale references

```text
README.md:53:                         │  ├── zdash-api.zeaz.dev    (zDash API)      │
README.md:343:- `zdash-api.zeaz.dev` for the zDash backend API
apps/ABTPi18n/.env.example:23:NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
apps/ABTPi18n/.env.example:78:API_BASE_URL=http://localhost:8000
apps/ABTPi18n/Grok.md:1793:  CMD python -c "import requests; requests.get('http://localhost:8000/health')"
apps/ABTPi18n/Grok.md:1994:  metrics)   curl http://localhost:8000/metrics | grep omega_ ;;
apps/ABTPi18n/Grok.md:1995:  health)    docker-compose exec omega-bot curl http://localhost:8000/health ;;
apps/ABTPi18n/README.md:125:   - Backend API: http://localhost:8000/docs
apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py:252:    base_url = os.getenv("API_BASE_URL", "http://localhost:8000")
apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:25:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/dashboard/pnl`)
apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:53:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/strategies`)
apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:71:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/start`, {
apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx:80:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/bot/stop`, {
apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx:27:    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/exchange/keys`, {
apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx:26:      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx:33:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx:30:  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md:115:  API_BASE_URL=http://localhost:8000
apps/ABTPi18n/docs/enterprise/API_REFERENCE.en.md:9:Development: http://localhost:8000/v1
apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:153:   curl http://localhost:8000/health
apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md:161:   - Navigate to: http://localhost:8000/docs
apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:153:   curl http://localhost:8000/health
apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md:161:   - นำทางไปที่: http://localhost:8000/docs
apps/ABTPi18n/docs/integrations/TRADINGVIEW_INTEGRATION.md:353:- Review [API documentation](http://localhost:8000/docs)
apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:63:Access the API at: http://localhost:8000
apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:64:API Documentation: http://localhost:8000/docs
apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:312:- Backend API: http://localhost:8000
apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:313:- API Docs: http://localhost:8000/docs
apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md:373:NEXT_PUBLIC_API_URL="http://localhost:8000"
apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:533:- **Backend API**: [http://localhost:8000](http://localhost:8000)
apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md:534:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:974:- **Backend API**: [http://localhost:8000](http://localhost:8000)
apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:975:- **API Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md:976:- **Metrics**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:218:- **Backend API**: [http://localhost:8000](http://localhost:8000)
apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md:222:- **Metrics Endpoint**: [http://localhost:8000/metrics](http://localhost:8000/metrics)
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:53:    "http://localhost:8000/payment/promptpay/create",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:106:curl -X GET http://localhost:8000/rental/contract \
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:241:    "http://localhost:8000/plugins/install",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:289:    "http://localhost:8000/portfolio/accounts",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:328:    "http://localhost:8000/portfolio/summary",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:367:    "http://localhost:8000/backtest/run",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:393:    f"http://localhost:8000/backtest/runs/{backtest_id}",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:449:    "http://localhost:8000/backtest/paper/start",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:477:    "http://localhost:8000/backtest/paper/stop",
apps/ABTPi18n/docs/phases/phase4/PHASE4_GUIDE.md:721:curl -X POST http://localhost:8000/payment/webhook/promptpay \
apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:37:curl -X GET "http://localhost:8000/audit/logs?userId=1&action=CREATE&startDate=2025-11-01T00:00:00Z"
apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:70:curl -X GET "http://localhost:8000/audit/logs/1"
apps/ABTPi18n/docs/phases/phase5/PHASE5_GUIDE.md:86:curl -X GET "http://localhost:8000/audit/export?format=csv&startDate=2025-11-01T00:00:00Z" -o audit_logs.csv
apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:429:curl http://localhost:8000/health
apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:430:curl http://localhost:8000/health/detailed
apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:433:curl http://localhost:8000/audit/logs
apps/ABTPi18n/docs/phases/phase5/PHASE5_IMPLEMENTATION_SUMMARY.md:436:curl http://localhost:8000/secrets/rotation/schedule
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:110:curl http://localhost:8000/health
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:114:curl http://localhost:8000/health/detailed
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:118:curl http://localhost:8000/health/database
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:125:curl http://localhost:8000/strategies
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:128:curl http://localhost:8000/audit/logs?limit=10
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:132:curl http://localhost:8000/audit/stats
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:139:curl http://localhost:8000/secrets/rotation/schedule
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:143:curl -X POST http://localhost:8000/secrets/rotation/rotate \
apps/ABTPi18n/docs/phases/phase5/PHASE5_MIGRATION_GUIDE.md:153:curl http://localhost:8000/secrets/rotation/schedule
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:16:curl http://localhost:8000/health/detailed
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:22:curl http://localhost:8000/strategies
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:25:curl http://localhost:8000/audit/logs?limit=5
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:30:curl http://localhost:8000/secrets/rotation/schedule
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:69:curl http://localhost:8000/health/detailed | jq
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:74:curl "http://localhost:8000/audit/export?format=csv&startDate=$(date -d '7 days ago' -I)" -o audit_logs.csv
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:79:curl http://localhost:8000/secrets/rotation/due?daysAhead=30 | jq
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:92:curl -X POST http://localhost:8000/secrets/rotation/rotate \
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:105:curl "http://localhost:8000/audit/logs?userId=1&action=CREATE"
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:108:curl "http://localhost:8000/audit/logs" | jq '.logs[] | select(.statusCode >= 500)'
apps/ABTPi18n/docs/phases/phase5/PHASE5_QUICK_START.md:115:  curl -s http://localhost:8000/health | jq
apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:13:curl -X POST http://localhost:8000/ml/signal/score \
apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:51:curl -X POST http://localhost:8000/ml/volatility/predict \
apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:81:curl -X POST http://localhost:8000/ml/tune/start \
apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:109:curl http://localhost:8000/ml/tune/status/tune_abc123
apps/ABTPi18n/docs/phases/phase6/PHASE6_QUICK_START.md:114:curl http://localhost:8000/ml/tune/results/tune_abc123
apps/ABTPi18n/install.sh:57:echo "Backend:  http://localhost:8000/docs"
apps/ABTPi18n/verify.sh:112:echo "  3. Access Backend API docs: http://localhost:8000/docs"
apps/web/src/app/swarm-runtime/page.tsx:13:      const res = await fetch('http://localhost:8000/api/runtime/swarm/agents');
apps/web/src/app/swarm-runtime/page.tsx:18:    const ws = new WebSocket('ws://localhost:8000/api/runtime/swarm/ws/swarm');
apps/web/src/lib/api.ts:11:  return "http://localhost:8000";
apps/zdash/.codex/cloud/AGENTS.template.md:25:- Never introduce `localhost:8000`.
apps/zdash/.codex/cloud/general-custom-instructions.md:31:- never introduce localhost:8000 in repo changes
apps/zdash/.codex/cloud/maintenance.sh:100:  tracked_source_grep "localhost:8000|BACKEND_PORT=8000"
apps/zdash/.codex/cloud/maintenance.sh:107:if tracked_source_grep "localhost:8000|BACKEND_PORT=8000" >/tmp/zdash-codex-port8000.txt && [ -s /tmp/zdash-codex-port8000.txt ]; then
apps/zdash/.codex/cloud/phase-runner.md:27:- never introduce localhost:8000
apps/zdash/.codex/cloud/phase-runner.md:58:- never use localhost:8000
apps/zdash/.codex/cloud/phase-runner.md:126:Never use `localhost:8000`; backend port is `8005`.
apps/zdash/.codex/cloud/setup.sh:110:if grep -RIn "localhost:8000\|BACKEND_PORT=8000" \
apps/zdash/Makefile:24:ZDASH_PROD_RUNTIME ?= /opt/zdash/runtime
apps/zdash/Makefile:130:	git grep -nE 'localhost:8000|BACKEND_PORT=8000' -- . \
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
apps/zdash/scripts/server/logs-prod.sh:15:  echo "Production log helper not found at 