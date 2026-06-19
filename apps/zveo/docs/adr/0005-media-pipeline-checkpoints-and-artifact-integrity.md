# ADR 0005: Media Pipeline Checkpoints and Artifact Integrity

## Status
Accepted

## Context
Post-render exports combine multiple artifacts, audio, subtitles, thumbnails, overlays, and platform-specific renditions. FFmpeg work is compute-heavy and partial completion is common during worker interruption, disk pressure, or codec errors.

## Decision
Media orchestration is modeled as a resumable pipeline with typed commands, deterministic plans, checkpointed stages, validated artifact checksums, and per-platform export manifests.

## Implementation boundaries

- `packages/media-pipeline` owns command/result contracts, export planning, pipeline state transitions, FFmpeg filter graph generation, and subtitle/voiceover/beat synchronization.
- Object storage keys and checksums are validated before planning export work.
- Media workers are scaled and isolated separately from render workers to prevent encode workloads from starving render polling.

## Consequences

- Operators can resume from the last successful checkpoint instead of restarting a full export.
- Wrong-tenant artifacts and unverified checksums are rejected before FFmpeg execution.
- Platform-specific exports can evolve without changing render-job contracts.

## Trade-offs

- Checkpoint persistence must be kept consistent with object-storage writes.
- Pipeline plans need migration rules when export presets change.
