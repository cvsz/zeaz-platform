# Apps Cloudflare Runtime Probe

Generated: 2026-06-30T19:56:28.602Z

Source registry: `configs/platform/apps-public-url-list.json`

Summary:

- Total apps: 27
- Cloudflare edge confirmed: 27
- Not confirmed: 0

| App | Path | URL | Runtime | HTTP | Edge | Evidence |
|---|---|---|---|---:|---|---|
| api | `apps/api` | https://api.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbdea89f7b68-BKK |
| ShipGenAI | `apps/ShipGenAI` | https://shipgenai.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbe15f4dee39-BKK |
| zacademy | `apps/zacademy` | https://academy.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbe278ea7b66-BKK |
| zai | `apps/zai` | https://zai.zeaz.dev | tunnel | 502 | PASS | cf-ray a13fbbe3abd77b48-BKK |
| zai-coder | `apps/zai-coder` | https://zai-coder.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbe5ea457b52-BKK |
| zai-factory | `apps/zai-factory` | https://factory.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbe719c4ee62-BKK |
| zaiz | `apps/zaiz` | https://zaiz.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbe828167b40-BKK |
| zcfdash | `apps/zcfdash` | https://zcfdash.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbe9ecaf7b70-BKK |
| zchat | `apps/zchat` | https://zchat.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbebce957b5c-BKK |
| zcino | `apps/zcino` | https://zcino.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbeceb267b6c-BKK |
| zcloud | `apps/zcloud` | https://zcloud.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbeea803ee21-BKK |
| zdash | `apps/zdash` | https://zdash.zeaz.dev | tunnel | 200 | PASS | cf-ray a13fbbf058847b48-BKK |
| zdev | `apps/zdev` | https://zdev.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbf228037b66-BKK |
| zeaz-api | `apps/zeaz-api` | https://zeaz-api.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbf33b307b42-BKK |
| zeaz-web | `apps/zeaz-web` | https://www.zeaz.dev | worker | 200 | PASS | cf-ray a13fbbf44b39ee2d-BKK |
| zfbauto | `apps/zfbauto` | https://zfbauto.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbf55bcdee2d-BKK |
| zlinebot | `apps/zlinebot` | https://linebot.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbf738ce7b68-BKK |
| zlms | `apps/zlms` | https://zlms.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbf849837b3e-BKK |
| zoffice | `apps/zoffice` | https://zoffice.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbfa5d287b70-BKK |
| zorg | `apps/zorg` | https://zorg.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbfc49ab7b40-BKK |
| zow | `apps/zow` | https://zow.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbbfd4c13ee3d-BKK |
| zquest | `apps/zquest` | https://zquest.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbfec9f87b70-BKK |
| zsp-aitool | `apps/zsp-aitool` | https://zsp-aitool.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbbffd95bee66-BKK |
| zsticker | `apps/zsticker` | https://zsticker.zeaz.dev | tunnel | 530 | PASS | cf-ray a13fbc00ceeeee25-BKK |
| ztrader | `apps/ztrader` | https://ztrader.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbc01d8c27b4a-BKK |
| zveo | `apps/zveo` | https://zveo.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbc03cfab7b40-BKK |
| zwallet | `apps/zwallet` | https://zwallet.zeaz.dev | tunnel | 404 | PASS | cf-ray a13fbc063ae87b6a-BKK |

Notes:

- This is a read-only probe.
- DNS resolution uses Cloudflare DNS-over-HTTPS to avoid local host overrides.
- HTTP 4xx/5xx can still confirm Cloudflare edge presence when `server: cloudflare` or `cf-ray` is present.
- A passing edge probe does not prove the origin app is healthy; it proves the hostname is routed through Cloudflare.
