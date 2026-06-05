# Apps stack inventory

| App | Stack | Tracked | Ports detected | Domains detected |
|---|---|---:|---|---|
| ABTPi18n | `docker, node, pnpm, python` | 0 | `375, 587, 768, 1920, 3000, 3001, 5432, 6379, 6432, 8000, 9090, 22022` | `-` |
| api | `python` | 10 | `6379` | `-` |
| web | `node, npm` | 43 | `3000, 8000` | `-` |
| zAcademy | `node, npm` | 0 | `443, 3009, 4317, 8084, 9090` | `auth.zeaz.dev` |
| zcino | `unknown` | 0 | `-` | `-` |
| zcino-modern | `docker` | 0 | `3000, 4222, 5432, 6379, 6443, 8080, 8082, 8090, 8123, 8222, 9000` | `-` |
| zdash | `docker, python` | 1121 | `443, 587, 3000, 5173, 5432, 6379, 8000, 8005, 9009` | `api-zzdash.zeaz.dev, release.zeaz.dev, zdash.zeaz.dev, zzdash.zeaz.dev` |
| zkbtrader | `docker, node, npm, python` | 0 | `443, 3000, 3306, 4567, 5053, 5432, 5555, 5672, 6379, 8000, 8004, 8080, 8123, 8200, 9000, 11434, 15432, 16379, 18801, 50051, 51820, 65535` | `-` |
| zlms-prod | `node, npm` | 0 | `131, 135, 155, 443, 3000, 4318, 8000, 8080, 8888, 9080, 9102` | `-` |
| zoffice | `docker` | 0 | `6901, 8087, 8090, 8091, 9222, 18090, 18091, 18789` | `-` |
| zsticker | `docker, python` | 0 | `3008, 8000, 8007` | `zsticker.zeaz.dev` |
| zwallet | `docker, node, pnpm, python` | 0 | `3000, 3002, 4173, 5432, 5601, 6379, 8080, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8200, 8332, 8545, 8546, 8899, 9090, 9092, 9200` | `-` |

## ABTPi18n

- Path: `apps/ABTPi18n`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `0`

### Ports

- `375` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `587` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `768` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `1920` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `3000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/auth/google_provider.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md`
- `3001` from `apps/ABTPi18n/README.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/enterprise/TROUBLESHOOTING.en.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md, apps/ABTPi18n/tools/EXAMPLES.md`
- `5432` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/DEPLOYMENT.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md`
- `6379` from `apps/ABTPi18n/apps/backend/src/api/health_endpoints.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md`
- `6432` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `8000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/README.md, apps/ABTPi18n/apps/backend/Dockerfile, apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py, apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx, apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx, apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx`
- `9090` from `apps/ABTPi18n/README.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md`
- `22022` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/docker-compose.yml`

### Domains

- none detected

## api

- Path: `apps/api`
- Stack: `python`
- Root tracked files: `10`

### Ports

- `6379` from `apps/api/routers/scheduler.py, apps/api/routers/swarm.py`

### Domains

- none detected

## web

- Path: `apps/web`
- Stack: `node, npm`
- Root tracked files: `43`

### Ports

- `3000` from `apps/web/README.md`
- `8000` from `apps/web/src/app/swarm-runtime/page.tsx, apps/web/src/lib/api.ts`

### Domains

- none detected

## zAcademy

- Path: `apps/zAcademy`
- Stack: `node, npm`
- Root tracked files: `0`

### Ports

- `443` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml`
- `3009` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`
- `4317` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml`
- `8084` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml, apps/zAcademy/tests/platform/load/payment_load.js`
- `9090` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/service.yaml`

### Domains

- `auth.zeaz.dev` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`

## zcino

- Path: `apps/zcino`
- Stack: `unknown`
- Root tracked files: `0`

### Ports

- none detected

### Domains

- none detected

## zcino-modern

- Path: `apps/zcino-modern`
- Stack: `docker`
- Root tracked files: `0`

### Ports

