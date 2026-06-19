---
name: zai-trader
description: Master skill combining related sub-skills
---

# zai-trader

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Sub-skill: trader-backtest

Run a historical backtest using the `neural-trader` Rust/NAPI engine, then Ed25519-sign the result so the paper→live promotion gate has cryptographic tamper evidence (ADR-126 Phase 4 + CWE-347 pattern).

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Check for saved strategy config:
   `mcp__claude-flow__memory_retrieve({ key: "strategy-STRATEGY_NAME", namespace: "trading-strategies" })`
   If not found, list available: `mcp__claude-flow__memory_search({ query: "strategy", namespace: "trading-strategies", limit: 10 })`
3. Run backtest via neural-trader CLI:
   ```bash
   npx neural-trader --backtest --strategy <name> --symbol <TICKER> --period <range> --walk-forward
   ```
   For multi-indicator strategies:
   ```bash
   npx neural-trader --backtest --strategy multi-indicator --position-sizing kelly --symbol SPY --period 2020-2024
   ```
4. Capture performance metrics from output: total return, annualized return, Sharpe ratio, Sortino ratio, max drawdown, win rate, profit factor, number of trades.
5. Dedup prior backtests for the same `(strategyId, paramsHash)` before storing the fresh one (ADR-125 lifecycle / ADR-126 Phase 2 — `keep-newest` semantics):
   - Search: `mcp__claude-flow__memory_search({ query: "backtest STRATEGY paramsHash:PARAMS_HASH", namespace: "trading-backtests", limit: 10 })`
   - For each hit whose key matches `backtest-STRATEGY-*` AND whose stored `paramsHash` equals the current run's hash, delete it: `mcp__claude-flow__memory_delete({ key: "OLD_KEY", namespace: "trading-backtests" })`
   - (Note: even without this proactive step, the `MemoryConsolidator.dedup('keep-newest')` background pass introduced in `@claude-flow/memory@3.0.0-alpha.18` runs every 6h and will eventually converge. Doing it inline keeps `memory_search` results deterministic immediately after a re-run.)
6. **Sign the artifact (ADR-126 Phase 4):**
   - Build the `SignedBacktestArtifact` body — `{ strategyId, paramsHash, dataRange: {from,to}, metrics, runsHash, generatedAt }` — where `paramsHash = sha256(canonical params JSON)`, `runsHash = sha256(canonical runs array JSON)`, and `generatedAt = new Date().toISOString()`.
   - Resolve the witness signing key. The skill reads the key path in this order; the FIRST that resolves wins:
     1. `RUFLO_WITNESS_KEY_PATH` env var — points to a JSON file with `{ "privateKey": "<hex>" }`.
     2. `verification/witness-key.json` (the ADR-103 default path, if present).
   - If the key resolves: call `signBacktestArtifact(body, privateKeyHex)` from `plugins/ruflo-neural-trader/src/signed-artifact.mjs`. The returned value is a `SignedBacktestArtifact` with `schema`, `witnessPublicKey: "ed25519:<hex>"`, and `witnessSignature: "<hex>"` populated.
   - If NEITHER path resolves: log a loud warning — `"[WARN] ruflo-neural-trader: no witness signing key found (RUFLO_WITNESS_KEY_PATH unset, verification/witness-key.json missing) — storing backtest artifact in UNSIGNED degraded mode. paper→live promotion will be refused by trader-cloud-backtest until a signed artifact replaces this one."` — and store the body unsigned. NEVER silently fall back.
7. **Store the (possibly signed) artifact** to the canonical `trading-backtests` namespace:
   `mcp__claude-flow__memory_store({ key: "backtest-STRATEGY-TIMESTAMP", value: JSON.stringify(signedArtifact), namespace: "trading-backtests" })`
   The stored value contains `witnessSignature` + `witnessPublicKey` when signed; downstream consumers (`trader-cloud-backtest`) MUST call `verifyBacktestArtifact(artifact, trustedPublicKey)` before promoting any artifact to live.
8. If Sharpe > 1.5, store as successful pattern:
   `mcp__claude-flow__agentdb_pattern-store({ pattern: "profitable-STRATEGY_TYPE", data: "PARAMS_AND_RESULTS" })`
