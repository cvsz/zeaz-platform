# Apps stack inventory

| App | Stack | Tracked | Ports detected | Domains detected |
|---|---|---:|---|---|
| api | `docker, python` | 16 | `6379, 8000` | `api.zeaz.dev, zcfdash.zeaz.dev` |
| openwork | `docker, node, pnpm` | 1737 | `443, 587, 1234, 3000, 3001, 3005, 3306, 3333, 3978, 4096, 4321, 5173, 5432, 6000, 6080, 6379, 8000, 8080, 8090, 8787, 8788, 8789, 8790, 8791, 8799, 9222, 9223, 9823, 9825, 9830, 11434, 18801, 19876, 48123, 49999, 52431, 54235, 59673, 59674, 59675` | `mcp.zeaz.dev, openwork.zeaz.dev` |
| web | `node, pnpm` | 57 | `8000` | `api-zcfdash.zeaz.dev, api-zdash.zeaz.dev, api.zeaz.dev, app.zeaz.dev, ssh.zeaz.dev, www.zeaz.dev, zcfdash.zeaz.dev, zcino.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` |
| zAcademy | `node` | 133 | `443, 3009, 4317, 8084, 9090` | `auth.zeaz.dev` |
| zLinebot | `cloudflare-workers, docker, node, python` | 961 | `587, 3000, 3001, 3002, 3100, 5173, 5432, 6333, 6379, 8000, 8080, 9090, 9092, 9100, 9300, 9400, 9500, 9600, 9700, 26257` | `admin.zeaz.dev, admin.zlttbots.zeaz.dev, ai.zeaz.dev, api.zeaz.dev, api.zlttbots.zeaz.dev, arb.zlttbots.zeaz.dev, asia.zeaz.dev, auth.zeaz.dev, backup.zlinebot.zeaz.dev, crawl.zeaz.dev, crawler.zlttbots.zeaz.dev, eu.zeaz.dev, gpu.zeaz.dev, grafana.zeaz.dev, grafana.zlinebot.zeaz.dev, jaeger.zlinebot.zeaz.dev, kafka.zeaz.dev, logs.zlinebot.zeaz.dev, predict.zeaz.dev, us.zeaz.dev, video.zlttbots.zeaz.dev, worker.zeaz.dev, zlinebot.zeaz.dev, zlttbots.zeaz.dev` |
| zai-factory | `npm` | 0 | `-` | `-` |
| zcfdash | `docker` | 2 | `-` | `zcfdash.zeaz.dev` |
| zcino | `docker` | 3145 | `3000, 4222, 5432, 6379, 6443, 8000, 8080, 8082, 8090, 8123, 8222, 9000` | `zcino.zeaz.dev` |
| zcloud | `node, npm` | 28 | `4177, 5000, 11434, 18789` | `-` |
| zdash | `docker, python` | 1128 | `443, 587, 3000, 5173, 5432, 5436, 6379, 8000, 8005, 9009, 9090, 16379, 16380` | `api-zdash.zeaz.dev, release.zeaz.dev, zdash.zeaz.dev` |
| zdev | `node` | 7 | `4181` | `-` |
| zlms | `docker, node, pnpm` | 28488 | `131, 135, 155, 443, 3000, 4318, 8000, 8080, 8888, 9080, 9102` | `pgadmin.zeaz.dev, zlms.zeaz.dev` |
| zoffice | `docker` | 180 | `6901, 8087, 8090, 8091, 8092, 8093, 9222, 18090, 18091, 18789` | `zoffice.zeaz.dev` |
| zquest | `unknown` | 5 | `8080` | `-` |
| zsp-aitool | `docker, node, npm` | 766 | `3000, 3001, 5173, 5174, 5175, 5432, 5435, 8005` | `api-zdash.zeaz.dev, api-zveo.zeaz.dev, app.zeaz.dev, release.zeaz.dev, studio.zeaz.dev, tunnel.zeaz.dev, www.zeaz.dev, zaiz.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` |
| zsticker | `docker, python` | 83 | `3008, 8000, 8007, 8080` | `zsticker.zeaz.dev` |
| ztrader | `docker, python` | 374 | `375, 768, 1920, 3000, 3001, 3016, 3017, 5432, 6379, 8000, 8016` | `api-ztrader.zeaz.dev, ztrader.zeaz.dev` |
| zveo | `docker, node, pnpm, python` | 241 | `443, 3000, 3019, 3100, 3200, 4317, 4318, 4319, 5432, 5436, 6379, 6382, 8000, 8080, 9000, 9005, 9006, 9090, 9093, 9095, 9100, 9464, 13133` | `zveo.zeaz.dev` |
| zwallet | `docker, node, pnpm, python` | 456 | `3000, 3002, 4173, 4222, 5432, 5601, 6379, 8080, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8200, 8332, 8545, 8546, 8899, 9090, 9092, 9200, 25432, 26380` | `app.zeaz.dev` |

