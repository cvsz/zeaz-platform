# Apps Public URL List

Last updated: 2026-07-01

This document lists the active `apps/*` public directory URLs intended to run behind Cloudflare for `zeaz.dev`.

Source of truth: `configs/platform/apps-public-url-list.json`.

Cloudflare ownership:

- `www.zeaz.dev` is served by `workers/zeaz-loading`.
- App hostnames are Cloudflare Tunnel-owned unless explicitly marked otherwise.
- This list is local routing evidence. Publishing it to Cloudflare still requires explicit operator approval.

| App | Path | URL | Cloudflare runtime |
|---|---|---|---|
| api | `apps/api` | `https://api.zeaz.dev` | tunnel |
| ShipGenAI | `apps/ShipGenAI` | `https://shipgenai.zeaz.dev` | tunnel |
| zacademy | `apps/zacademy` | `https://academy.zeaz.dev` | tunnel |
| zai | `apps/zai` | `https://zai.zeaz.dev` | tunnel |
| zai-coder | `apps/zai-coder` | `https://zai-coder.zeaz.dev` | tunnel |
| zai-factory | `apps/zai-factory` | `https://factory.zeaz.dev` | tunnel |
| zaiz | `apps/zaiz` | `https://zaiz.zeaz.dev` | tunnel |
| zcfdash | `apps/zcfdash` | `https://zcfdash.zeaz.dev` | tunnel |
| zchat | `apps/zchat` | `https://zchat.zeaz.dev` | tunnel |
| zcino | `apps/zcino` | `https://zcino.zeaz.dev` | tunnel |
| zcloud | `apps/zcloud` | `https://zcloud.zeaz.dev` | tunnel |
| zdash | `apps/zdash` | `https://zdash.zeaz.dev` | tunnel |
| zdev | `apps/zdev` | `https://zdev.zeaz.dev` | tunnel |
| zeaz-api | `apps/zeaz-api` | `https://zeaz-api.zeaz.dev` | tunnel |
| zeaz-web | `apps/zeaz-web` | `https://www.zeaz.dev` | worker |
| zfbauto | `apps/zfbauto` | `https://zfbauto.zeaz.dev` | tunnel |
| zlinebot | `apps/zlinebot` | `https://linebot.zeaz.dev` | tunnel |
| zlms | `apps/zlms` | `https://zlms.zeaz.dev` | tunnel |
| zoffice | `apps/zoffice` | `https://zoffice.zeaz.dev` | tunnel |
| zorg | `apps/zorg` | `https://zorg.zeaz.dev` | tunnel |
| zow | `apps/zow` | `https://zow.zeaz.dev` | tunnel |
| zquest | `apps/zquest` | `https://zquest.zeaz.dev` | tunnel |
| zsp-aitool | `apps/zsp-aitool` | `https://zsp-aitool.zeaz.dev` | tunnel |
| zsticker | `apps/zsticker` | `https://zsticker.zeaz.dev` | tunnel |
| ztrader | `apps/ztrader` | `https://ztrader.zeaz.dev` | tunnel |
| zveo | `apps/zveo` | `https://zveo.zeaz.dev` | tunnel |
| zwallet | `apps/zwallet` | `https://zwallet.zeaz.dev` | tunnel |

Validation:

```bash
node scripts/platform/validate-apps-public-url-list.mjs
```