- `3000` from `apps/zcino-modern/README.md, apps/zcino-modern/frontend/Dockerfile, apps/zcino-modern/frontend/start_next.sh`
- `4222` from `apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `5432` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `6379` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/operations.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `6443` from `apps/zcino-modern/release/zeaz_release_v2.sh`
- `8080` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/api.md, apps/zcino-modern/docs/operations.md, apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/game-service.yaml`
- `8082` from `apps/zcino-modern/README.md, apps/zcino-modern/infra/docker-compose.yml`
- `8090` from `apps/zcino-modern/README.md, apps/zcino-modern/docs/source-checklist.md, apps/zcino-modern/k8s/zeaz-testnet/zeaz-node.yaml`
- `8123` from `apps/zcino-modern/infra/docker-compose.yml, apps/zcino-modern/k8s/baseline/network-policies.yaml`
- `8222` from `apps/zcino-modern/infra/docker-compose.yml`
- `9000` from `apps/zcino-modern/infra/docker-compose.yml`

### Domains

- none detected

## zdash

- Path: `apps/zdash`
- Stack: `docker, python`
- Root tracked files: `1121`

### Ports

- `443` from `apps/zdash/install-zdash-prod.sh`
- `587` from `apps/zdash/.env.example, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `3000` from `apps/zdash/infra/k8s/configmap.yaml`
- `5173` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/README.md, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_phase7_dashboard_api.py, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/docs/runbooks/GO_LIVE_CHECKLIST.md, apps/zdash/docs/runbooks/INSTALLATION.md, apps/zdash/docs/runbooks/QUICK_START.md`
- `5432` from `apps/zdash/.github/workflows/e2e.yml, apps/zdash/README.md, apps/zdash/backend/app/tests/test_production_safety.py, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/infra/k8s/postgres-statefulset.yaml`
- `6379` from `apps/zdash/infra/k8s/redis-deployment.yaml`
- `8000` from `apps/zdash/Makefile, apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `8005` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/AGENTS.md, apps/zdash/README.md, apps/zdash/docker-compose.prod.yml, apps/zdash/docker-compose.yml, apps/zdash/docs/AI_TRADER_CONTROL_PLANE.md, apps/zdash/docs/architecture/PHASE_10_SAAS_MONETIZATION.md, apps/zdash/docs/architecture/PHASE_33_AI_TRADER_SIMULATION.md, apps/zdash/docs/releases/final-release-checklist.md`
- `9009` from `apps/zdash/docs/reports/zdash-deep-scan/06-package-make-scripts.txt`

### Domains

- `api-zzdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/infra/cloudflare/tunnel-config.example.yml, apps/zdash/infra/k8s/nginx-ingress.yaml`
- `release.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md`
- `zdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/docs/reports/zdash-deep-scan/04-routes-api.txt, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/frontend/src/api/endpoints.ts, apps/zdash/frontend/src/tests/Enterprise.test.tsx, apps/zdash/frontend/src/tests/mocks/apiMockData.ts, apps/zdash/frontend/src/tests/setup.ts`
- `zzdash.zeaz.dev` from `apps/zdash/.env.example, apps/zdash/CODE-OF-CONDUCT.md, apps/zdash/COMMUNITY.md, apps/zdash/CONTRIBUTING.md, apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/SECURITY.md, apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md, apps/zdash/docs/releases/FINAL_RELEASE_NOTES.md`

## zkbtrader

- Path: `apps/zkbtrader`
- Stack: `docker, node, npm, python`
- Root tracked files: `0`

### Ports