## api

- Path: `apps/zeaz-api`
- Stack: `docker, python`
- Root tracked files: `16`

### Ports

- `6379` from `apps/zeaz-api/routers/scheduler.py, apps/zeaz-api/routers/swarm.py`
- `8000` from `apps/zeaz-api/docker-compose.yml`

### Domains

- `api.zeaz.dev` from `apps/zeaz-api/README.md, apps/zeaz-api/docker-compose.yml, apps/zeaz-api/routers/cloudflare_control.py`
- `zcfdash.zeaz.dev` from `apps/zeaz-api/routers/cloudflare_control.py`

## openwork

- Path: `apps/openwork`
- Stack: `docker, node, pnpm`
- Root tracked files: `1737`

### Ports

- `443` from `apps/openwork/ee/apps/den-web/proxy.ts`
- `587` from `apps/openwork/ee/apps/den-api/.env.example`
- `1234` from `apps/openwork/apps/app/tests/session-sync-permissions.test.ts, apps/openwork/apps/app/tests/session-sync-tool-parts.test.ts`
- `3000` from `apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/app/tests/env-context.test.ts, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/landing/app/api/_lib/security.ts, apps/openwork/scripts/harness/agents/gan-evaluator.md, apps/openwork/scripts/harness/agents/gan-generator.md`
- `3001` from `apps/openwork/ee/apps/den-api/.env.example`
- `3005` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-cloud-instance/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/opencode-router/.env.example, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-web/README.md, apps/openwork/ee/apps/landing/app/api/_lib/security.ts, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md`
- `3306` from `apps/openwork/.devcontainer/start-daytona-server.sh, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/package.json, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts`
- `3333` from `apps/openwork/apps/ui-demo/vite.config.ts`
- `3978` from `apps/openwork/evals/daytona-flows.md`
- `4096` from `apps/openwork/apps/app/src/react-app/shell/providers.tsx, apps/openwork/apps/opencode-router/.env.example, apps/openwork/apps/opencode-router/README.md, apps/openwork/apps/opencode-router/install.sh, apps/openwork/apps/opencode-router/src/config.ts, apps/openwork/apps/opencode-router/test/bridge-e2e.test.js, apps/openwork/apps/opencode-router/test/bridge-multiworkspace.test.js, apps/openwork/apps/opencode-router/test/health-send.test.js, apps/openwork/apps/server/README.md, apps/openwork/packaging/docker/Dockerfile`
- `4321` from `apps/openwork/apps/server/src/artifact-files.e2e.test.ts`
- `5173` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/apps/app/scripts/open-target.test.ts, apps/openwork/apps/server/README.md, apps/openwork/apps/server/src/env-routes.e2e.test.ts, apps/openwork/packaging/docker/docker-compose.den-dev.yml, apps/openwork/packaging/docker/docker-compose.dev.yml`
- `5432` from `apps/openwork/ee/apps/inference/src/env.ts, apps/openwork/ee/packages/den-db/.env.example, apps/openwork/ee/packages/den-db/drizzle.config.ts, apps/openwork/scripts/harness/agents/opensource-forker.md`
- `6000` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `6080` from `apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh`
- `6379` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `8000` from `apps/openwork/zeaz/installer/mcp-fix-phase2.sh`
- `8080` from `apps/openwork/apps/server/src/validators.test.ts, apps/openwork/scripts/harness/agents/opensource-forker.md, apps/openwork/scripts/harness/commands/rust-test.md`
- `8090` from `apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-recording-artifacts/SKILL.md`
- `8787` from `apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts, apps/openwork/apps/app/src/app/lib/openwork-server.ts, apps/openwork/apps/app/tests/openwork-env-runtime.test.ts, apps/openwork/apps/server/src/config.ts, apps/openwork/apps/server/src/extensions/google-workspace.test.ts, apps/openwork/apps/server/src/tokens.test.ts, apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/Dockerfile, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/docker/docker-compose.dev.yml`
- `8788` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8789` from `apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8790` from `apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/zeaz/docs/rollback.md`
- `8791` from `apps/openwork/apps/server/src/embedded.ts, apps/openwork/ee/apps/den-api/src/env.ts, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/inference/src/models/openwork-dev.json, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example`
- `8799` from `apps/openwork/zeaz/docs/deployment.md, apps/openwork/zeaz/docs/migration-guide.md, apps/openwork/zeaz/docs/operations.md, apps/openwork/zeaz/installer/docker-compose.yml`
- `9222` from `apps/openwork/.opencode/skills/daytona-chrome-cdp/SKILL.md`
- `9223` from `apps/openwork/evals/browser-extension-flows.md`
- `9823` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/evals/openable-items-flow.md, apps/openwork/evals/react-session-flows.md, apps/openwork/packaging/systemd/openwork.env, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/scripts/openwork-debug.sh`
- `9825` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/run-evals/SKILL.md, apps/openwork/evals/README.md, apps/openwork/evals/daytona-flows.md`
- `9830` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md`
- `11434` from `apps/openwork/apps/app/src/app/extensions.ts, apps/openwork/apps/app/src/react-app/domains/settings/openai-image-extension.ts, apps/openwork/apps/server/src/jsonc.test.ts, apps/openwork/ee/apps/den-api/src/routes/org/plugin-system/store.ts, apps/openwork/zeaz/docs/deployment.md, apps/openwork/zeaz/providers/router.ts`
- `18801` from `apps/openwork/scripts/install-openwork.sh`
- `19876` from `apps/openwork/apps/app/src/i18n/locales/ca.ts, apps/openwork/apps/app/src/i18n/locales/en.ts, apps/openwork/apps/app/src/i18n/locales/es.ts, apps/openwork/apps/app/src/i18n/locales/fr.ts, apps/openwork/apps/app/src/i18n/locales/ja.ts, apps/openwork/apps/app/src/i18n/locales/pt-BR.ts, apps/openwork/apps/app/src/i18n/locales/ru.ts, apps/openwork/apps/app/src/i18n/locales/th.ts, apps/openwork/apps/app/src/i18n/locales/vi.ts, apps/openwork/apps/app/src/i18n/locales/zh.ts`
- `48123` from `apps/openwork/apps/server/src/embedded.ts`
- `49999` from `apps/openwork/apps/server/src/workspace-activate.e2e.test.ts`
- `52431` from `apps/openwork/docs/mcp-ui-control-profile.md`
- `54235` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `59673` from `apps/openwork/evals/browser-extension-flows.md`
- `59674` from `apps/openwork/evals/browser-extension-flows.md`
- `59675` from `apps/openwork/evals/browser-extension-flows.md`

