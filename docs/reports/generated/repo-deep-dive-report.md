# zeaz-platform repository deep-dive report

Generated: 2026-06-05T04:48:51Z

## Git

```text
## main...origin/main [ahead 2]
M  .gitignore
 M .mcp.json
 M Makefile
?? apply-phase55-makefile-refactor.sh
?? scripts/make/
?? scripts/repo/
?? secrets/
```

## Top-level layout

```text
.
./.agent
./.agent/.agents
./.agent/rules
./.agents
./agents
./.agent/skills
./.agents/skills
./.agent/workflows
./apps
./apps/ABTPi18n
./apps/api
./apps/web
./apps/zAcademy
./apps/zcino
./apps/zcino-modern
./apps/zdash
./apps/zkbtrader
./apps/zlms-prod
./apps/zoffice
./apps/zsticker
./apps/zwallet
./.backup
./.backups
./backups
./.backups/makefile
./.backup/terraform-broken-20260516T094429Z
./.backup/terraform-broken-20260516T094433Z
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
./scripts/ci
./scripts/cloudflare
./scripts/environments
./scripts/fixers
./scripts/lib
./scripts/make
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
- targets: 141
- duplicate targets: 1
- issues: 2

ISSUE: duplicate target .PHONY: lines 34, 294, 298, 302, 306, 310, 314, 322, 327, 331, 336, 341, 346, 351, 356, 361, 366, 371, 376, 381, 391, 453, 457, 461, 465, 469, 473, 519, 573, 577, 581, 585, 589, 593, 597, 601, 605, 610, 618, 622, 630
ISSUE: very large global .PHONY line; prefer grouped .PHONY declarations near sections
```

## Make targets

