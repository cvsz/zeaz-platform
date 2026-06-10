# Apps stack inventory

| App | Stack | Tracked | Ports detected | Domains detected |
|---|---|---:|---|---|
| ABTPi18n | `docker, node, pnpm, python` | 262 | `375, 587, 768, 1920, 3000, 3001, 5432, 6379, 6432, 8000, 9090, 22022` | `-` |
| api | `docker, python` | 13 | `6379, 8000` | `api-zcfdash.zeaz.dev, api.zeaz.dev, zcfdash.zeaz.dev` |
| openwork | `docker, node, npm, pnpm` | 1679 | `443, 587, 1234, 3000, 3001, 3005, 3306, 3333, 3978, 4096, 4321, 5173, 5432, 6000, 6080, 6379, 8080, 8090, 8787, 8788, 8789, 8790, 8791, 9222, 9223, 9823, 9825, 9830, 11434, 18801, 19876, 48123, 49999, 52431, 54235, 59673, 59674, 59675` | `openwork.zeaz.dev` |
| web | `node, npm, pnpm` | 49 | `8000` | `api-zcfdash.zeaz.dev, api-zdash.zeaz.dev, app.zeaz.dev, ssh.zeaz.dev, www.zeaz.dev, zcfdash.zeaz.dev, zcino.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` |
| zAcademy | `node, npm` | 133 | `443, 3009, 4317, 8084, 9090` | `auth.zeaz.dev` |
| zLinebot | `node` | 13 | `4113` | `zlinebot.zeaz.dev` |
| zcfdash | `docker` | 2 | `-` | `zcfdash.zeaz.dev` |
| zcino | `docker` | 3119 | `3000, 3020, 4222, 4225, 5432, 5437, 6379, 6383, 6443, 8080, 8082, 8086, 8087, 8090, 8123, 8125, 8222, 8225, 9007` | `zcino.zeaz.dev` |
| zcino-modern | `docker` | 208 | `3000, 4222, 5432, 6379, 6443, 8080, 8082, 8090, 8123, 8222, 9000` | `zcino.zeaz.dev` |
| zcloud | `node, npm` | 18 | `5000, 11434, 18789` | `-` |
| zdash | `docker, python` | 1123 | `443, 587, 3000, 5173, 5432, 6379, 8000, 8005, 9009, 16380` | `api-zdash.zeaz.dev, release.zeaz.dev, zdash.zeaz.dev` |
| zkbtrader | `docker, node, npm, python` | 77 | `443, 3000, 3306, 4567, 5053, 5432, 5555, 5672, 6379, 8000, 8004, 8080, 8123, 8200, 9000, 11434, 15432, 16379, 18801, 50051, 51820, 65535` | `-` |
| zlms-prod | `docker, node, npm, pnpm` | 30846 | `131, 135, 155, 443, 3000, 4318, 8000, 8080, 8888, 9080, 9102` | `zlms.zeaz.dev` |
| zoffice | `docker` | 138 | `6901, 8087, 8090, 8091, 8092, 8093, 9222, 18090, 18091, 18789` | `zoffice.zeaz.dev` |
| zsp-aitool | `docker, node, npm` | 1 | `3000, 3001, 5173, 5174, 5175, 5432, 8005` | `api-zdash.zeaz.dev, api-zveo.zeaz.dev, app.zeaz.dev, release.zeaz.dev, studio.zeaz.dev, tunnel.zeaz.dev, www.zeaz.dev, zaiz.zeaz.dev, zdash-api.zeaz.dev, zdash.zeaz.dev, zveo.zeaz.dev` |
| zsticker | `docker, python` | 83 | `3008, 8000, 8007, 8080` | `zsticker.zeaz.dev` |
| ztrader | `docker, python` | 287 | `375, 768, 1920, 3000, 3001, 3016, 5432, 6379, 8000, 8016` | `api-ztrader.zeaz.dev, ztrader.zeaz.dev` |
| zveo | `docker, node, pnpm, python` | 1 | `443, 3000, 3100, 3200, 4317, 4318, 5432, 6379, 8000, 8080, 9000, 9090, 9093, 9100, 9464, 13133` | `zveo.zeaz.dev` |
| zwallet | `docker, node, pnpm, python` | 452 | `3000, 3002, 4173, 5432, 5601, 6379, 8080, 8090, 8091, 8092, 8093, 8094, 8095, 8096, 8097, 8098, 8099, 8100, 8200, 8332, 8545, 8546, 8899, 9090, 9092, 9200` | `app.zeaz.dev` |