### Domains

- `mcp.zeaz.dev` from `apps/openwork/zeaz/mcp/server.ts`
- `openwork.zeaz.dev` from `apps/openwork/README.md`

## web

- Path: `apps/zeaz-web`
- Stack: `node, pnpm`
- Root tracked files: `57`

### Ports

- `8000` from `apps/zeaz-web/src/app/dashboard/swarm-runtime/page.tsx, apps/zeaz-web/src/lib/api.ts`

### Domains

- `api-zcfdash.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/agents/page.tsx, apps/zeaz-web/src/app/dashboard/deployments/page.tsx, apps/zeaz-web/src/app/dashboard/services/page.tsx`
- `api-zdash.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`
- `api.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/page.tsx, apps/zeaz-web/src/app/dashboard/services/page.tsx`
- `app.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`
- `ssh.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`
- `www.zeaz.dev` from `apps/zeaz-web/README.md, apps/zeaz-web/next.config.ts, apps/zeaz-web/src/app/dashboard/reports/page.tsx, apps/zeaz-web/src/app/marketing/contact/page.tsx, apps/zeaz-web/src/app/marketing/layout.tsx`
- `zcfdash.zeaz.dev` from `apps/zeaz-web/next.config.ts`
- `zcino.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`
- `zdash.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`
- `zveo.zeaz.dev` from `apps/zeaz-web/src/app/dashboard/reports/page.tsx`

## zAcademy

- Path: `apps/zAcademy`
- Stack: `node`
- Root tracked files: `133`

### Ports

