# Phase 53: Hybrid Plugin Integration Evidence
Generated at: $(date -u +'%Y-%m-%dT%H:%M:%SZ')

## 1. Configured Plugins

```
[INFO]  Loaded manifest from /home/zeazdev/zsp-aitool/configs/plugins/repositories.yaml.example

APP_ID          MODE       REPO                 PATH                 ENABLED  DOMAINS                                  PORTS                HEALTH_URLS                             
---------------------------------------------------------------------------------------------------------------------------------------------------------------
zdash           embedded   cvsz/zdash           apps/zdash           Y        zdash.zeaz.dev, api-zdash.zeaz.dev, release.zeaz.dev 3000, 8005, 5173     http://localhost:5173/health, http://localhost:8005/health
zveo            external   cvsz/zveo            external/zveo        Y        zveo.zeaz.dev                            8006, 5174           http://localhost:5174/health            
zwallet         external   cvsz/zwallet         external/zwallet     Y        app.zeaz.dev                             8007, 5175           http://localhost:5175/health            
```

## 2. Plugin Health Check

```markdown
Health report not found.
```

## 3. Rendered Cloudflare Intent

### Ingress
```yaml
# Auto-generated ingress rules for Cloudflare Tunnel
ingress:
  - hostname: zdash.zeaz.dev
    service: http://localhost:3000
  - hostname: api-zdash.zeaz.dev
    service: http://localhost:3000
  - hostname: release.zeaz.dev
    service: http://localhost:3000
  - hostname: zveo.zeaz.dev
    service: http://localhost:5174
  - hostname: app.zeaz.dev
    service: http://localhost:5175
  - service: http_status:404
```

### DNS Intent
```yaml
# Auto-generated DNS records intent
dns_records:
  # Plugin: zdash
  - name: zdash.zeaz.dev
    type: CNAME
    content: tunnel.zeaz.dev
    proxied: true
    zone: zeaz.dev
  - name: api-zdash.zeaz.dev
    type: CNAME
    content: tunnel.zeaz.dev
    proxied: true
    zone: zeaz.dev
  - name: release.zeaz.dev
    type: CNAME
    content: tunnel.zeaz.dev
    proxied: true
    zone: zeaz.dev
  # Plugin: zveo
  - name: zveo.zeaz.dev
    type: CNAME
    content: tunnel.zeaz.dev
    proxied: true
    zone: zeaz.dev
  # Plugin: zwallet
  - name: app.zeaz.dev
    type: CNAME
    content: tunnel.zeaz.dev
    proxied: true
    zone: zeaz.dev
```

## 4. Git Status

```
 M Makefile
 M package.json
 M src/app/globals.css
 M src/app/layout.tsx
 M src/components/shopee/ShopeeAffiliateControlCenter.tsx
 M tailwind.config.ts
?? configs/
?? docs/ZEAZ_PLATFORM_DESIGN.md
?? docs/architecture/
?? docs/prompts/phase53-hybrid-plugin-integration.prompt
?? docs/reports/
?? docs/runbooks/PLUGIN_REPO_OPERATIONS.md
?? generated/
?? scripts/plugins/
?? src/components/shopee/InstagramQuickComposerCard.tsx
?? src/components/shopee/ShopeeAffiliateControlCenter.tsx.backup
?? src/components/shopee/ThreadsQuickComposerCard.tsx
?? src/components/shopee/XQuickComposerCard.tsx
?? src/components/shopee/YoutubeShortsQuickComposerCard.tsx
?? src/components/shopee/draftBuilders.ts
?? typecheck_report.txt
```