## ABTPi18n

- Path: `apps/ABTPi18n`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `262`

### Ports

- `375` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `587` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `768` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `1920` from `apps/ABTPi18n/tools/ARCHITECTURE.md`
- `3000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/apps/backend/main.py, apps/ABTPi18n/apps/backend/src/auth/google_provider.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md`
- `3001` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/enterprise/TROUBLESHOOTING.en.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md, apps/ABTPi18n/tools/EXAMPLES.md, apps/ABTPi18n/tools/README.md`
- `5432` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/DEPLOYMENT.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md`
- `6379` from `apps/ABTPi18n/apps/backend/src/api/health_endpoints.py, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_GUIDE.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase1/PHASE1_SUMMARY.md`
- `6432` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md`
- `8000` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/Grok.md, apps/ABTPi18n/apps/backend/Dockerfile, apps/ABTPi18n/apps/backend/src/api/tradingview_endpoints.py, apps/ABTPi18n/apps/frontend/src/app/[lng]/dashboard/page.tsx, apps/ABTPi18n/apps/frontend/src/app/[lng]/settings/page.tsx, apps/ABTPi18n/apps/frontend/src/components/auth/GoogleSignIn.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/NotificationPreferences.tsx, apps/ABTPi18n/apps/frontend/src/components/settings/TelegramLink.tsx, apps/ABTPi18n/docs/TRADINGVIEW_SUMMARY.md`
- `9090` from `apps/ABTPi18n/docs/enterprise/CONFIGURATION.en.md, apps/ABTPi18n/docs/enterprise/CONFIGURATION.th.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.en.md, apps/ABTPi18n/docs/enterprise/GETTING_STARTED.th.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_GUIDE.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_IMPLEMENTATION_SUMMARY.md, apps/ABTPi18n/docs/phases/phase2/PHASE2_SUMMARY.md`
- `22022` from `apps/ABTPi18n/.env.example, apps/ABTPi18n/docker-compose.yml`

### Domains

- none detected

## api

- Path: `apps/api`
- Stack: `docker, python`
- Root tracked files: `13`

### Ports

- `6379` from `apps/api/routers/scheduler.py, apps/api/routers/swarm.py`
- `8000` from `apps/api/docker-compose.yml`

### Domains

- `api-zcfdash.zeaz.dev` from `apps/api/routers/cloudflare_control.py`
- `api.zeaz.dev` from `apps/api/README.md, apps/api/docker-compose.yml`
- `zcfdash.zeaz.dev` from `apps/api/routers/cloudflare_control.py`

## openwork