9. Train SONA on the outcome:
   `mcp__claude-flow__neural_train({ patternType: "trading-strategy", epochs: 10 })`

### Key sourcing & key rotation (ADR-103)

- The witness key is a 32-byte Ed25519 private key, stored as `{ "privateKey": "<64-hex-chars>" }` in a JSON file referenced by `RUFLO_WITNESS_KEY_PATH`. Keep it OUT of the repo. For local development, generate one once with `node -e "import('@noble/ed25519').then(async ed=>{const sk=crypto.getRandomValues(new Uint8Array(32));console.log(Buffer.from(sk).toString('hex'))})"` and write it to `~/.ruflo/witness-key.json`.
- Production deployments pin the corresponding PUBLIC key in project config and supply it as `trustedPublicKey` to `verifyBacktestArtifact(...)` — never trust the `witnessPublicKey` field on the artifact itself (CWE-347 / #1922).
- Key rotation: re-sign existing backtest entries with the new key OR explicitly mark pre-rotation artifacts as non-promotable. Same pattern as ADR-103.


## Sub-skill: trader-cloud-backtest

# Cloud backtest / train (neural-trader on a Managed Agent)

Dispatch a **heavy** `neural-trader` job to an Anthropic Claude Managed Agent (cloud container) instead of running it locally. See project ADR-117 (recipe + cost rules) and ADR-115 (the `managed_agent_*` runtime).

## When to use this vs `trader-backtest` (local)

| Job | Runtime |
|---|---|
| Quick sanity check; one short backtest (< ~1 min) | local — use the `trader-backtest` skill |
| Multi-year **walk-forward**, big **Monte-Carlo** count, **parameter sweep** over a grid, or **model training** (LSTM/Transformer/N-BEATS) | **cloud — this skill** |

Prereq: `ANTHROPIC_API_KEY` (or `CLAUDE_API_KEY`) + Managed Agents beta access. If `managed_agent_*` returns "needs ANTHROPIC_API_KEY", fall back to the local `trader-backtest` skill.

## Steps

1. **Estimate first.** From the job size, print an estimated cost (≈ container-minutes × rate + tokens) — a long sweep is a deliberate choice, not a default.

2. **Provision (or reuse) the container** — install neural-trader at container start so the agent doesn't reinstall mid-run:
   ```
   managed_agent_create({
     name: "nt-cloud",
     model: "claude-haiku-4-5-20251001",            // orchestration only — the compute is the Rust engine, not the LM (ADR-026)
     system: "You operate the `neural-trader` CLI in this container. Run exactly the commands asked, report the metrics, write requested artifacts, then stop.",
     networking: "unrestricted",                     // or "restricted" pinned to your data host
     packages: { npm: ["neural-trader"] },           // add apt:["build-essential"] ONLY if there's no prebuilt NAPI binary for the arch (neural-trader ships prebuilds → usually omit)
     initScript: "npm install -g --ignore-scripts neural-trader >/dev/null 2>&1 || npx -y neural-trader --version >/dev/null 2>&1 || true"
   })
   → { sessionId, agentId, environmentId }
   ```
   For a **sweep**: create the environment once, run all configs in **one** `managed_agent_prompt` (one container), not N sessions.

3. **Pre-flight cheap.** Before a 1000-path / multi-year run, do a tiny smoke first (1 MC path, ~3 months) — catches a bad strategy name / symbol in seconds:
   ```
   managed_agent_prompt({ sessionId, message: "Run `npx neural-trader --backtest --strategy <name> --symbol <TICKER> --period <last 3 months> --mc-paths 1`. Just confirm it ran and report the Sharpe. Then stop.", maxWaitMs: 60000 })
   ```
   If that fails, fix the args before the real run (and `managed_agent_terminate`).

4. **Run the real job:**
   ```
   managed_agent_prompt({
     sessionId,
     message: "Run `npx neural-trader --backtest --strategy <name> --symbol <TICKER> --period <range> --walk-forward --mc-paths <N>` (for training: `npx neural-trader --train --model <lstm|transformer|nbeats> --symbol <TICKER> --period <range>`; for a sweep: loop the configs and run each). Report: total return, annualized return, Sharpe, Sortino, max drawdown, win rate, profit factor, # trades, 95% CVaR. Write the equity curve to /tmp/equity.csv and the trade log to /tmp/trades.csv. Then stop.",
     maxWaitMs: <generous — minutes>
   })
   → { finished, status, stopReason, assistantText (the metrics), toolUses }
   ```
   If `finished:false`, follow up with `managed_agent_events({ sessionId })` until idle.

5. **Pull artifacts (if needed):** `managed_agent_prompt({ sessionId, message: "cat /tmp/equity.csv" })` or `managed_agent_events` and read the tool_result.

6. **Ingest locally + Ed25519 verify (ADR-126 Phase 4 fail-closed gate):**
   - Build the `SignedBacktestArtifact` body from the cloud-returned metrics + params hash + runs hash. Sign it locally with `signBacktestArtifact(body, privateKeyHex)` from `plugins/ruflo-neural-trader/src/signed-artifact.mjs` (key resolution same as `trader-backtest`: `RUFLO_WITNESS_KEY_PATH` → `verification/witness-key.json` → degraded-unsigned warning).
   - **Before storing OR promoting the artifact to a live strategy**: call `await verifyBacktestArtifact(artifact, trustedPublicKey)` where `trustedPublicKey` is the pinned project-config Ed25519 public key (NOT the `artifact.witnessPublicKey` field — that's attacker-controllable; see CWE-347 / #1922). If verification returns `false`: **REFUSE to promote** — emit a loud error `"[ERROR] ruflo-neural-trader: SignedBacktestArtifact signature INVALID against trusted key — refusing to promote to live strategy"` and return early. This is the fail-closed gate per ADR-126.
   - On verify success: `memory_store({ key: "backtest-<strategy>-<ts>", value: JSON.stringify(signedArtifact), namespace: "trading-backtests" })`. The stored value carries `witnessSignature` + `witnessPublicKey`.
   - If Sharpe > 1.5: `agentdb_pattern-store({ pattern: "profitable-<strategy-type>", data: "<params + results>" })`.
   - Record the run's container time + token cost to the `cost-tracking` namespace (per ADR-117 — cloud sessions bill until terminated).

7. **Terminate immediately** — results in hand:
   ```
   managed_agent_terminate({ sessionId, environmentId })   → { sessionDeleted: true, environmentDeleted: true }
   ```
   Never leave an idle billing container. (`ruflo doctor` / GC catches orphans — #1931.)

## Cost rules (don't skip)

- Install once (`initScript`), reuse the environment, batch sweeps into one prompt, pre-flight cheap, terminate eagerly, use Haiku/Sonnet for the agent loop, estimate before kicking off. (ADR-117 §"Cost optimization".)
- A cloud backtest that runs for an hour costs an hour of container time + the agent-loop tokens. Be deliberate.

## Quick example

```
managed_agent_create  { "name":"nt-cloud", "model":"claude-haiku-4-5-20251001", "packages":{"npm":["neural-trader"]}, "initScript":"npm install -g --ignore-scripts neural-trader >/dev/null 2>&1 || true" }
  → { sessionId:"sesn_…", environmentId:"env_…" }
managed_agent_prompt   { "sessionId":"sesn_…", "message":"Run `npx neural-trader --backtest --strategy multi-indicator --symbol SPY --period 2020-2024 --walk-forward --mc-paths 1000`. Report Sharpe/Sortino/max-DD/win-rate/CVaR; write /tmp/equity.csv. Then stop.", "maxWaitMs":600000 }
  → { finished:true, status:"idle", assistantText:"<metrics>", toolUses:[{bash:"npx neural-trader --backtest …"}] }
# … memory_store the metrics, agentdb_pattern-store if Sharpe>1.5, record cost …
managed_agent_terminate { "sessionId":"sesn_…", "environmentId":"env_…" }
```


## Sub-skill: trader-explain

Explain a trading signal by building a feature-contribution graph and running single-entry forward-push PageRank from the signal output node. Top-K ranked features are returned as a markdown table AND persisted to `trading-analysis` as a `SignedAttributionArtifact` (ADR-126 Phase 6).

**Why this skill matters:**
- EU AI Act + SEC Reg-AI guidance require interpretable model output for any algorithmic trading system that touches retail capital. This is the regulator-grade attribution path the rest of the substrate has been waiting for.
- The same call site picks up the full native-WASM PageRank from `mcp__ruflo-sublinear__page-rank-entry` once that tool is registered in the runtime — until then, the local power-iteration kernel ships in `signed-attribution.mjs` and produces the same ordering (seeded mulberry32).

Steps:

1. **Retrieve the signal** from the canonical `trading-signals` namespace (ADR-126 Phase 1 + Phase 2 lifecycle):
   ```text
   mcp__claude-flow__memory_retrieve({
     key: "SIGNAL_ID",
     namespace: "trading-signals"
   })
   ```
   The signal entry includes `modelId`, `prediction`, and the feature vector at the time of inference.

2. **Extract per-feature contribution scores** from the model:
   ```bash
   npx neural-trader --predict --signal "$SIGNAL_ID" --explain --json
   ```
   The expected output shape:
   ```ts
   {
     features: Array<{ name: string; contribution: number }>;
     // for Transformers, also includes per-head attention co-occurrence:
     attention?: Array<{ head: string; cooccur: Array<[number, number, number]> }>;
   }
   ```

   **Fallback path** — if `--explain` is not shipped on the installed `neural-trader` build (older versions; the flag was scoped for a follow-up upstream PR), the skill degrades to a deterministic feature-importance heuristic over the signal's input vector: `contribution_i = |input_i - μ_i| / σ_i` (z-score magnitude). This is a known proxy — not as faithful as attention/SHAP — and the resulting artifact is tagged `attribution_method: "input-zscore-fallback"` so downstream consumers can filter it out for regulator filings. Document the fallback path in the resulting markdown summary so the agent surfaces it to the user.

3. **Build the feature-contribution graph**:
   - **Nodes**: one node per feature + one source node `__signal_output__` for the prediction.
   - **Edges**: outgoing edges from `__signal_output__` to each feature node, weighted by `contribution_i`. When attention co-occurrence data is available, also add edges between feature nodes weighted by `cooccur` — this is what makes the PageRank single-entry rather than degenerating to plain top-K.
   - **Source**: `__signal_output__` (index 0 by convention so the smoke can assert reproducibility).

4. **Run single-entry PageRank** — preferred path when `mcp__ruflo-sublinear__page-rank-entry` is registered:
   ```text
   mcp__ruflo-sublinear__page-rank-entry({
     nodes: GRAPH_NODES,
     edges: GRAPH_EDGES,
     sourceIndex: 0,
     damping: 0.85,
     maxIterations: 100,
     tolerance: 1e-8,
     seed: 42
   })
   ```
   The local fallback (`localSingleEntryPageRank` in `plugins/ruflo-neural-trader/src/signed-attribution.mjs`) runs ~30 LOC of seeded power-iteration when the MCP tool is not available — same math, same result up to floating-point tolerance, same ordering for the same seed (the Phase 6 smoke asserts this).

5. **Build the top-K `AttributionFeature[]`** via `topKFeatures(graph, scores, k=10, excludeIndex=0)` — excludes the source node from the ranked output. Ties broken by node index (lower index wins) so the ranking is deterministic.

6. **Sign the artifact** (reuses the Phase 4 signing primitives — same Ed25519 + canonicalization):
   - Build the `SignedAttributionArtifact` body:
     ```ts
     {
       signalId: SIGNAL_ID,
       modelId: SIGNAL.modelId,
       features: TOP_K_FEATURES,             // from step 5
       graphMetadata: {
         nodeCount: GRAPH.nodes.length,
         edgeCount: COUNT_EDGES,
         pageRankIterations: PR_RESULT.iterations,
         seed: SEED                          // load-bearing for reproducibility
       },
       generatedAt: NEW_DATE_ISO
     }
     ```
   - Resolve the witness signing key — same lookup order as Phase 4:
     1. `RUFLO_WITNESS_KEY_PATH` env var — JSON file with `{ "privateKey": "<hex>" }`.
     2. `verification/witness-key.json` (the ADR-103 default path).
   - If a key resolves: `signAttributionArtifact(body, privateKeyHex)` from `plugins/ruflo-neural-trader/src/signed-attribution.mjs`.
   - If NEITHER path resolves: log `"[WARN] ruflo-neural-trader: no witness signing key found — storing attribution artifact in UNSIGNED degraded mode. Regulator filings will reject UNSIGNED artifacts."` and store the body unsigned. NEVER silently fall back.

7. **Store the (possibly signed) artifact** to the canonical `trading-analysis` namespace (ADR-126 Phase 1):
   ```text
   mcp__claude-flow__memory_store({
     key: "attribution-SIGNAL_ID-TIMESTAMP",
     namespace: "trading-analysis",
     value: JSON.stringify(signedArtifact)
   })
   ```
   The `trading-analysis` namespace is the canonical home for model-analysis output (regime classifications, technical-indicator summaries, model-training results — and now attribution rankings). Long-lived — no TTL — because the audit trail is the deliverable.

8. **Return the markdown summary** to the agent. Suggested format:
   ```
   ## Feature attribution for signal `SIGNAL_ID` (model: MODEL_ID)

   | Rank | Feature | Score |
   |------|---------|-------|
   | 1    | NAME    | 0.42  |
   | 2    | NAME    | 0.18  |
   | …    | …       | …     |

   - PageRank iterations: N
   - Graph: nodeCount nodes, edgeCount edges
   - Seed: 42 (reproducible — same seed → same ordering)
   - Path: mcp | local
   - Signature: ed25519:abcd… (or UNSIGNED — degraded warning above)
   ```

### Verification

Downstream consumers verify the artifact before any regulator-facing report or paper→live promotion:

```ts
import { verifyAttributionArtifact } from 'plugins/ruflo-neural-trader/src/signed-attribution.mjs';

const ok = await verifyAttributionArtifact(artifact, trustedPublicKey);
if (!ok) {
  // [ERROR] attribution verification failed — refuse to publish.
  // Pin to trustedPublicKey from project config; do NOT trust the
  // artifact.witnessPublicKey field (CWE-347 / #1922 — attacker-controllable).
  return;
}
```

**Acceptance criteria (ADR-126 Phase 6):**
- `trader-explain <signalId>` returns a ranked feature list whose top-3 features overlap the model's attention argmax (when `--explain` available; documented tolerance).
- Reproducibility: two runs with the same `signalId` + same `--seed` produce byte-identical rank ordering (asserted by `scripts/smoke-neural-trader-feature-attribution.mjs`).
- Signed artifact verifies under the trusted pubkey; tampering any feature score or `graphMetadata.seed` invalidates the signature.
- Fallback paths engage cleanly: when MCP unavailable, local kernel runs; when `--explain` flag missing, z-score heuristic runs and the artifact is tagged.

**Refs:**
- ADR-126 Phase 6 (this skill's authoring ADR)
- ADR-126 Phase 4 (the signing scheme this reuses)
- ADR-123 (single-entry PageRank substrate; the same family that Phase 3 leverages for portfolio CG)
- `plugins/ruflo-neural-trader/src/signed-attribution.ts` (the typed contract)
- `plugins/ruflo-neural-trader/src/signed-attribution.mjs` (the runtime mirror)
- `scripts/smoke-neural-trader-feature-attribution.mjs` (the regression smoke)


## Sub-skill: trader-portfolio

Optimize portfolio allocation using neural-trader's portfolio engine.

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Load current portfolio:
   `mcp__claude-flow__memory_search({ query: "current portfolio holdings", namespace: "trading-portfolio" })`
3. Run portfolio optimization:
   ```bash
   npx neural-trader --portfolio optimize
   ```
   With risk target:
   ```bash
   npx neural-trader --portfolio optimize --risk-target <number>
   ```
4. Get risk metrics:
   ```bash
   npx neural-trader --risk assess --portfolio current
   npx neural-trader --var --portfolio current
   npx neural-trader --correlation --portfolio current --flag-threshold 0.8
   ```
5. Use SONA for expected return prediction:
   `mcp__claude-flow__neural_predict({ input: "expected returns for [HOLDINGS] given current regime" })`
6. Generate rebalancing plan:
   ```bash
   npx neural-trader --portfolio rebalance
   ```
   Output: trades needed, current vs target weights, estimated costs
7. Search for similar allocations in history:
   `mcp__claude-flow__agentdb_pattern-search({ query: "optimized portfolio Sharpe > 1", namespace: "trading-portfolio" })`
8. Store optimized allocation:
   `mcp__claude-flow__memory_store({ key: "portfolio-optimal-TIMESTAMP", value: "ALLOCATION_JSON", namespace: "trading-portfolio" })`


## Sub-skill: trader-portfolio-cg

Solve the mean-variance optimization `Σ · x = μ` via Conjugate Gradient instead of the legacy Neumann series.

**Why CG instead of Neumann (ADR-123 Wedge 8):**
- Neumann series: ~50 µs at n=256 (legacy `npx neural-trader --portfolio optimize`)
- Conjugate Gradient: ~816 ns at n=256 (this skill)
- Measured speedup: 40-60×; parity within 1e-4 on a fixed seed.

The covariance matrix Σ is symmetric positive-definite by construction (it's a Gram matrix on real returns), so CG is provably optimal — it converges in at most n iterations with no preconditioning, and typically far fewer when eigenvalues cluster.

**Disable flag**: set `RUFLO_NEURAL_TRADER_DISABLE_CG=1` to skip the CG path entirely and fall through to step 4's legacy Neumann route. Useful for A/B validation or when an upstream covariance regression breaks SPD.

**Native dispatch flag**: set `RUFLO_SUBLINEAR_NATIVE=1` to force the adapter to attempt the native `mcp__ruflo-sublinear__solve` path even when `globalThis` doesn't expose the tool (e.g. when the harness mounts it via a different transport). On any native-dispatch failure the adapter cleanly falls back to the local JS CG and records `method: 'cg-local'` in the artifact metadata — so the regression is auditable.

Steps:

1. **Ensure neural-trader is available**:
   ```bash
   npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader
   ```

2. **Read the current covariance matrix Σ and expected-return vector μ** from neural-trader's portfolio API:
   ```bash
   # Primary path (preferred — clean JSON):
   npx neural-trader --portfolio current --json
   # Fallback paths if the --json flag is unavailable on the installed version:
   npx neural-trader --portfolio current  # parse the text output
   # OR pull from AgentDB if a prior run stored the matrix there:
   ```
   ```text
   mcp__claude-flow__memory_search({ query: "covariance matrix current", namespace: "trading-risk", limit: 1 })
   ```
   The skill expects the response to include `covariance: number[][]` (n × n) and `expectedReturns: number[]` (length n).

3. **Solve Σ · x = μ via the SublinearAdapter** (preferred path) when `RUFLO_NEURAL_TRADER_DISABLE_CG` is unset:
   ```js
   import { sublinearAdapter } from '../../src/sublinear-adapter.mjs';
   const result = await sublinearAdapter.solveCG(COVARIANCE, EXPECTED_RETURNS, {
     tolerance: 1e-6,
     maxIterations: 200,
   });
   // result.solution    — optimal weights (number[])
   // result.iterations  — CG iterations executed
   // result.residual    — final ||A·x − b||₂
   // result.latencyMs   — wall-clock latency
   // result.method      — 'cg-sublinear-native' | 'cg-local'   <-- READ THIS
   // result.solver      — 'sublinear-time-solver@1.7.0' | 'local-js-cg'
   // result.degraded    — true if input failed SPD checks (fall back to step 4)
   ```
   The adapter does the dispatch itself: it probes for `mcp__ruflo-sublinear__solve` on `globalThis` (and honours `RUFLO_SUBLINEAR_NATIVE=1` as a manual override), routes through the native kernel when reachable, and falls back transparently to the embedded ~50-LOC JS CG when not. The math is identical either way — CG, dense form, n × n SPD covariance. The operator reads `result.method` to know which backend produced the artifact.

   The native MCP tool's wire shape (for direct callers who want to bypass the adapter):
   ```text
   mcp__ruflo-sublinear__solve({
     matrix: COVARIANCE,
     rhs: EXPECTED_RETURNS,
     algorithm: "cg",
     tolerance: 1e-6,
     maxIterations: 200
   })
   ```
   Output:
   ```ts
   { solution: number[], iterations: number, residual: number }
   ```

4. **Fallback (legacy Neumann)** — if step 3 reports `degraded: true` (non-SPD input, non-square matrix, MCP error) OR if `RUFLO_NEURAL_TRADER_DISABLE_CG=1`:
   ```bash
   npx neural-trader --portfolio optimize
   ```
   Capture the weights output and tag the artifact metadata with `method: 'neumann-fallback'` and a `reason` field.

5. **Store the optimal weights** to `trading-risk` namespace with full provenance metadata. **Take `method` and `solver` straight from the adapter's result so the operator can verify which backend ran**:
   ```text
   mcp__claude-flow__memory_store({
     key: "portfolio-weights-PORTFOLIO_ID-TIMESTAMP",
     namespace: "trading-risk",
     value: JSON.stringify({
       weights: result.solution,           // number[] from step 3 (or weights from step 4 fallback)
       method: result.method,              // 'cg-sublinear-native' | 'cg-local' | 'neumann-fallback'
       solver: result.solver,              // 'sublinear-time-solver@1.7.0' | 'local-js-cg' | 'neural-trader-cli'
       iterations: result.iterations,
       residual: result.residual,
       latencyMs: result.latencyMs,
       capturedAt: NEW_DATE_ISO,
       reason: FALLBACK_REASON || null
     })
   })
   ```
   The `trading-risk` namespace is canonical (ADR-126 Phase 1; the five-namespace alignment). Long-lived — no TTL — because portfolio weights are the audit trail Phase 4 will Ed25519-sign.

6. **Cross-check against historical patterns** (optional but recommended):
   ```text
   mcp__claude-flow__agentdb_pattern-search({
     query: "portfolio weights Sharpe regime:CURRENT_REGIME",
     namespace: "trading-risk"
   })
   ```
   If the new weights differ by more than 30% in any single asset from the historical median, flag for human review before applying. This is a guard-rail, not a hard block.

**Acceptance criteria (ADR-126 Phase 3):**
- Latency < 1 ms on n = 256 covariance (local JS CG); native path target 40-60× faster (816 ns native vs 50 µs Neumann per sublinear-time-solver@1.7.0).
- Parity with legacy Neumann within `||cg − neumann||_∞ < 1e-4` on a fixed seed.
- Fallback path engages cleanly when native MCP unavailable / covariance non-SPD.
- Artifact metadata distinguishes `cg-sublinear-native`, `cg-local`, and `neumann-fallback`.

**Refs**:
- ADR-126 Phase 3 (this skill's authoring ADR)
- ADR-123 §162 Row 8 (Wedge 8 speedup claim)
- ADR-123 §262-289 (the SublinearAdapter contract)
- `plugins/ruflo-neural-trader/src/sublinear-adapter.ts` (the adapter)
- `plugins/ruflo-neural-trader/benchmarks/portfolio-cg.bench.ts` (the measured numbers)


## Sub-skill: trader-regime

Detect the current market regime using neural-trader's regime detection engine.

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Run regime detection:
   ```bash
   npx neural-trader --regime-detect --symbol TICKER
   ```
   For multiple symbols:
   ```bash
   npx neural-trader --regime-detect --symbols "AAPL,MSFT,GOOGL,AMZN"
   ```
3. Get technical indicators for context:
   ```bash
   npx neural-trader --symbol TICKER --indicators rsi,macd,bollinger,adx,atr
   ```
4. Use SONA for regime prediction:
   `mcp__claude-flow__neural_predict({ input: "indicators: RSI=X, ADX=Y, VIX=Z" })`
5. Search for similar historical regimes:
   `mcp__claude-flow__memory_search({ query: "regime similar to CURRENT", namespace: "trading-analysis" })`
6. Present: regime classification, confidence, recommended strategy type, historical precedents
7. Store analysis:
   `mcp__claude-flow__memory_store({ key: "regime-DATE", value: "REGIME_ANALYSIS", namespace: "trading-analysis" })`


## Sub-skill: trader-risk

Assess portfolio and position risk using neural-trader's risk engine.

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Run risk assessment:
   ```bash
   # Single position
   npx neural-trader --risk assess --symbol TICKER
   npx neural-trader --var --symbol TICKER --investment 10000

   # Portfolio-wide
   npx neural-trader --risk assess --portfolio NAME
   npx neural-trader --correlation --portfolio NAME --flag-threshold 0.8
   ```
3. Calculate position sizing:
   ```bash
   npx neural-trader --risk-tolerance 0.02 --symbol TICKER
   npx neural-trader --position-sizing kelly --symbol TICKER
   ```
4. Check circuit breaker status:
   - Daily loss limit (3%), weekly loss limit (5%)
   - Correlation spike (>0.85), volatility regime (VIX > 2x)
   - Max positions, single-name concentration (>10%)
5. Present: risk metrics, position sizing recommendation, active breakers, alerts
6. Store assessment:
   `mcp__claude-flow__memory_store({ key: "risk-TICKER-DATE", value: "RISK_METRICS", namespace: "trading-risk" })`


## Sub-skill: trader-signal

Generate trading signals using neural-trader's anomaly detection engine.

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Scan for signals:
   ```bash
   npx neural-trader --signal scan --symbols <TICKERS>
   ```
   With a specific strategy:
   ```bash
   npx neural-trader --signal scan --strategy <name> --symbols <TICKERS>
   ```
3. If --strategy specified, load strategy filters:
   `mcp__claude-flow__memory_retrieve({ key: "strategy-NAME", namespace: "trading-strategies" })`
4. neural-trader classifies anomalies automatically:
   - **spike** (maxZ > 5): breakout — momentum entry or mean-reversion fade
   - **drift** (sustained high Z): trend forming — trend-following signal
   - **flatline** (low Z): consolidation — prepare for breakout
   - **oscillation** (alternating): range-bound — mean-reversion at extremes
   - **pattern-break** (multiple dims): regime change — close and reassess
   - **cluster-outlier** (>50% dims): multi-factor dislocation — arbitrage
5. Use SONA for regime prediction:
   `mcp__claude-flow__neural_predict({ input: "anomaly types: [DETECTED], scores: [SCORES]" })`
6. Search historical pattern matches:
   `mcp__claude-flow__agentdb_pattern-search({ query: "ANOMALY_TYPE score RANGE", namespace: "trading-signals" })`
7. Present ranked signals: instrument, direction, confidence, anomaly type, entry/stop/target
8. Store signals with a 24-hour TTL (intraday signals shouldn't pollute long-running memory; the `MemoryConsolidator.sweepExpired()` pass introduced in ADR-125 Phase 4 — shipped in `@claude-flow/memory@3.0.0-alpha.18` — sweeps them out after they expire):
   `mcp__claude-flow__memory_store({ key: "signal-TIMESTAMP", value: "SIGNALS_JSON", namespace: "trading-signals", expiresAt: Date.now() + 24 * 60 * 60 * 1000 })`


## Sub-skill: trader-train

Train neural prediction models using neural-trader's ML engine.

Steps:
1. Ensure neural-trader is available:
   `npm ls neural-trader 2>/dev/null || npm install --ignore-scripts neural-trader`
2. Train the specified model:
   ```bash
   npx neural-trader --model lstm --symbol TICKER --confidence 0.95
   npx neural-trader --model transformer --symbol TICKER --predict
   npx neural-trader --model nbeats --symbol TICKER --decompose
   ```
3. Review training output: loss curves, validation metrics, prediction accuracy
4. Generate predictions with confidence intervals:
   ```bash
   npx neural-trader --model MODEL --symbol TICKER --predict --horizon 5d
   ```
5. Compare model performance across types:
   ```bash
   npx neural-trader --model-compare --symbol TICKER --models "lstm,transformer,nbeats"
   ```
6. Store model results (canonical `trading-analysis` namespace per ADR-126 Phase 1 — was previously stored to undeclared `trading-models`):
   `mcp__claude-flow__memory_store({ key: "model-MODEL-TICKER-DATE", value: "TRAINING_RESULTS", namespace: "trading-analysis" })`
7. Train SONA on model outcomes:
   `mcp__claude-flow__neural_train({ patternType: "trading-model", epochs: 10 })`
