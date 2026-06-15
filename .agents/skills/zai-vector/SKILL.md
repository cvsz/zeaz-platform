---
name: zai-vector
description: Master skill combining related sub-skills
---

# zai-vector

## ZeaZ Platform & apps/* Monorepo Rules
When implementing tasks on the `zeaz-platform` repository, you MUST strictly enforce these architecture and workflow rules:
1. **Monorepo Architecture (apps/*)**: The platform is a unified monorepo. ALL applications, microservices, frontends, and AI toolings (e.g., zLinebot, zwallet, zdash) reside inside the `apps/` directory. Do not create top-level directories for apps. When refactoring or adding features, always scope your work to the specific `apps/<app-name>/` folder.
2. **Environment Variables**: Avoid scattering `.env` files. Consolidate environment variables into a central `.env.example` inside the respective app folder. Canonical Cloudflare variables (e.g. `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ZONE_ID`) MUST be used instead of legacy `CF_` variants.
3. **Commit Workflow**: NEVER use `git commit` or `git push` directly. ALWAYS stage your intended files with `git add` and commit using `make gpg-finalize COMMIT_MSG="..."` from the repository root to ensure all GitOps and DevSecOps checks pass.
4. **Security**: NEVER commit or generate real secrets. Unsafe placeholders like `replace-me`, `changeme`, `dummy-secret` are FORBIDDEN.
5. **Language**: Code, documentation, and technical definitions MUST be in English.

## Sub-skill: vector-cluster

# Vector Cluster

Cluster vectors in a namespace by semantic similarity using `ruvector`.

## When to use

Use this skill when you have a collection of embeddings and want to discover natural groupings. Clustering reveals themes, identifies outliers, and helps organize large vector collections.

## Steps

1. **Ensure ruvector@0.2.25 is available**:
   ```bash
   npm ls ruvector 2>/dev/null | grep '0.2.25' || npm install ruvector@0.2.25
   ```
2. **Run clustering** — in ruvector@0.2.25 the only working clustering is via `hooks graph-cluster` (spectral/Louvain over a code graph). The top-level `cluster` command is reserved for distributed cluster ops and is currently "Coming Soon" upstream.
   ```bash
   npx -y ruvector@0.2.25 hooks graph-cluster <files...>
   npx -y ruvector@0.2.25 hooks graph-mincut <files...>
   ```
3. **Review output** — JSON with cluster assignments, community labels, and edges. If you see `"graph.nodes is not iterable"`, run `hooks init` first to seed the graph state.
4. **Store results**:
   `mcp__claude-flow__memory_store({ key: "clusters-PROJECT-TIMESTAMP", value: "CLUSTER_ASSIGNMENTS", namespace: "vector-clusters" })`

## Interpreting results

- **High cohesion** (>0.85): tight, well-defined cluster
- **Medium cohesion** (0.6-0.85): related but diverse content
- **Low cohesion** (<0.6): loose grouping, try higher resolution
- **Outliers**: novel or anomalous files worth investigating

## Caveats

- `cluster --namespace ... --k N` and `cluster --density` are **not** valid in ruvector@0.2.25 — those flags fall through to the distributed-cluster command, which only accepts `--status`, `--join`, `--leave`, `--nodes`, `--leader`, `--info`.
- For namespaced k-means over arbitrary embeddings, run k-means in your own code against vectors stored in AgentDB.


## Sub-skill: vector-embed

# Vector Embed

Generate and store vector embeddings using the `ruvector` npm package.

## When to use

Use this skill to embed text, code, or documents into 384-dimensional vectors for semantic search, similarity comparison, or clustering. ruvector uses ONNX all-MiniLM-L6-v2 with HNSW indexing (52,000+ inserts/sec, ~0.045ms search).

## Steps

1. **Ensure ruvector@0.2.25 is available**:
   ```bash
   npm ls ruvector 2>/dev/null | grep '0.2.25' || npm install ruvector@0.2.25
   ```
   If `embed text` later reports `ONNX WASM files not bundled`, also run:
   ```bash
   npm install ruvector-onnx-embeddings-wasm
   ```
2. **Embed the input** (use the `text` subcommand, with text as a positional arg):
   - Single string: `npx -y ruvector@0.2.25 embed text "your text here"`
   - With output file: `npx -y ruvector@0.2.25 embed text "your text here" -o vec.json`
   - For a file: read its content via the Read tool, then pass it as the positional argument.
   - For batch: loop over files in shell — ruvector@0.2.25 has no built-in `--batch`/`--glob` flags.
3. **Adaptive (LoRA) variant**: `npx -y ruvector@0.2.25 embed text "..." --adaptive --domain code`
4. **Confirm** — report vector dimension (384), norm, and any output path written.
5. **Store metadata** in AgentDB if needed:
   `mcp__claude-flow__memory_store({ key: "embed-SOURCE", value: "VECTOR_METADATA", namespace: "vector-patterns" })`

## MCP alternative

Register the MCP server once with the pinned version:
```bash
claude mcp add ruvector -- npx -y ruvector@0.2.25 mcp start
```
Then call MCP tools directly: `hooks_rag_context` (semantic context), `brain_search` (collective brain), `hooks_ast_analyze`, `hooks_route`.

## Caveats

- The `embed --batch --glob` and `embed --file` flags do **not** exist in ruvector@0.2.25; only `embed text <text>` is supported. Read files yourself and call `embed text` per file.
- ONNX runtime is not bundled by default. If embedding fails, install `ruvector-onnx-embeddings-wasm` or run `npx -y ruvector@0.2.25 doctor` to diagnose.


## Sub-skill: vector-hyperbolic

# Vector Hyperbolic

Embed hierarchical data in the Poincare ball model using `ruvector`.

## When to use

Use this skill when your data has inherent hierarchy — dependency trees, module structures, taxonomies, org charts, ontologies. Hyperbolic space captures hierarchical distances with far fewer dimensions than Euclidean embeddings.

## Steps

1. **Ensure ruvector@0.2.25 is available**:
   ```bash
   npm ls ruvector 2>/dev/null | grep '0.2.25' || npm install ruvector@0.2.25
   ```
2. **Generate a base ONNX embedding** (ruvector@0.2.25 does not expose a `--model poincare` flag on `embed text`):
   ```bash
   npx -y ruvector@0.2.25 embed text "hierarchical concept" -o concept.vec.json
   ```
3. **Project into the Poincare ball** in your own code (or via the experimental neural substrate):
   ```bash
   npx -y ruvector@0.2.25 embed neural --help
   ```
   For an ad-hoc projection, normalize the 384-dim vector to live inside the unit ball (`x_i / (||x|| * (1 + epsilon))`) and persist the projected coordinates alongside the original embedding.
4. **Geodesic distance**: `d(u, v) = arcosh(1 + 2 * ||u-v||^2 / ((1-||u||^2)(1-||v||^2)))`
   Distance grows logarithmically with tree depth, preserving hierarchy.
5. **Store results**:
   `mcp__claude-flow__memory_store({ key: "hyperbolic-CONCEPT", value: "COORDINATES_AND_NEIGHBORS", namespace: "hyperbolic-embeddings" })`

## Caveats

- ruvector@0.2.25 has no first-class Poincare ball CLI flag. Treat hyperbolic projection as a post-processing step over a standard ONNX embedding.
- If you need a hyperbolic search index, store projected coordinates in AgentDB and compute geodesic distance in your own retrieval code.

## Poincare ball properties

| Property | Meaning |
|----------|---------|
| Norm close to 0 | Generic, root-level concept |
| Norm close to 1 | Specific, leaf-level concept |
| Small geodesic distance | Closely related in hierarchy |
| Large geodesic distance | Distant or different subtrees |

## Use cases

- **Dependency analysis**: embed module imports to find tightly coupled subtrees
- **Code architecture**: map class hierarchies to discover structural patterns
- **Knowledge organization**: embed concepts to reveal taxonomic relationships
- **Codebase navigation**: find most specific/general modules relative to a query


## Sub-skill: vector-search

# Vector Search

Two distinct vector-search paths live in this plugin. Pick the right one — they're not interchangeable.

| Path | Tool family | Backing | Capacity | Latency |
|------|-------------|---------|----------|---------|
| **Large-scale corpus** | `embeddings_*` | `@claude-flow/memory` HNSW (Rust/Native) | up to millions of vectors | 150×–12,500× faster than brute-force, depending on N and parameters |
| **Hot-path router** | `ruvllm_hnsw_*` | WASM-backed router (v2.0.1) | **~11 patterns max** (`ruvllm-tools.ts:58`) | sub-ms; designed for high-priority routing, not corpus search |

The "12,500×" headline applies to the large-scale `embeddings_search` path. The WASM router is **not** that path.

## When to use

| Need | Path |
|---|---|
| Search a corpus of N ≥ 500 documents | `embeddings_search` |
| Memory-constrained corpus (≥5,000 vectors) | RaBitQ quantized — see "Quantized search" below |
| Compare two strings | `embeddings_compare` |
| Hierarchical / taxonomic data | `embeddings_hyperbolic` (Poincare ball) |
| Route a query to one of ≤11 hot patterns | `ruvllm_hnsw_route` |
| Cross-namespace search | `memory_search_unified` |

## Standard search

1. **Check status** — `mcp__claude-flow__embeddings_status` to verify the embedding engine.
2. **Initialize** — `mcp__claude-flow__embeddings_init` if not active.
3. **Generate** — `mcp__claude-flow__embeddings_generate` for text input.
4. **Search** — `mcp__claude-flow__embeddings_search` with the query.
5. **Compare** — `mcp__claude-flow__embeddings_compare` to measure similarity.
6. **Unified search** — `mcp__claude-flow__memory_search_unified` for cross-namespace.

## Quantized search (32× memory reduction)

For corpora ≥5,000 vectors and/or memory-constrained environments, use the RaBitQ 1-bit quantization workflow. Below 5,000 vectors the rebuild cost outweighs the savings — use the standard path instead.

| Step | Tool | Purpose |
|---|---|---|
| 1 | `embeddings_init` | Engine warm |
| 2 | `embeddings_rabitq_build` | One-time build of the 1-bit index after corpus is loaded |
| 3 | `embeddings_rabitq_search` | Hamming-prefilter returns top-N candidate IDs (cheap) |
| 4 | `embeddings_search` | Optional exact rerank on the candidate set (full-precision) |
| 5 | `embeddings_rabitq_status` | Index health, memory footprint, build time |

> **Note**: `embeddings_rabitq_search` returns candidate IDs only — the rerank in step 4 is the user's responsibility (mirrors the docstring at `embeddings-tools.ts:911`). Without rerank, results are approximate; with rerank, you get full-precision quality at 32× lower memory.

## Tuning

HNSW exposes three knobs that trade recall against latency. The "12,500×" headline assumes **defaults**; tune deliberately for your workload:

| Profile | `efSearch` | `M` | When to use |
|---------|-----------|-----|-------------|
| `recall-first` | 200 | 32 | Pattern recall during planning; quality matters more than ms |
| `balanced` (default) | 64 | 16 | General-purpose semantic recall |
| `latency-first` | 16 | 8 | Hot-path routing where p99 latency matters |

`efSearch` is passed via `ruvllm_hnsw_create` (`ruvllm-tools.ts:64`). `M` is registry-level today; raise as a follow-up if it should be MCP-tunable. `efConstruction` defaults to 200 in the lite index (`hnsw-index.ts:537`).

## HNSW pattern router (WASM, ≤11 patterns)

For routing a small number of high-priority patterns:
- `mcp__claude-flow__ruvllm_hnsw_create` — create the WASM index (cap ~11)
- `mcp__claude-flow__ruvllm_hnsw_add` — add a pattern
- `mcp__claude-flow__ruvllm_hnsw_route` — route an incoming query

This is **not** a corpus index. Treat it as a fast classifier over a curated set of patterns.

## Hyperbolic embeddings

For hierarchical data (code trees, org charts), use `mcp__claude-flow__embeddings_hyperbolic` which maps to Poincare ball space. Distance is geodesic, not cosine.

## CLI alternative

```bash
npx @claude-flow/cli@latest embeddings search --query "authentication patterns"
npx @claude-flow/cli@latest embeddings init
npx @claude-flow/cli@latest memory search --query "your query"
```

## Performance

| Method | Speed |
|--------|-------|
| Brute-force scan | Baseline |
| HNSW (n=500, balanced) | ~150× faster |
| HNSW (n=10,000, balanced) | ~12,500× faster |
| RaBitQ + rerank (n=10,000) | ~12,500× search speed at 32× lower memory |
| `ruvllm_hnsw_route` (n≤11) | sub-ms per route, fixed cost |


## Sub-skill: vector-setup

# Vector Setup

Bootstraps `ruvector@0.2.25` and its optional add-ons so every `/vector` subcommand actually works on first run.

## Why this exists

Out of the box, several `/vector` subcommands fail with a confusing dep error:

| Error | Missing package |
|-------|-----------------|
| `ONNX WASM files not bundled. The onnx/ directory is missing.` | `ruvector-onnx-embeddings-wasm` |
| `Brain commands require @ruvector/pi-brain` | `@ruvector/pi-brain` |
| `SONA not available. Native error: Cannot find module '/.../@ruvector/sona/index.js'` | `@ruvector/ruvllm` (JS fallback) |
| `LLM commands require @ruvector/ruvllm` | `@ruvector/ruvllm` |

This skill installs them in one pass.

## Steps

1. **Pin ruvector**:
   ```bash
   npm install ruvector@0.2.25
   ```
2. **Install the add-ons** (idempotent — only what's missing):
   ```bash
   npm install ruvector-onnx-embeddings-wasm \
               @ruvector/pi-brain \
               @ruvector/ruvllm
   ```
   For a leaner install, pass `--full` to also pull `@ruvector/graph-node` and `@ruvector/router`:
   ```bash
   npm install ruvector-onnx-embeddings-wasm \
               @ruvector/pi-brain \
               @ruvector/ruvllm \
               @ruvector/graph-node \
               @ruvector/router
   ```
3. **Verify the binary**:
   ```bash
   npx -y ruvector@0.2.25 doctor
   npx -y ruvector@0.2.25 info
   ```
4. **Register the MCP server**:
   ```bash
   claude mcp add ruvector -- npx -y ruvector@0.2.25 mcp start
   claude mcp list | grep ruvector
   ```
5. **Sanity check** the most common subcommands:
   ```bash
   npx -y ruvector@0.2.25 hooks route "test"
   npx -y ruvector@0.2.25 attention list
   npx -y ruvector@0.2.25 rvf examples
   ```
6. **(Optional) Generate a pi identity** for brain + edge:
   ```bash
   npx -y ruvector@0.2.25 identity generate
   npx -y ruvector@0.2.25 identity show
   ```

## Smoke test

For a deterministic verification of the install, run the plugin's bundled smoke script:
```bash
bash plugins/ruflo-ruvector/scripts/smoke.sh
```

It checks: version pin, top-level subcommand visibility, `hooks ast-analyze`, `hooks route`, `attention list`, `rvf examples`, and `info`. Exits non-zero if any drift from the contracted surface is detected.

## What this does not install

- Native Rust toolchain (optional; only needed for source builds)
- Platform-specific native bindings (auto-detected by `@ruvector/core`)
- `@ruvector/sona` native binding (the JS fallback via `@ruvector/ruvllm` is sufficient on macOS arm64; Linux x64 has its own native binding)

If `doctor` still reports a problem after this skill runs, paste its output verbatim and ask.