- `443` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/kotlin-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/ko-KR/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/kotlin-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/zh-TW/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/skills/kotlin-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/security-review/cloud-infrastructure-security.md`
- `3000` from `apps/zkbtrader/.vendor/ECC/.cursor/skills/bun-runtime/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/skills/docker-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/skills/e2e-testing/SKILL.md, apps/zkbtrader/.vendor/ECC/.opencode/prompts/agents/e2e-runner.txt, apps/zkbtrader/.vendor/ECC/agents/gan-evaluator.md, apps/zkbtrader/.vendor/ECC/agents/gan-generator.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/agents/e2e-runner.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/commands/e2e.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/rust-api-CLAUDE.md`
- `3306` from `apps/zkbtrader/.vendor/ECC/skills/tinystruct-patterns/references/database.md`
- `4567` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/vite-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/vite-patterns/SKILL.md`
- `5053` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/homelab-pihole-dns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/homelab-pihole-dns/SKILL.md`
- `5432` from `apps/zkbtrader/.vendor/ECC/.kiro/skills/docker-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/django-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/rust-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/django-security/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/django-verification/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/flox-environments/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/kotlin-patterns/SKILL.md`
- `5555` from `apps/zkbtrader/.vendor/ECC/skills/django-celery/SKILL.md`
- `5672` from `apps/zkbtrader/.vendor/ECC/docs/tr/skills/quarkus-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/quarkus-patterns/SKILL.md`
- `6379` from `apps/zkbtrader/.vendor/ECC/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/django-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/flox-environments/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/redis-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ko-KR/examples/django-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/pt-BR/examples/django-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/examples/django-api-CLAUDE.md, apps/zkbtrader/.vendor/ECC/examples/django-api-CLAUDE.md`
- `8000` from `apps/zkbtrader/.vendor/ECC/.kiro/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/django-verification/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/tr/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/django-verification/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/django-verification/SKILL.md`
- `8004` from `apps/zkbtrader/.env.example, apps/zkbtrader/README.md, apps/zkbtrader/docs/prompt/zkbtrader-ecc-next.md`
- `8080` from `apps/zkbtrader/.vendor/ECC/.cursor/rules/golang-patterns.md, apps/zkbtrader/.vendor/ECC/.kiro/skills/deployment-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/skills/golang-patterns/SKILL.md, apps/zkbtrader/.vendor/ECC/.kiro/steering/golang-patterns.md, apps/zkbtrader/.vendor/ECC/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/commands/rust-test.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/agents/opensource-forker.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/commands/rust-test.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/rust-api-CLAUDE.md`
- `8123` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/clickhouse-io/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/ko-KR/skills/clickhouse-io/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/clickhouse-io/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-TW/skills/clickhouse-io/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/clickhouse-io/SKILL.md`
- `8200` from `apps/zkbtrader/.vendor/ECC/scripts/ci/scan-supply-chain-iocs.js, apps/zkbtrader/.vendor/ECC/tests/ci/scan-supply-chain-iocs.test.js`
- `9000` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/quarkus-verification/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/tr/skills/quarkus-verification/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/quarkus-verification/SKILL.md`
- `11434` from `apps/zkbtrader/.vendor/ECC/src/llm/providers/ollama.py`
- `15432` from `apps/zkbtrader/.env.example`
- `16379` from `apps/zkbtrader/.env.example`
- `18801` from `apps/zkbtrader/.vendor/ECC/SECURITY.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/SECURITY.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/commands/devfleet.md, apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/claude-devfleet/SKILL.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/commands/devfleet.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/claude-devfleet/SKILL.md, apps/zkbtrader/.vendor/ECC/mcp-configs/mcp-servers.json, apps/zkbtrader/.vendor/ECC/skills/claude-devfleet/SKILL.md`
- `50051` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/ko-KR/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/pt-BR/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/examples/go-microservice-CLAUDE.md, apps/zkbtrader/.vendor/ECC/examples/go-microservice-CLAUDE.md`
- `51820` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/homelab-wireguard-vpn/SKILL.md, apps/zkbtrader/.vendor/ECC/skills/homelab-wireguard-vpn/SKILL.md`
- `65535` from `apps/zkbtrader/.vendor/ECC/docs/ja-JP/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/ko-KR/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/zh-CN/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/docs/zh-TW/skills/security-review/cloud-infrastructure-security.md, apps/zkbtrader/.vendor/ECC/skills/security-review/cloud-infrastructure-security.md`

### Domains

- none detected

## zlms-prod

- Path: `apps/zlms-prod`
- Stack: `node, npm`
- Root tracked files: `0`

### Ports

- `131` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `135` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `155` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `443` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml, apps/zlms-prod/z-runner/kubernetes/runner-networkpolicy.yaml`
- `3000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/git-tools.sh`
- `4318` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `8000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-select/README.md`
- `8080` from `apps/zlms-prod/UBUNTU_24_04_MANUAL.md, apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `8888` from `apps/zlms-prod/app/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/typeahead/README.md`
- `9080` from `apps/zlms-prod/z-runner/telemetry/promtail.yaml`
- `9102` from `apps/zlms-prod/z-runner/kubernetes/runner-deployment.yaml, apps/zlms-prod/z-runner/telemetry/otel-config.yaml`

### Domains

- none detected

## zoffice

- Path: `apps/zoffice`
- Stack: `docker`
- Root tracked files: `0`

### Ports

- `6901` from `apps/zoffice/docker-compose.yml`
- `8087` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/vo-config.json, apps/zoffice/app/whisper-server.py`
- `8090` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/README.md, apps/zoffice/TASK-editor-ui.md, apps/zoffice/TASK-furniture-editor.md, apps/zoffice/app/gateway_presence.py, apps/zoffice/skill/SKILL.md, apps/zoffice/tests/crud_test_results.md, apps/zoffice/tests/test_crud_projects.sh, apps/zoffice/tests/test_workflow_e2e.py`
- `8091` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/chat.js`
- `9222` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/vo-config.json, apps/zoffice/kasm-browser-config/browser-supervisor.sh, apps/zoffice/kasm-browser-config/start-cdp-proxy.sh`
- `18090` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18091` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18789` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/QA-CODE-QUALITY-SCAN.md, apps/zoffice/README.md, apps/zoffice/app/vo-config.json`

