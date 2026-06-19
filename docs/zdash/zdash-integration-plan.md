# zDash Integration Plan

This plan maps accessible `cvsz/*` and `ZeaZDev/*` repositories into the renamed `apps/zdash` dashboard.

## Naming decision

| Old | New |
|---|---|
| `apps/zeaz-studio-dashboard` | `apps/zdash` |
| `zeaz-studio-dashboard` Cloudflare Pages project | `zdash` |
| `ZEAZ_STUDIO_DASHBOARD_HOST` | `ZDASH_HOST` |
| `ZEAZ_STUDIO_DASHBOARD_PORT` | `ZDASH_PORT` |

The Vite config still accepts the old env names as fallback for compatibility.

## Repositories scanned

High-signal repositories found under `cvsz/*`:

- `cvsz/zeaz-platform` — Cloudflare, tunnel, local service, zDash host repo.
- `cvsz/zveo` — video/content service candidate.
- `cvsz/zwallet`, `cvsz/zeapay`, `cvsz/zypto` — wallet/payment/crypto candidates.
- `cvsz/zkbtrader`, `cvsz/livescan` — trading/live scan candidates.
- `cvsz/zSafeGuard` — risk/security guard candidate.
- `cvsz/zsp-aitool`, `cvsz/everything-claude-code`, `cvsz/zcodex` — agent/tooling candidates.
- `cvsz/fb_scheduler`, `cvsz/zLinebot`, `cvsz/zLinebot-automos` — social/scheduler/bot candidates.
- `cvsz/zeaz-meta`, `cvsz/zttlbots`, `cvsz/zlttbots`, `cvsz/zeye` — metadata, bot, and device automation candidates.

High-signal repositories found under `ZeaZDev/*`:

- `ZeaZDev/FBScheduler` — social scheduler candidate.
- `ZeaZDev/ZeaClicker`, `ZeaZDev/GreenClicker` — automation/clicker candidate.
- `ZeaZDev/ZeaZDev-Omega` — agent/platform meta candidate.
- `ZeaZDev/zeazchain`, `ZeaZDev/zeaztools`, `ZeaZDev/zeazdev-repo` — chain/tools/meta candidates.

## Integration approach

Do not vendor all repo contents into zDash. Use adapters and health endpoints instead:

1. Add read-only repo metadata registry first.
2. Add health adapters per module.
3. Add API adapters for runtime data.
4. Add control actions only after auth, audit logging, and rollback controls exist.

## Priority map

| Priority | Module | Source repos | zDash panels |
|---|---|---|---|
| P0 | Trading | `cvsz/zkbtrader`, `cvsz/livescan` | XAU Live Scanner, AutoTrading, Backtesting |
| P0 | Risk | `cvsz/zSafeGuard` | Drawdown Guard, Kill Switch |
| P0 | Cloudflare Ops | `cvsz/zeaz-platform` | Tunnel Health, Deploy Status |
| P1 | Wallet/Payments | `cvsz/zwallet`, `cvsz/zeapay`, `cvsz/zypto`, `ZeaZDev/zeazchain` | Wallet Status, Ledger Summary |
| P1 | Video/Content | `cvsz/zveo` | Video Pipeline, Render Queue |
| P1 | Social Automation | `cvsz/fb_scheduler`, `ZeaZDev/FBScheduler`, `cvsz/zLinebot` | Scheduler, Social Pipeline |
| P2 | Agent Tooling | `cvsz/zsp-aitool`, `cvsz/everything-claude-code`, `cvsz/zcodex`, `ZeaZDev/ZeaZDev-Omega` | Agent Roster, Session Manager |
| P2 | Device Automation | `ZeaZDev/ZeaClicker`, `ZeaZDev/GreenClicker`, `cvsz/zeye` | Device Automation |

## Current applied artifact

```text
apps/zdash/integrations.registry.json
```

This registry is the first stable contract for wiring panels to source systems.

## Next implementation steps

1. Create `apps/zdash/src/integrations.js` and render a live Integration Map panel from the registry.
2. Add backend adapter contract:

```text
GET /api/integrations/status
GET /api/integrations/:module/health
GET /api/integrations/:module/events
```

3. Start with read-only adapters for `cloudflare-ops`, `trading`, and `risk`.
4. Gate any write/control actions behind auth, audit logs, and confirmation UI.