- `443` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml`
- `3009` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`
- `4317` from `apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml`
- `8084` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/networkpolicy.yaml, apps/zAcademy/tests/platform/load/payment_load.js`
- `9090` from `apps/zAcademy/infra/kubernetes/payment/deployment.yaml, apps/zAcademy/infra/kubernetes/payment/service.yaml`

### Domains

- `auth.zeaz.dev` from `apps/zAcademy/services/payment-domain/payment-service/config/payment.yaml`

## zLinebot

- Path: `apps/zLinebot`
- Stack: `cloudflare-workers, docker, node, python`
- Root tracked files: `961`

### Ports

- `587` from `apps/zLinebot/.env.example`
- `3000` from `apps/zLinebot/.env.example, apps/zLinebot/CONTRIBUTING.md, apps/zLinebot/app/src/dr/health.ts, apps/zLinebot/app/src/utils/env.ts, apps/zLinebot/apps/zeaz-api/src/server.ts, apps/zLinebot/docs/CONTRIBUTING_th.md, apps/zLinebot/docs/INSTALL_FULL.md, apps/zLinebot/docs/MANUAL.md, apps/zLinebot/docs/README_th.md, apps/zLinebot/docs/install_manual_en.md`
- `3001` from `apps/zLinebot/deploy.sh`
- `3002` from `apps/zLinebot/deploy.sh`
- `3100` from `apps/zLinebot/k8s/observability.yaml`
- `5173` from `apps/zLinebot/app/src/services/stripe.ts, apps/zLinebot/docs/INSTALL_FULL.md`
- `5432` from `apps/zLinebot/k8s/postgres.yaml, apps/zLinebot/scripts/legacy_zltt/install-zlttbots-platform.sh, apps/zLinebot/zlinebot-master.sh`
- `6333` from `apps/zLinebot/app/src/services/vector.search.ts, apps/zLinebot/app/src/services/vector.ts`
- `6379` from `apps/zLinebot/app/src/queue/producer.ts, apps/zLinebot/app/src/utils/env.ts, apps/zLinebot/k8s/redis.yaml, apps/zLinebot/scripts/legacy_zltt/generate-enterprise-v8.sh, apps/zLinebot/scripts/legacy_zltt/install-zlttbots-platform.sh, apps/zLinebot/services/ai-orchestrator/src/main.py, apps/zLinebot/services/gpu-renderer/src/api/server.py, apps/zLinebot/services/gpu-renderer/src/core/queue.py, apps/zLinebot/services/market-crawler/src/api/server.py, apps/zLinebot/services/market-crawler/src/core/queue.py`
- `8000` from `apps/zLinebot/cloud/worker/consumer.py, apps/zLinebot/services/billing-service/src/main.py, apps/zLinebot/services/budget-allocator/src/main.py, apps/zLinebot/services/capital-allocator/src/main.py, apps/zLinebot/services/feature-store/src/main.py, apps/zLinebot/services/federation/src/main.py, apps/zLinebot/services/landing-service/src/main.py, apps/zLinebot/services/market-orchestrator/src/main.py, apps/zLinebot/services/model-registry/src/main.py, apps/zLinebot/services/model-service/src/main.py`
- `8080` from `apps/zLinebot/k8s/cockroach.yaml, apps/zLinebot/k8s/deploy.yaml, apps/zLinebot/tests/test_network_egress_client.py`
- `9090` from `apps/zLinebot/k8s/prometheus.yaml`
- `9092` from `apps/zLinebot/docker-compose.yml, apps/zLinebot/k8s/redpanda.yaml`
- `9100` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh`
- `9300` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh, apps/zLinebot/services/gpu-renderer/src/main.py`
- `9400` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh, apps/zLinebot/services/market-crawler/src/main.py`
- `9500` from `apps/zLinebot/scripts/legacy_zltt/start-zlttbots-platform.sh, apps/zLinebot/scripts/legacy_zltt/start-zlttbots.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-restart-service.sh`
- `9600` from `apps/zLinebot/services/execution-engine/src/main.py`
- `9700` from `apps/zLinebot/services/affiliate-webhook/src/main.py`
- `26257` from `apps/zLinebot/k8s/cockroach.yaml`

### Domains

- `admin.zeaz.dev` from `apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `admin.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`
- `ai.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `api.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-monitor.sh, apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `api.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`
- `arb.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `asia.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `auth.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `backup.zlinebot.zeaz.dev` from `apps/zLinebot/infra/cloudflare.yaml`
- `crawl.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `crawler.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `eu.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `gpu.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh`
- `grafana.zeaz.dev` from `apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `grafana.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/grafana-ingress.yaml`
- `jaeger.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/observability-ingress.yaml`
- `kafka.zeaz.dev` from `apps/zLinebot/tests/test_safe_edge_pack.py`
- `logs.zlinebot.zeaz.dev` from `apps/zLinebot/k8s/observability-ingress.yaml`
- `predict.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/zlttbots-doctor.sh, apps/zLinebot/services/admin-panel/app/page.js, apps/zLinebot/tests/test_safe_edge_pack.py`
- `us.zeaz.dev` from `apps/zLinebot/services/edge-worker/index.js`
- `video.zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/generate-cloudflare-devops-toolkit.sh`
- `worker.zeaz.dev` from `apps/zLinebot/app/src/ai/edge.ts`
- `zlinebot.zeaz.dev` from `apps/zLinebot/.env.example, apps/zLinebot/README.md, apps/zLinebot/app/src/security/secret-validator.ts, apps/zLinebot/bootstrap.sh, apps/zLinebot/cloudflared/config.yml, apps/zLinebot/infra/cloudflare.yaml, apps/zLinebot/infra/cloudflare_dns.yaml, apps/zLinebot/infra/cloudflare_lb.yaml, apps/zLinebot/k8s/ingress.yaml, apps/zLinebot/k8s/zlinebot-config.yaml`
- `zlttbots.zeaz.dev` from `apps/zLinebot/scripts/legacy_zltt/deploy-zlttbots-production.sh, apps/zLinebot/scripts/legacy_zltt/install-zeaz-edge-stack.sh, apps/zLinebot/scripts/legacy_zltt/migrate-edge-domain.sh, apps/zLinebot/scripts/legacy_zltt/repair-platform.sh`