```text
34:.PHONY: help bootstrap cloudflare-stability-check setup setup-free setup-legacy generate-env-all refactor-cloudflare-vars refactor-cloudflare-vars-dry check-no-cf-vars env load-env docs-context supabase-ai-tools supabase-docs-context supabase-mcp-check supabase-mcp-config upgrade-report validate validate-agent ci ci-validate validate-env validate-env-strict env-format-validate env-format-validate-local env-normalize-local maintenance test fmt fmt-check lint shellcheck yaml-validate policy-test sbom-generation sbom-validate security-validate secret-scan secret-scan-history tunnel-validation waf-validation waf-validate tf-init tf-fmt tf-fmt-check tf-validate tf-plan tf-plan-out tf-apply tf-apply-plan tf-destroy tf-state-rm-waf tf-env-init tf-env-validate tf-env-plan tofu-init tofu-validate tofu-plan drift drift-detect token-clean token-clean-delete token-clean-all token-clean-all-delete token-verify token-verify-strict token-rotate-dry token-rotate token-rotate-refresh security-scan sbom cosign-sign doctor clean zdash-origin-check zdash-tunnel-config zdash-edge-readiness zdash-go-live-evidence zdash-public-release-evidence phase50-validate zdash-install zdash-validate-fast zdash-backend-test zdash-frontend-test zdash-build zdash-server-start zdash-server-stop zdash-server-restart zdash-server-status zdash-validate zdash-release-evidence zdash-phase48-validate zdash-cloudflare-handoff phase51-validate zeaz-dev-plan zeaz-dev-apply zeaz-dev-rollback-plan zeaz-dev-verify-live zeaz-dev-public-evidence phase52-validate workflow-policy workflow-validate gitops-validate git-status gpg-commit gpg-push gpg-finalize git-finalize zaiz-validate zaiz-prod zaiz-fix-google-genai zaiz-deps-check
36:help:
39:bootstrap:
42:setup: setup-free
44:setup-free:
47:setup-legacy:
50:generate-env-all:
53:refactor-cloudflare-vars-dry:
56:refactor-cloudflare-vars:
59:check-no-cf-vars:
62:docs-context:
65:supabase-docs-context:
68:supabase-mcp-check:
71:supabase-mcp-config:
74:supabase-ai-tools: supabase-docs-context supabase-mcp-check
77:upgrade-report:
80:env: load-env
82:load-env:
85:ci: validate
87:validate-agent: ci-validate
89:ci-validate: test env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
92:validate: test validate-env env-format-validate yaml-validate check-no-cf-vars tf-fmt-check
95:validate-env:
98:validate-env-strict:
101:env-format-validate:
104:env-format-validate-local:
107:env-normalize-local:
111:maintenance:
114:test:
117:fmt: tf-fmt
119:fmt-check: tf-fmt-check
121:lint:
124:shellcheck:
127:yaml-validate:
130:tf-init:
133:tf-fmt:
136:tf-fmt-check:
139:tf-validate: tf-init
142:tf-plan: tf-init
145:tf-plan-out: tf-init
149:tf-apply tf-apply-plan tf-destroy tf-state-rm-waf:
152:tf-env-init:
156:tf-env-validate: tf-env-init
159:tf-env-plan: tf-env-init
162:tofu-init:
165:tofu-validate: tofu-init
168:tofu-plan: tofu-init
171:drift: drift-detect
173:drift-detect: tf-init
176:token-clean:
179:token-clean-delete:
183:token-clean-all:
186:token-clean-all-delete:
190:token-verify:
193:token-verify-strict:
196:token-rotate-dry:
199:token-rotate:
204:token-rotate-refresh: token-rotate-dry
206:secret-scan:
209:secret-scan-history:
212:security-scan:
215:sbom:
218:cosign-sign:
221:policy-test: workflow-policy
224:sbom-generation: sbom
225:sbom-validate: sbom
226:security-validate: security-scan
227:waf-validate: waf-validation
229:waf-validation:
232:tunnel-validation:
235:workflow-policy:
238:workflow-validate: workflow-policy
241:gitops-validate: workflow-validate drift-detect
244:git-status:
247:gpg-commit:
254:gpg-push:
257:gpg-finalize: validate
263:git-finalize: gpg-finalize
265:zaiz-validate: validate
267:zaiz-prod:
270:zaiz-fix-google-genai:
273:zaiz-deps-check:
280:doctor:
286:clean:
294:.PHONY: zdash-origin-check
295:zdash-origin-check: ## Verify zDash origin configuration
298:.PHONY: zdash-tunnel-config
299:zdash-tunnel-config: ## Verify zDash tunnel configuration
302:.PHONY: zdash-edge-readiness
303:zdash-edge-readiness: ## Verify zDash edge readiness
306:.PHONY: zdash-go-live-evidence
307:zdash-go-live-evidence: ## Collect zDash go-live evidence
310:.PHONY: zdash-public-release-evidence
311:zdash-public-release-evidence: ## Collect zDash public release evidence
314:.PHONY: phase50-validate
315:phase50-validate: ## Validate Phase 50 zDash integration
322:.PHONY: zdash-install
323:zdash-install: ## Install zDash dependencies (apps/zdash)
327:.PHONY: zdash-validate-fast
328:zdash-validate-fast: ## Run zDash validate-fast with dependency bootstrap
331:.PHONY: zdash-backend-test
332:zdash-backend-test: ## Run zDash backend tests (apps/zdash)
336:.PHONY: zdash-frontend-test
337:zdash-frontend-test: ## Run zDash frontend tests (apps/zdash)
341:.PHONY: zdash-build
342:zdash-build: ## Build zDash frontend production bundle (apps/zdash)
346:.PHONY: zdash-server-start
347:zdash-server-start: ## Start zDash backend + frontend servers (apps/zdash)
351:.PHONY: zdash-server-stop
352:zdash-server-stop: ## Stop zDash servers (apps/zdash)
356:.PHONY: zdash-server-restart
357:zdash-server-restart: ## Restart zDash servers (apps/zdash)
361:.PHONY: zdash-server-status
362:zdash-server-status: ## Show zDash server status (apps/zdash)
366:.PHONY: zdash-validate
367:zdash-validate: ## Run full zDash validation (apps/zdash)
371:.PHONY: zdash-release-evidence
372:zdash-release-evidence: ## Collect zDash release evidence (apps/zdash)
376:.PHONY: zdash-phase48-validate
377:zdash-phase48-validate: ## Run zDash Phase 48 validation (apps/zdash)
381:.PHONY: zdash-cloudflare-handoff
382:zdash-cloudflare-handoff: ## Run zDash Cloudflare handoff checks
391:.PHONY: phase51-validate
392:phase51-validate: ## Validate Phase 51 zDash monorepo import
453:.PHONY: zeaz-dev-plan
454:zeaz-dev-plan: ## Print the zeaz.dev production route plan
457:.PHONY: zeaz-dev-apply
458:zeaz-dev-apply: ## Run controlled zeaz.dev apply checks
461:.PHONY: zeaz-dev-rollback-plan
462:zeaz-dev-rollback-plan: ## Generate zeaz.dev rollback plan
465:.PHONY: zeaz-dev-verify-live
466:zeaz-dev-verify-live: ## Verify live zeaz.dev public URLs
469:.PHONY: zeaz-dev-public-evidence
470:zeaz-dev-public-evidence: ## Generate zeaz.dev public release evidence
473:.PHONY: phase52-validate
474:phase52-validate: ## Validate Phase 52 zeaz.dev production routing update
507:cloudflare-stability-check: ## Run full Cloudflare stability checks
519:.PHONY: authentik-env authentik-install authentik-pull authentik-up authentik-start authentik-down authentik-stop authentik-restart authentik-status authentik-logs authentik-update authentik-open
521:authentik-env:
536:authentik-install: authentik-env
542:authentik-pull:
545:authentik-up authentik-start:
549:authentik-down authentik-stop:
552:authentik-restart:
555:authentik-status:
558:authentik-logs:
561:authentik-update: authentik-env
566:authentik-open:
573:.PHONY: zdash-terraform-integrate
574:zdash-terraform-integrate: ## Generate zDash Terraform source files
577:.PHONY: cf-zdash-preflight
578:cf-zdash-preflight: ## Resolve Cloudflare zone/tunnel/DNS IDs for zDash
581:.PHONY: cf-zdash-import-existing
582:cf-zdash-import-existing: ## Import existing zDash DNS records into Terraform state
585:.PHONY: tf-zdash-init
586:tf-zdash-init: ## Init zDash Cloudflare Terraform
589:.PHONY: tf-zdash-fmt
590:tf-zdash-fmt: ## Format zDash Cloudflare Terraform
593:.PHONY: tf-zdash-fmt-check
594:tf-zdash-fmt-check: ## Check zDash Cloudflare Terraform formatting
597:.PHONY: tf-zdash-validate
598:tf-zdash-validate: tf-zdash-init ## Validate zDash Cloudflare Terraform
601:.PHONY: tf-zdash-plan
602:tf-zdash-plan: tf-zdash-init ## Plan zDash Cloudflare Terraform
605:.PHONY: tf-zdash-plan-out
606:tf-zdash-plan-out: tf-zdash-init ## Save zDash Cloudflare Terraform plan
610:.PHONY: tf-zdash-apply
611:tf-zdash-apply: ## Guarded zDash Terraform apply
618:.PHONY: cf-zdash-token-diagnose
619:cf-zdash-token-diagnose: ## Diagnose Cloudflare token permissions for zDash
622:.PHONY: cf-zdash-sync-env
623:cf-zdash-sync-env: ## Sync zDash Terraform env vars from Cloudflare API into .env/.env.cloudflare
630:.PHONY: repo-deep-dive makefile-audit makefile-refactor
631:repo-deep-dive: ## Generate full repository deep-dive report
634:makefile-audit: ## Audit root Makefile for duplicate targets and risky patterns
637:makefile-refactor: ## Re-run safe root Makefile cleanup
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
terraform/cloudflare/dns.tf
terraform/cloudflare/main.tf
terraform/cloudflare/.terraform.lock.hcl
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
terraform/zdash/.terraform.lock.hcl
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
apps/zdash/scripts/server/logs-prod.sh:15:  echo "Production log helper not found at /opt/zdash/runtime/scripts/zdash-logs.sh"
apps/zdash/scripts/server/start-prod.sh:4:RUNTIME_DIR="/opt/zdash/runtime"
apps/zdash/scripts/server/status-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
apps/zdash/scripts/server/status-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
apps/zdash/scripts/server/status-prod.sh:16:COMPOSE_DIR="/opt/zdash"
apps/zdash/scripts/server/status-prod.sh:23:if [[ -f "/opt/zdash/runtime/scripts/zdash-health.sh" ]]; then
apps/zdash/scripts/server/status-prod.sh:25:  bash "/opt/zdash/runtime/scripts/zdash-health.sh" || true
apps/zdash/scripts/server/stop-prod.sh:4:if [[ ! -d "/opt/zdash/runtime" ]]; then
apps/zdash/scripts/server/stop-prod.sh:5:  echo "Production runtime not found at /opt/zdash/runtime"
docs/prompts/fix-cloudflare-terraform-zdash-official.prompt:17:   - REPLACE_WITH_ZEAZ_DEV_ZONE_ID
docs/prompts/fix-cloudflare-terraform-zdash-official.prompt:18:   - REPLACE_WITH_TUNNEL_UUID
infra/ai-runtime/compose.yaml:80:      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
scripts/cloudflare/zdash-terraform-env-guard.sh:8:if grep -RIn "REPLACE_WITH_ZEAZ_DEV_ZONE_ID\|REPLACE_WITH_TUNNEL_UUID\|REPLACE_WITH_REAL_ZONE_ID\|REPLACE_WITH_REAL_TUNNEL_UUID" \
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
terraform/zdash/zdash_edge.auto.tfvars.example:4:cloudflare_zone_id   = "REPLACE_WITH_ZEAZ_DEV_ZONE_ID"
terraform/zdash/zdash_edge.auto.tfvars.example:5:cloudflare_tunnel_id = "REPLACE_WITH_TUNNEL_UUID"
```

