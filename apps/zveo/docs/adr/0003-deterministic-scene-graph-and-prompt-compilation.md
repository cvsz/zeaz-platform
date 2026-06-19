# ADR 0003: Deterministic Scene Graph and Prompt Compilation

## Status
Accepted

## Context
Long-form video generation requires character continuity, visual references, camera continuity, style locks, and scene dependencies. Provider prompts must be reproducible to replay failed scenes and verify that an output was generated from the intended cinematic plan.

## Decision
The scene graph engine compiles acyclic scene DAGs into deterministic timelines and continuity payloads. The prompt compiler transforms compiled scene JSON into provider-specific prompts using stable prompt hashes, token budgets, visual anchors, character memory, and negative prompts.

## Implementation boundaries

- `packages/scene-graph` validates DAG references, rejects cycles, propagates inherited camera, lighting, environment, character, and visual-reference state, and emits compiled scenes.
- `packages/prompt-compiler` parses the compiled scene payload, optimizes semantic fragments, applies provider-specific constraints, and emits stable prompt hashes.
- API gateway workflow submission compiles once per accepted workflow and enqueues one render job per compiled scene.

## Consequences

- Failed scene renders can be replayed without recompiling a different prompt.
- Prompt versions and hashes can be persisted for audit and regression testing.
- Scene continuity is owned by domain packages, not by browser automation or provider adapters.

## Trade-offs

- Very large graphs require caching and memory budgeting.
- Provider-specific prompt templates must be versioned as model behavior evolves.