## zai-factory

- Path: `apps/zai-factory`
- Stack: `npm`
- Root tracked files: `0`

### Ports

- none detected

### Domains

- none detected

## zcfdash

- Path: `apps/zcfdash`
- Stack: `docker`
- Root tracked files: `2`

### Ports

- none detected

### Domains

- `zcfdash.zeaz.dev` from `apps/zcfdash/docker-compose.yml`

## zcino

- Path: `apps/zcino`
- Stack: `docker`
- Root tracked files: `3145`

### Ports

- `3000` from `apps/zcino/README.md, apps/zcino/frontend/Dockerfile, apps/zcino/frontend/start_next.sh`
- `4222` from `apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `5432` from `apps/zcino/README.md, apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `6379` from `apps/zcino/README.md, apps/zcino/docs/operations.md, apps/zcino/docs/source-checklist.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `6443` from `apps/zcino/release/zeaz_release_v2.sh`
- `8000` from `apps/zcino/Makefile`
- `8080` from `apps/zcino/README.md, apps/zcino/docs/api.md, apps/zcino/docs/operations.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/game-service.yaml`
- `8082` from `apps/zcino/README.md, apps/zcino/infra/docker-compose.yml`
- `8090` from `apps/zcino/README.md, apps/zcino/docker-compose.yml, apps/zcino/docs/source-checklist.md, apps/zcino/k8s/zeaz-testnet/zeaz-node.yaml`
- `8123` from `apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `8222` from `apps/zcino/infra/docker-compose.yml`
- `9000` from `apps/zcino/infra/docker-compose.yml`

### Domains

- `zcino.zeaz.dev` from `apps/zcino/INACTIVE_AFTER_MERGE.md, apps/zcino/docker-compose.yml`

## zcloud

- Path: `apps/zcloud`
- Stack: `node, npm`
- Root tracked files: `28`

### Ports

- `4177` from `apps/zcloud/README.md`
- `5000` from `apps/zcloud/src/app/api/chat/route.ts`
- `11434` from `apps/zcloud/src/app/api/chat/route.ts`
- `18789` from `apps/zcloud/src/app/api/chat/route.ts`

### Domains

- none detected

## zdash

- Path: `apps/zdash`
- Stack: `docker, python`
- Root tracked files: `1128`

### Ports