## Forbidden tracked runtime files

```text
```

## Docker compose inventory

```text
./apps/ABTPi18n/docker-compose.yml
./apps/zcino-modern/infra/docker-compose.yml
./apps/zcino-modern/infra/zeaz-testnet/docker-compose.yml
./apps/zdash/docker-compose.prod.secrets.yml
./apps/zdash/docker-compose.prod.yml
./apps/zdash/docker-compose.yml
./apps/zkbtrader/docker-compose.yml
./apps/zoffice/docker-compose.yml
./apps/zsticker/docker-compose.yml
./apps/zwallet/docker-compose.yml
./apps/zwallet/infra/docker/docker-compose.devops.yml
./apps/zwallet/infra/docker/docker-compose.prod.yml
./apps/zwallet/infra/observability/docker-compose.siem.yml
./apps/zwallet/infra/redis/docker-compose.yml
./docker-compose.yml
./runtime/authentik/compose.yml
./tunnels/docker/docker-compose.yml
```

## Workflow inventory

```text
.github/workflows/backup-validation.yml
.github/workflows/ci.yml
.github/workflows/cloudflared-restart.yml
.github/workflows/codeql.yml
.github/workflows/cosign-signing.yml
.github/workflows/deploy-worker.yml
.github/workflows/deploy-zdash-pages.yml
.github/workflows/drift-detect.yml
.github/workflows/dr-test.yml
.github/workflows/ecc-integration-check.yml
.github/workflows/meta-os-ci.yml
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