- Path: `apps/openwork`
- Stack: `docker, node, npm, pnpm`
- Root tracked files: `1679`

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
- `5432` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `6000` from `apps/openwork/apps/server/src/opencode-connection.test.ts`
- `6080` from `apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh`
- `6379` from `apps/openwork/scripts/harness/agents/opensource-forker.md`
- `8080` from `apps/openwork/apps/server/src/validators.test.ts, apps/openwork/scripts/harness/agents/opensource-forker.md, apps/openwork/scripts/harness/commands/rust-test.md`
- `8090` from `apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-recording-artifacts/SKILL.md`
- `8787` from `apps/openwork/apps/app/scripts/remote-workspace-diagnostics.test.ts, apps/openwork/apps/app/src/app/lib/openwork-server.ts, apps/openwork/apps/app/tests/openwork-env-runtime.test.ts, apps/openwork/apps/server/src/config.ts, apps/openwork/apps/server/src/extensions/google-workspace.test.ts, apps/openwork/apps/server/src/tokens.test.ts, apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/docker/docker-compose.dev.yml, apps/openwork/scripts/build-microsandbox-openwork-image.sh`
- `8788` from `apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.opencode/skills/daytona-seeded-cloud-demo/SKILL.md, apps/openwork/evals/cloud-admin-to-member-assignment-flows.md, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8789` from `apps/openwork/ee/apps/den-worker-proxy/.env.example, apps/openwork/packaging/docker/docker-compose.den-dev.yml`
- `8790` from `apps/openwork/ee/apps/den-api/.env.example, apps/openwork/ee/apps/den-api/test/github-webhook.test.ts, apps/openwork/ee/apps/den-api/test/internal-mcp-principal.test.ts, apps/openwork/ee/apps/den-api/test/org-invitations.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-access.test.ts, apps/openwork/ee/apps/den-api/test/plugin-system-cross-org-idor.test.ts, apps/openwork/packaging/docker/README.md, apps/openwork/packaging/systemd/openwork.env.example`
- `8791` from `apps/openwork/apps/server/src/embedded.ts, apps/openwork/ee/apps/den-api/src/env.ts, apps/openwork/ee/apps/inference/.env.example, apps/openwork/ee/apps/inference/src/models/openwork-dev.json, apps/openwork/packaging/systemd/openwork.env.example`
- `9222` from `apps/openwork/.opencode/skills/daytona-chrome-cdp/SKILL.md`
- `9223` from `apps/openwork/evals/browser-extension-flows.md`
- `9823` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md, apps/openwork/evals/openable-items-flow.md, apps/openwork/evals/react-session-flows.md, apps/openwork/packaging/systemd/openwork.env.example, apps/openwork/scripts/openwork-debug.sh`
- `9825` from `apps/openwork/.devcontainer/README.md, apps/openwork/.devcontainer/docker-compose.yml, apps/openwork/.devcontainer/start-services.sh, apps/openwork/.devcontainer/test-on-daytona.sh, apps/openwork/.opencode/skills/daytona-dev/SKILL.md, apps/openwork/.opencode/skills/daytona-electron-test/SKILL.md, apps/openwork/.opencode/skills/run-evals/SKILL.md, apps/openwork/evals/README.md, apps/openwork/evals/daytona-flows.md`
- `9830` from `apps/openwork/.opencode/skills/browser-automation/SKILL.md`
- `11434` from `apps/openwork/apps/app/src/app/extensions.ts, apps/openwork/apps/app/src/react-app/domains/settings/openai-image-extension.ts, apps/openwork/apps/server/src/jsonc.test.ts, apps/openwork/ee/apps/den-api/src/routes/org/plugin-system/store.ts`
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

- `openwork.zeaz.dev` from `apps/openwork/README.md`

## web

- Path: `apps/web`
- Stack: `node, npm, pnpm`
- Root tracked files: `49`

### Ports

- `8000` from `apps/web/src/app/swarm-runtime/page.tsx, apps/web/src/lib/api.ts`

### Domains

- `api-zcfdash.zeaz.dev` from `apps/web/src/app/dashboard/page.tsx`
- `api-zdash.zeaz.dev` from `apps/web/src/app/reports/page.tsx`
- `app.zeaz.dev` from `apps/web/src/app/loading.tsx, apps/web/src/app/reports/page.tsx`
- `ssh.zeaz.dev` from `apps/web/src/app/reports/page.tsx`
- `www.zeaz.dev` from `apps/web/README.md, apps/web/src/app/reports/page.tsx`
- `zcfdash.zeaz.dev` from `apps/web/src/app/dashboard/page.tsx`
- `zcino.zeaz.dev` from `apps/web/src/app/reports/page.tsx`
- `zdash.zeaz.dev` from `apps/web/src/app/reports/page.tsx`
- `zveo.zeaz.dev` from `apps/web/src/app/reports/page.tsx`

## zAcademy

- Path: `apps/zAcademy`
- Stack: `node, npm`
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
- Stack: `node`
- Root tracked files: `13`

### Ports

- `4113` from `apps/zLinebot/.env.example`

### Domains

- `zlinebot.zeaz.dev` from `apps/zLinebot/cloudflared/config.yml`

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
- Root tracked files: `3119`

### Ports

- `3000` from `apps/zcino/frontend/Dockerfile`
- `3020` from `apps/zcino/frontend/start_next.sh`
- `4222` from `apps/zcino/docs/source-checklist.md, apps/zcino/k8s/baseline/network-policies.yaml`
- `4225` from `apps/zcino/infra/docker-compose.yml`
- `5432` from `apps/zcino/docs/source-checklist.md, apps/zcino/k8s/baseline/network-policies.yaml`
- `5437` from `apps/zcino/infra/docker-compose.yml`
- `6379` from `apps/zcino/docs/operations.md, apps/zcino/docs/source-checklist.md, apps/zcino/k8s/baseline/network-policies.yaml`
- `6383` from `apps/zcino/infra/docker-compose.yml`
- `6443` from `apps/zcino/release/zeaz_release_v2.sh`
- `8080` from `apps/zcino/docs/api.md, apps/zcino/docs/operations.md, apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/game-service.yaml`
- `8082` from `apps/zcino/infra/docker-compose.yml`
- `8086` from `apps/zcino/frontend/start_next.sh, apps/zcino/infra/docker-compose.yml`
- `8087` from `apps/zcino/infra/docker-compose.yml`
- `8090` from `apps/zcino/docker-compose.yml, apps/zcino/docs/source-checklist.md, apps/zcino/k8s/zeaz-testnet/zeaz-node.yaml`
- `8123` from `apps/zcino/infra/docker-compose.yml, apps/zcino/k8s/baseline/network-policies.yaml`
- `8125` from `apps/zcino/infra/docker-compose.yml`
- `8222` from `apps/zcino/infra/docker-compose.yml`
- `8225` from `apps/zcino/infra/docker-compose.yml`
- `9007` from `apps/zcino/infra/docker-compose.yml`

### Domains

- `zcino.zeaz.dev` from `apps/zcino/README.md, apps/zcino/docker-compose.yml`

## zcino-modern

- Path: `apps/zcino-modern`
- Stack: `docker`
- Root tracked files: `208`

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

- `zcino.zeaz.dev` from `apps/zcino-modern/INACTIVE_AFTER_MERGE.md`

## zcloud

- Path: `apps/zcloud`
- Stack: `node, npm`
- Root tracked files: `18`

### Ports

- `5000` from `apps/zcloud/src/app/api/chat/route.ts`
- `11434` from `apps/zcloud/src/app/api/chat/route.ts`
- `18789` from `apps/zcloud/src/app/api/chat/route.ts`

### Domains

- none detected

## zdash

- Path: `apps/zdash`
- Stack: `docker, python`
- Root tracked files: `1123`

### Ports

- `443` from `apps/zdash/install-zdash-prod.sh`
- `587` from `apps/zdash/.env.example, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `3000` from `apps/zdash/infra/k8s/configmap.yaml`
- `5173` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/app/core/config.py, apps/zdash/backend/app/tests/test_phase7_dashboard_api.py, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/docs/runbooks/GO_LIVE_CHECKLIST.md, apps/zdash/docs/runbooks/INSTALLATION.md, apps/zdash/docs/runbooks/QUICK_START.md, apps/zdash/docs/runbooks/ROLLBACK_RUNBOOK.md`
- `5432` from `apps/zdash/.github/workflows/e2e.yml, apps/zdash/backend/app/tests/test_production_safety.py, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt, apps/zdash/infra/k8s/postgres-statefulset.yaml`
- `6379` from `apps/zdash/infra/k8s/redis-deployment.yaml`
- `8000` from `apps/zdash/Makefile, apps/zdash/docs/prompts/AI_CODING_PROMPTS_INDEX.md, apps/zdash/docs/reports/zdash-deep-scan/05-env-vars.txt`
- `8005` from `apps/zdash/.env.example, apps/zdash/.github/workflows/e2e.yml, apps/zdash/AGENTS.md, apps/zdash/docker-compose.prod.yml, apps/zdash/docker-compose.yml, apps/zdash/docs/AI_TRADER_CONTROL_PLANE.md, apps/zdash/docs/architecture/PHASE_10_SAAS_MONETIZATION.md, apps/zdash/docs/architecture/PHASE_33_AI_TRADER_SIMULATION.md, apps/zdash/docs/releases/final-release-checklist.md, apps/zdash/docs/reports/zdash-deep-dive-review-audit-2026-05-30.md`
- `9009` from `apps/zdash/docs/reports/zdash-deep-scan/06-package-make-scripts.txt`
- `16380` from `apps/zdash/.env.example, apps/zdash/scripts/feature-local-env.sh`

### Domains

- `api-zdash.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/infra/cloudflare/tunnel-config.example.yml, apps/zdash/infra/k8s/nginx-ingress.yaml`
- `release.zeaz.dev` from `apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile`
- `zdash.zeaz.dev` from `apps/zdash/.env.example, apps/zdash/CODE-OF-CONDUCT.md, apps/zdash/COMMUNITY.md, apps/zdash/CONTRIBUTING.md, apps/zdash/IMPORT_SOURCE.md, apps/zdash/Makefile, apps/zdash/README.md, apps/zdash/SECURITY.md, apps/zdash/backend/app/core/config.py, apps/zdash/docs/ops/SIGNED_RELEASE_ATTESTATION.md`

## zkbtrader

- Path: `apps/zkbtrader`
- Stack: `docker, node, npm, python`
- Root tracked files: `77`

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
- `8004` from `apps/zkbtrader/.env.example, apps/zkbtrader/docs/prompt/zkbtrader-ecc-next.md`
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
- Stack: `docker, node, npm, pnpm`
- Root tracked files: `30846`

### Ports

- `131` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `135` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `155` from `apps/zlms-prod/app/courseware/user_guide/searchindex.js, apps/zlms-prod/app/examdb/user_guide/searchindex.js`
- `443` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml, apps/zlms-prod/z-runner/kubernetes/runner-networkpolicy.yaml`
- `3000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-editable/README.md, apps/zlms-prod/docker-compose.yml, apps/zlms-prod/git-tools.sh`
- `4318` from `apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `8000` from `apps/zlms-prod/app/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/bootstrap-select/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-pwstrength/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/bootstrap-select/README.md`
- `8080` from `apps/zlms-prod/UBUNTU_24_04_MANUAL.md, apps/zlms-prod/k8s/runtime-security-fabric.yaml`
- `8888` from `apps/zlms-prod/app/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/bin/Release/Publish/assets/global/plugins/typeahead/README.md, apps/zlms-prod/app/obj/Release/Package/PackageTmp/assets/global/plugins/typeahead/README.md`
- `9080` from `apps/zlms-prod/z-runner/telemetry/promtail.yaml`
- `9102` from `apps/zlms-prod/z-runner/kubernetes/runner-deployment.yaml, apps/zlms-prod/z-runner/telemetry/otel-config.yaml`

### Domains

- `zlms.zeaz.dev` from `apps/zlms-prod/README.md, apps/zlms-prod/docker-compose.yml`

## zoffice

- Path: `apps/zoffice`
- Stack: `docker`
- Root tracked files: `138`

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

## zsp-aitool

- Path: `apps/zsp-aitool`
- Stack: `docker, node, npm`
- Root tracked files: `1`

### Ports

- `3000` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docker-compose.yml, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/dashboard/products/[id]/similar/page.tsx, apps/zsp-aitool/tests/url-safety.test.ts`
- `3001` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/CLAUDE.md, apps/zsp-aitool/GEMINI.md`
- `5173` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`
- `5174` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5175` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `5432` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.github/workflows/build.yml, apps/zsp-aitool/.github/workflows/ci.yml, apps/zsp-aitool/docs/ci-production-readiness-review-2026-05-17.md`
- `8005` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/docs/reports/generated/plugin-health.md`

### Domains

- `api-zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `api-zveo.zeaz.dev` from `apps/zsp-aitool/docker-compose.yml`
- `app.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `release.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`
- `studio.zeaz.dev` from `apps/zsp-aitool/.env.example, apps/zsp-aitool/.zagents/README-omnibus.md, apps/zsp-aitool/.zagents/README.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-110147.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS-20260522-111315.md, apps/zsp-aitool/.zagents/reports/RELEASE_READINESS.latest.md, apps/zsp-aitool/.zagents/zsp-agent-omnibus-oneclick.sh, apps/zsp-aitool/AGENTS.md, apps/zsp-aitool/GEMINI.md, apps/zsp-aitool/README.md`
- `tunnel.zeaz.dev` from `apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/scripts/plugins/plugin-render-cloudflare.sh`
- `www.zeaz.dev` from `apps/zsp-aitool/docs/ZEAZ_PLATFORM_DESIGN.md`
- `zaiz.zeaz.dev` from `apps/zsp-aitool/docker-compose.yml`
- `zdash-api.zeaz.dev` from `apps/zsp-aitool/docs/runbooks/PLUGIN_REPO_OPERATIONS.md, apps/zsp-aitool/scripts/plugins/plugin-validate.sh`
- `zdash.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml, apps/zsp-aitool/src/app/zdash/page.tsx`
- `zveo.zeaz.dev` from `apps/zsp-aitool/configs/plugins/repositories.example.yaml, apps/zsp-aitool/configs/plugins/repositories.yaml.example, apps/zsp-aitool/docs/reports/generated/phase53-plugin-integration-evidence.md, apps/zsp-aitool/generated/cloudflare/plugins-dns-intent.yaml, apps/zsp-aitool/generated/cloudflare/plugins-ingress.yml`

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
- Root tracked files: `287`

### Ports

- `375` from `apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `768` from `apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `1920` from `apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md`
- `3000` from `apps/ztrader/backend/src/ztrader/abt/auth/google_provider.py, apps/ztrader/backend/src/ztrader/abt/tools/ARCHITECTURE.md, apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md, apps/ztrader/backend/src/ztrader/abt/tools/README.md, apps/ztrader/backend/src/ztrader/abt/tools/README_SCREENSHOTS.md, apps/ztrader/backend/src/ztrader/abt/tools/package.json, apps/ztrader/backend/src/ztrader/abt/tools/run_screenshots.sh, apps/ztrader/backend/src/ztrader/abt/tools/screenshot_pages.js, apps/ztrader/docker-compose.yml`
- `3001` from `apps/ztrader/backend/src/ztrader/abt/tools/EXAMPLES.md, apps/ztrader/backend/src/ztrader/abt/tools/README.md, apps/ztrader/backend/src/ztrader/abt/tools/README_SCREENSHOTS.md`
- `3016` from `apps/ztrader/.env.example`
- `5432` from `apps/ztrader/.env.example, apps/ztrader/backend/src/ztrader/core/config.py`
- `6379` from `apps/ztrader/.env.example, apps/ztrader/backend/src/ztrader/abt/api/health_endpoints.py, apps/ztrader/backend/src/ztrader/core/config.py`
- `8000` from `apps/ztrader/backend/Dockerfile, apps/ztrader/backend/src/ztrader/abt/api/tradingview_endpoints.py, apps/ztrader/backend/src/ztrader/main.py, apps/ztrader/docker-compose.yml, apps/ztrader/frontend/src/app/[lng]/admin/page.tsx, apps/ztrader/frontend/src/app/[lng]/dashboard/page.tsx, apps/ztrader/frontend/src/app/[lng]/settings/page.tsx, apps/ztrader/frontend/src/components/auth/GoogleSignIn.tsx, apps/ztrader/frontend/src/components/settings/NotificationPreferences.tsx, apps/ztrader/frontend/src/components/settings/TelegramLink.tsx`
- `8016` from `apps/ztrader/.env.example`

### Domains

- `api-ztrader.zeaz.dev` from `apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/docker-compose.yml`
- `ztrader.zeaz.dev` from `apps/ztrader/.env.example, apps/ztrader/Makefile, apps/ztrader/docker-compose.yml`

## zveo

- Path: `apps/zveo`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `1`

### Ports

- `443` from `apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `3000` from `apps/zveo/README.md, apps/zveo/docker-compose.yml, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml`
- `3100` from `apps/zveo/infra/observability/loki/loki.yml`
- `3200` from `apps/zveo/infra/observability/tempo/tempo.yml`
- `4317` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `4318` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/otel-collector/config.yml, apps/zveo/infra/observability/tempo/tempo.yml`
- `5432` from `apps/zveo/drizzle.config.ts, apps/zveo/scripts/db-smoke.sh`
- `6379` from `apps/zveo/apps/api-gateway/src/config.ts, apps/zveo/apps/api_gateway/main.py, apps/zveo/apps/render-worker/src/worker.ts, apps/zveo/apps/worker_render/main.py, apps/zveo/infra/kubernetes/base/network-policy.yaml`
- `8000` from `apps/zveo/apps/api_gateway/Dockerfile, apps/zveo/infra/kubernetes/api.yaml`
- `8080` from `apps/zveo/README.md, apps/zveo/apps/api-gateway/src/openapi.ts, apps/zveo/apps/dashboard/app/settings/page.tsx, apps/zveo/apps/dashboard/lib/api.test.ts, apps/zveo/apps/dashboard/lib/api.ts, apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/docs/openapi/api-gateway.openapi.ts, apps/zveo/infra/docker/docker-compose.yml, apps/zveo/infra/kubernetes/base/api-gateway.yaml, apps/zveo/infra/kubernetes/base/blue-green.yaml`
- `9000` from `apps/zveo/docs/architecture/node-only-profile.md, apps/zveo/infra/docker/docker-compose.yml`
- `9090` from `apps/zveo/infra/kubernetes/media-worker.yaml`
- `9093` from `apps/zveo/infra/observability/loki/loki.yml`
- `9100` from `apps/zveo/infra/kubernetes/worker.yaml`
- `9464` from `apps/zveo/infra/kubernetes/production/observability.yaml, apps/zveo/infra/observability/otel-collector/config.yml`
- `13133` from `apps/zveo/infra/kubernetes/production/observability.yaml`

### Domains

- `zveo.zeaz.dev` from `apps/zveo/docker-compose.yml, apps/zveo/infra/docker/docker-compose.yml`

## zwallet

- Path: `apps/zwallet`
- Stack: `docker, node, pnpm, python`
- Root tracked files: `452`

### Ports

- `3000` from `apps/zwallet/.env.example, apps/zwallet/apps/api/src/server.ts, apps/zwallet/docs/api-spec.yaml, apps/zwallet/infra/helm/templates/api-deployment.yaml, apps/zwallet/infra/k8s/api-deployment.yaml, apps/zwallet/infra/k8s/monitoring.yaml, apps/zwallet/k8s/monitoring/monitoring-stack.yaml`
- `3002` from `apps/zwallet/deploy-zveo-services.sh`
- `4173` from `apps/zwallet/apps/world/README.md`
- `5432` from `apps/zwallet/.env.example, apps/zwallet/infra/k8s/postgres.yaml`
- `5601` from `apps/zwallet/dashboard/README.md, apps/zwallet/infra/k8s/base/logging-elk.yaml, apps/zwallet/k8s/logging/elk-stack.yaml`
- `6379` from `apps/zwallet/.env.example, apps/zwallet/admin/panel/enterprise/audit_store.py, apps/zwallet/admin/panel/enterprise/main.py, apps/zwallet/admin/panel/main.py, apps/zwallet/api/app/middleware/security_advanced.py, apps/zwallet/api/app/middleware/security_distributed.py, apps/zwallet/api/app/security/adaptive_rate_limiter.py, apps/zwallet/api/app/security/anomaly_detector.py, apps/zwallet/api/app/security/circuit_breaker.py, apps/zwallet/api/app/security/risk_engine.py`
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

- `app.zeaz.dev` from `apps/zwallet/README.md`