- `443` from `apps/zdash/install-zdash-prod.sh`
- `587` from `apps/zdash/.env.example, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `3000` from `apps/zdash/infra/k8s/configmap.yaml`
- `5173` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_phase7_dashboard_api.py, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/docs/runbooks/GO_LIVE_CHECKLIST.md, apps/zdash/docs/runbooks/INSTALLATION.md, apps/zdash/docs/runbooks/QUICK_START.md, apps/zdash/docs/runbooks/ROLLBACK_RUNBOOK.md`
- `5432` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_production_safety.py, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/infra/k8s/postgres-statefulset.yaml`
- `5436` from `apps/zdash/docker-compose.prod.yml`
- `6379` from `apps/zdash/infra/k8s/redis-deployment.yaml`
- `8000` from `apps/zdash/Makefile, apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `8005` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/AGENTS.md, apps/zdash/docker-compose.prod.yml, apps/zdash/docker-compose.yml, apps/zdash/docs/AI_TRADER_CONTROL_PLANE.md, apps/zdash/docs/architecture/PHASE_10_SAAS_MONETIZATION.md, apps/zdash/docs/architecture/PHASE_33_AI_TRADER_SIMULATION.md, apps/zdash/docs/releases/final-release-checklist.md, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md`
- `9009` from `apps/zdash/docs/reports/zdash-deep-scan/06-package-make-scripts.txt`
- `9090` from `apps/zdash/docker-compose.prod.yml`
- `16379` from `apps/zdash/docker-compose.prod.yml`
- `16380` from `apps/zdash/.env.example, apps/zdash/scripts/feature-local-env.sh`

### Domains

- `api-zdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/infra/cloudflare/tunnel-config.example.yml, apps/zdash/infra/k8s/nginx-ingress.yaml`
- `release.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile`
- `zdash.zeaz.dev` from `apps/zdash/.env.example, apps/zdash/CODE-OF-CONDUCT.md, apps/zdash/COMMUNITY.md, apps/zdash/CONTRIBUTING.md, apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/SECURITY.md, apps/zdash/backend/app/core/config.py, apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md`

## zdev

- Path: `apps/zdev`
- Stack: `node`
- Root tracked files: `7`

### Ports

- `4181` from `apps/zdev/README.md`

### Domains

- none detected

## zlms

- Path: `apps/zlms`
- Stack: `docker, node, pnpm`
- Root tracked files: `28488`

### Ports

- `131` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `135` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `155` from `apps/zlms/app/courseware/user_guide/searchindex.js, apps/zlms/app/examdb/user_guide/searchindex.js`
- `443` from `apps/zlms/k8s/runtime-security-fabric.yaml, apps/zlms/z-runner/kubernetes/runner-networkpolicy.yaml`
- `3000` from `apps/zlms/app/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-editable/README.md, apps/zlms/docker-compose.yml, apps/zlms/git-tools.sh`
- `4318` from `apps/zlms/k8s/runtime-security-fabric.yaml`
- `8000` from `apps/zlms/app/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/assets/global/plugins/bootstrap-select/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/bootstrap-select/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-select/README.md`
- `8080` from `apps/zlms/UBUNTU_24_04_MANUAL.md, apps/zlms/k8s/runtime-security-fabric.yaml`
- `8888` from `apps/zlms/app/assets/global/plugins/typeahead/README.md, apps/zlms/app/bin/Release/Publish/assets/global/plugins/typeahead/README.md, apps/zlms/app/obj/Release/Package/PackageTmp/assets/global/plugins/typeahead/README.md`
- `9080` from `apps/zlms/z-runner/telemetry/promtail.yaml`
- `9102` from `apps/zlms/z-runner/kubernetes/runner-deployment.yaml, apps/zlms/z-runner/telemetry/otel-config.yaml`

### Domains

- `pgadmin.zeaz.dev` from `apps/zlms/docker-compose.yml`
- `zlms.zeaz.dev` from `apps/zlms/README.md, apps/zlms/docker-compose.yml`

## zoffice

- Path: `apps/zoffice`
- Stack: `docker`
- Root tracked files: `180`

### Ports

- `6901` from `apps/zoffice/docker-compose.yml`
- `8087` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/vo-config.json, apps/zoffice/app/whisper-server.py, apps/zoffice/scripts/feature-local-env.sh`
- `8090` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/TASK-editor-ui.md, apps/zoffice/TASK-furniture-editor.md, apps/zoffice/app/gateway_presence.py, apps/zoffice/skill/SKILL.md, apps/zoffice/tests/crud_test_results.md, apps/zoffice/tests/test_crud_projects.sh, apps/zoffice/tests/test_workflow_e2e.py`
- `8091` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/README.md, apps/zoffice/scripts/feature-local-env.sh`
- `8092` from `apps/zoffice/README.md, apps/zoffice/scripts/feature-local-env.sh`
- `8093` from `apps/zoffice/scripts/feature-local-env.sh`
- `9222` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/app/vo-config.json, apps/zoffice/kasm-browser-config/browser-supervisor.sh, apps/zoffice/kasm-browser-config/start-cdp-proxy.sh`
- `18090` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18091` from `apps/zoffice/.env.example, apps/zoffice/app/Dockerfile`
- `18789` from `apps/zoffice/INTEGRATION-SPEC.md, apps/zoffice/Makefile, apps/zoffice/QA-CODE-QUALITY-SCAN.md, apps/zoffice/README.md, apps/zoffice/app/game.js, apps/zoffice/app/vo-config.json, apps/zoffice/scripts/feature-local-env.sh`

### Domains

- `zoffice.zeaz.dev` from `apps/zoffice/Makefile, apps/zoffice/README.md`

## zquest

- Path: `apps/zquest`
- Stack: `unknown`
- Root tracked files: `5`

### Ports

- `8080` from `apps/zquest/README.md`

### Domains

- none detected

## zsp-aitool

- Path: `apps/zsp-aitool`
- Stack: `docker, node, npm`
- Root tracked files: `766`

### Ports

- `3000` from `apps/zsp-aitool/Dockerfile, apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docker-compose.yml, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/dashboard/products/[id]/similar/page.tsx, apps/zsp-aitool/tests/url-safety.test.ts`
- `3001` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/CLAUDE.md, apps/zsp-aitool/GEMINI.md`
- `5173` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`
- `5174` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5175` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5432` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.github/workflows/build.yml, apps/zsp-aitool/.github/workflows/ci.yml, apps/zsp-aitool/docs/ci-production-readiness-review-2026-05-17.md`
- `5435` from `apps/zsp-aitool/docker-compose.yml`
- `8005` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`

### Domains