### Domains

- none detected

## zsticker

- Path: `apps/zsticker`
- Stack: `docker, python`
- Root tracked files: `0`

### Ports

- `3008` from `apps/zsticker/Makefile`
- `8000` from `apps/zsticker/Dockerfile`
- `8007` from `apps/zsticker/Makefile, apps/zsticker/README.md`

### Domains

- `zsticker.zeaz.dev` from `apps/zsticker/src/cli/api.py, apps/zsticker/src/cli/dashboard.py`

## zwallet

- Path: `apps/zwallet`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `0`

### Ports

- `3000` from `apps/zwallet/apps/api/src/server.ts, apps/zwallet/infra/helm/templates/api-deployment.yaml, apps/zwallet/infra/k8s/api-deployment.yaml, apps/zwallet/infra/k8s/monitoring.yaml, apps/zwallet/k8s/monitoring/monitoring-stack.yaml`
- `3002` from `apps/zwallet/deploy-zveo-services.sh`
- `4173` from `apps/zwallet/apps/world/README.md`
- `5432` from `apps/zwallet/infra/k8s/postgres.yaml`
- `5601` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `6379` from `apps/zwallet/admin/panel/enterprise/audit_store.py, apps/zwallet/admin/panel/enterprise/main.py, apps/zwallet/api/app/middleware/security_advanced.py, apps/zwallet/api/app/middleware/security_distributed.py, apps/zwallet/api/app/security/adaptive_rate_limiter.py, apps/zwallet/api/app/security/anomaly_detector.py, apps/zwallet/api/app/security/circuit_breaker.py, apps/zwallet/api/app/security/risk_engine.py, apps/zwallet/api/app/security/shadow_ban.py, apps/zwallet/backend/services/gateway/src/app.ts`
- `8080` from `apps/zwallet/backend/.env.example, apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml, apps/zwallet/infra/k8s/helm/zwallet/templates/deployment.yaml, apps/zwallet/infra/k8s/helm/zwallet/values.yaml, apps/zwallet/k8s/base/gateway-deployment.yaml, apps/zwallet/k8s/base/gateway-service.yaml, apps/zwallet/k8s/deployment.yaml`
- `8090` from `apps/zwallet/deploy-zveo-services.sh, apps/zwallet/docker-compose.yml`
- `8091` from `apps/zwallet/docker-compose.yml`
- `8092` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml`
- `8093` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8094` from `apps/zwallet/docker-compose.yml`
- `8095` from `apps/zwallet/docker-compose.yml`
- `8096` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8097` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8098` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8099` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8100` from `apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8200` from `apps/zwallet/infra/k8s/vault.yaml`
- `8332` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8545` from `apps/zwallet/api/tests/conftest.py, apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8546` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `8899` from `apps/zwallet/services/card/src/index.ts, apps/zwallet/services/compliance/src/index.ts, apps/zwallet/services/event-workers/src/index.ts, apps/zwallet/services/indexer/src/index.ts, apps/zwallet/services/liquidity/src/index.ts, apps/zwallet/services/router/src/intentRouter.ts, apps/zwallet/services/swap-engine/src/index.ts, apps/zwallet/services/wallet-engine/src/index.ts`
- `9090` from `apps/zwallet/infra/k8s/base/monitoring.yaml, apps/zwallet/infra/k8s/monitoring.yaml`
- `9092` from `apps/zwallet/api/src/infrastructure/kafka.producer.ts, apps/zwallet/infra/k8s/kafka-cluster.yaml, apps/zwallet/infra/k8s/kafka.yaml`
- `9200` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/k8s/logging/elk-stack.yaml`

### Domains

- none detected
