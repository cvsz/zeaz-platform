# ZEAZ META OS — GO-LIVE & PRODUCTION RUNBOOK

This document outlines the strict, deterministic sequence required to take ZEAZ META OS from zero to a fully operational, autonomous production state.

---

## 1. PRE-FLIGHT CHECKLIST

Before executing any commands, verify you have the following environment variables provisioned in your `.env` and `.env.cloudflare` files:

- [ ] `CLOUDFLARE_BOOTSTRAP_TOKEN` (Required for IAM permission mapping)
- [ ] `CLOUDFLARE_ACCOUNT_ID` & `CLOUDFLARE_ZONE_ID`
- [ ] `PG_USER`, `PG_DB`, `PG_PASS` (For Authentik & Trading AI)
- [ ] `OPENAI_API_KEY` (For AI Runtime)
- [ ] `VAULT_ENCRYPTION_KEY` (For Trading API secrets)

Run the environment validation:
```bash
make check-no-cf-vars
make token-verify
```

---

## 2. CLOUDFLARE EDGE INITIALIZATION

Initialize the Zero-Trust Edge, mapping the federated ports to Cloudflare Tunnels without exposing local ports.

1. **Map IAM Permissions & Generate Tokens**
   ```bash
   scripts/cloudflare/discover-permission-groups.sh
   make token-rotate
   ```

2. **Sync DNS and WAF Rules via Terraform**
   ```bash
   make zaiz-cloudflare-sync
   ```

3. **Start the Cloudflare Tunnel**
   ```bash
   make zaiz-tunnel
   # Verify the tunnel is active in the Cloudflare Dashboard.
   ```

---

## 3. CORE INFRASTRUCTURE BOOTSTRAP

Boot the baseline security and observability infrastructure before any trading logic is executed.

1. **Start Core Services**
   ```bash
   make zaiz-auth
   make zaiz-obs
   ```
2. **Validate Core Health**
   Ensure Postgres (5436) and Redis (6382) are running.
   ```bash
   make zaiz-ports
   ```

---

## 4. TRADING ENGINE INITIALIZATION

With the zero-trust boundary established, initialize the autonomous trading engine.

1. **Boot Trading Federation**
   ```bash
   make zaiz-trader
   ```
   *This brings up `trading-core`, `trading-ai`, and `trading-risk`.*

2. **Validate Trading Fabric**
   ```bash
   bash scripts/validation/validate_trading.sh
   ```

3. **Confirm Exchange Connectivity**
   Ensure Websockets are multiplexing correctly and no ghost orders exist.
   ```bash
   make zaiz-ws-test
   ```

---

## 5. FULL SYSTEM CONVERGENCE

Bring the entire Meta OS into alignment.

1. **Launch Autonomous Healing & Full Stack**
   ```bash
   make zaiz-prod
   ```

2. **Execute Full Validation Engine**
   ```bash
   bash scripts/full_validation.sh
   ```

---

## 6. EMERGENCY PROCEDURES (KILL SWITCHES)

In the event of uncontrolled anomalies, liquidation cascades, or unauthorized AI drift, use the following deterministic commands:

**Enter Safe Mode (Reduce-Only / No New Positions):**
```bash
make zaiz-trader-safe
```

**Total Emergency Stop (Liquidate & Freeze):**
```bash
make zaiz-trader-stop
```

**Network Isolation (Halt Edge Ingress):**
```bash
docker compose -f compose/cloudflare.yaml down
```

---
*End of Runbook. System is deterministic and bounded.*