- `api-zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/runbooks/PLUGIN_REPO_OPERATIONS.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/scripts/plugins/plugin-validate.sh`
- `api-zveo.zeaz.dev` from `apps/zsp-aitool/docker-compose.yml`
- `app.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `release.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `studio.zeaz.dev` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/GEMINI.md, apps/zsp-aitool/README.md`
- `tunnel.zeaz.dev` from `apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/scripts/plugins/plugin-render-cloudflare.sh`
- `www.zeaz.dev` from `apps/zsp-aitool/docs/ZEAZ_PLATFORM_DESIGN.md`
- `zaiz.zeaz.dev` from `apps/zsp-aitool/README.md, apps/zsp-aitool/docker-compose.yml`
- `zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/zdash/page.tsx`
- `zveo.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`

## zsticker

- Path: `apps/zsticker`
- Stack: `docker, python`
- Root tracked files: `83`

### Ports

- `3008` from `apps/zsticker/Makefile`
- `8000` from `apps/zsticker/Dockerfile`
- `8007` from `apps/zsticker/Makefile`
- `8080` from `apps/zsticker/src/cli/auth_gdrive.py`

### Domains

- `zsticker.zeaz.dev` from `apps/zsticker/src/cli/api.py, apps/zsticker/src/cli/dashboard.py`

## ztrader

- Path: `apps/ztrader`
- Stack: `docker, python`
- Root tracked files: `374`

### Ports

- `375` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `768` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `1920` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `3000` from `apps/ztrader/backend/scripts/legacy_tools/ARCHITECTURE.md, apps/ztrader/backend/scripts/legacy_tools/EXAMPLES.md, apps/ztrader/backend/scripts/legacy_tools/README.md, apps/ztrader/backend/scripts/legacy_tools/README_SCREENSHOTS.md, apps/ztrader/backend/scripts/legacy_tools/package.json, apps/ztrader/backend/scripts/legacy_tools/run_screenshots.sh, apps/ztrader/backend/scripts/legacy_tools/screenshot_pages.js, apps/ztrader/backend/src/ztrader/abt/auth/google_provider.py, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md`
- `3001` from `apps/ztrader/backend/scripts/legacy_tools/EXAMPLES.md, apps/ztrader/backend/scripts/legacy_tools/README.md, apps/ztrader/backend/scripts/legacy_tools/README_SCREENSHOTS.md, apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md, apps/ztrader/backend/src/ztrader/abt/tools/README.md, apps/ztrader/backend/src/ztrader/abt/tools/README_SCREENSHOTS.md`
- `3016` from `apps/ztrader/.env.example, apps/ztrader/backend/src/ztrader/main.py`
- `3017` from `apps/ztrader/frontend/playwright.config.ts`
- `5432` from `apps/ztrader/.env.example, apps/ztrader/backend/.env.example, apps/ztrader/backend/src/ztrader/core/config.py`
- `6379` from `apps/ztrader/.env.example, apps/ztrader/backend/.env.example, apps/ztrader/backend/src/ztrader/abt/api/health_endpoints.py, apps/ztrader/backend/src/ztrader/core/config.py`
- `8000` from `apps/ztrader/backend/Dockerfile, apps/ztrader/backend/src/ztrader/abt/api/tradingview_endpoints.py, apps/ztrader/backend/src/ztrader/api/v1/webhooks.py, apps/ztrader/docker-compose.yml, apps/ztrader/frontend/.env.example, apps/ztrader/frontend/src/app/[lng]/admin/page.tsx, apps/ztrader/frontend/src/app/[lng]/dashboard/page.tsx, apps/ztrader/frontend/src/app/[lng]/settings/page.tsx, apps/ztrader/frontend/src/components/auth/GoogleSignIn.tsx, apps/ztrader/frontend/src/components/settings/NotificationPreferences.tsx`
- `8016` from `apps/ztrader/.env.example`

### Domains

- `api-ztrader.zeaz.dev` from `apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/docker-compose.yml`
- `ztrader.zeaz.dev` from `apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/backend/src/ztrader/api/v1/platform.py, apps/ztrader/backend/src/ztrader/main.py, apps/ztrader/docker-compose.yml`

## zveo

- Path: `apps/zveo`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `241`

### Ports

- `443` from `apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `3000` from `apps/zveo/apps/dashboard/Dockerfile, apps/zveo/docker-compose.yml, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml, apps/zveo/infra/observability/docker-compose.observability.yml`
- `3019` from `apps/zveo/infra/docker/docker-compose.yml`
- `3100` from `apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/loki/loki.yml`
- `3200` from `apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4317` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4318` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4319` from `apps/zveo/infra/observability/docker-compose.observability.yml`
- `5432` from `apps/zveo/drizzle.config.ts, apps/zveo/scripts/db-smoke.sh`
- `5436` from `apps/zveo/infra/docker/docker-compose.yml`
- `6379` from `apps/zveo/apps/zeaz-api-gateway/src/config.ts, apps/zveo/apps/render-worker/src/worker.ts, apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `6382` from `apps/zveo/infra/docker/docker-compose.yml`
- `8000` from `apps/zveo/infra/kubernetes/api.yaml`
- `8080` from `apps/zveo/apps/zeaz-api-gateway/Dockerfile, apps/zveo/apps/zeaz-api-gateway/src/openapi.ts, apps/zveo/apps/dashboard/app/settings/page.tsx, apps/zveo/apps/dashboard/lib/api.test.ts, apps/zveo/apps/dashboard/lib/api.ts, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/docs/openapi/api-gateway.openapi.ts, apps/zveo/infra/docker/docker-compose.yml, apps/zveo/infra/kubernetes/base/api-gateway.yaml, apps/zveo/infra/kubernetes/base/blue-green.yaml`
- `9000` from `apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml`
- `9005` from `apps/zveo/infra/docker/docker-compose.yml`
- `9006` from `apps/zveo/infra/docker/docker-compose.yml`
- `9090` from `apps/zveo/infra/kubernetes/media-worker.yaml, apps/zveo/infra/observability/docker-compose.observability.yml`
- `9093` from `apps/zveo/infra/observability/loki/loki.yml`
- `9095` from `apps/zveo/infra/docker/docker-compose.yml`
- `9100` from `apps/zveo/infra/kubernetes/worker.yaml, apps/zveo/legacy/python-compat/apps/worker_media/Dockerfile`
- `9464` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/docker-compose.observability.yml, apps/zveo/infra/observability/otel-collector/config.yml`
- `13133` from `apps/zveo/infra/kubernetes/production/observability.yaml`

### Domains

- `zveo.zeaz.dev` from `apps/zveo/README.md, apps/zveo/docker-compose.yml, apps/zveo/infra/docker/docker-compose.yml`

## zwallet

- Path: `apps/zwallet`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `456`

### Ports

- `3000` from `apps/zwallet/.env.example, apps/zwallet/apps/zeaz-api/src/server.ts, apps/zwallet/docs/api-spec.yaml, apps/zwallet/infra/helm/templates/api-deployment.yaml, apps/zwallet/infra/k8s/api-deployment.yaml, apps/zwallet/infra/k8s/monitoring.yaml, apps/zwallet/k8s/monitoring/monitoring-stack.yaml`
- `3002` from `apps/zwallet/deploy-zveo-services.sh`
- `4173` from `apps/zwallet/apps/world/README.md`
- `4222` from `apps/zwallet/docker-compose.yml`
- `5432` from `apps/zwallet/.env.example, apps/zwallet/infra/k8s/postgres.yaml`
- `5601` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/infra/observability/docker-compose.siem.yml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `6379` from `apps/zwallet/.env.example, apps/zwallet/admin/panel/enterprise/audit_store.py, apps/zwallet/admin/panel/enterprise/main.py, apps/zwallet/admin/panel/main.py, apps/zwallet/api/app/middleware/security_advanced.py, apps/zwallet/api/app/middleware/security_distributed.py, apps/zwallet/api/app/security/adaptive_rate_limiter.py, apps/zwallet/api/app/security/anomaly_detector.py, apps/zwallet/api/app/security/circuit_breaker.py, apps/zwallet/api/app/security/risk_engine.py`
- `8080` from `apps/zwallet/backend/.env.example, apps/zwallet/backend/services/gateway/Dockerfile, apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml, apps/zwallet/infra/k8s/helm/zwallet/templates/deployment.yaml, apps/zwallet/infra/k8s/helm/zwallet/values.yaml, apps/zwallet/k8s/base/gateway-deployment.yaml, apps/zwallet/k8s/base/gateway-service.yaml`
- `8090` from `apps/zwallet/backend/services/wallet-service/Dockerfile, apps/zwallet/deploy-zveo-services.sh, apps/zwallet/docker-compose.yml`
- `8091` from `apps/zwallet/docker-compose.yml`
- `8092` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/services-apps.yaml`
- `8093` from `apps/zwallet/docker-compose.yml, apps/zwallet/infra/docker/docker-compose.prod.yml`
- `8094` from `apps/zwallet/docker-compose.yml`
- `8095` from `apps/zwallet/backend/services/portfolio-service/Dockerfile, apps/zwallet/docker-compose.yml`
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
- `9090` from `apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/monitoring.yaml, apps/zwallet/infra/k8s/monitoring.yaml`
- `9092` from `apps/zwallet/api/src/infrastructure/kafka.producer.ts, apps/zwallet/infra/k8s/kafka-cluster.yaml, apps/zwallet/infra/k8s/kafka.yaml`
- `9200` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/docker/docker-compose.devops.yml, apps/zwallet/infra/docker/docker-compose.prod.yml, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/infra/observability/docker-compose.siem.yml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `25432` from `apps/zwallet/docker-compose.yml`
- `26380` from `apps/zwallet/docker-compose.yml`

### Domains

- `app.zeaz.dev` from `apps/zwallet/README.md`
