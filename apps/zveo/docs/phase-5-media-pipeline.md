# Phase 5: Media Pipeline & Orchestration

## Repository tree

```text
packages/media-pipeline/
  src/contracts.ts          Zod contracts for pipeline commands, export profiles, subtitles, beats, and checkpoints
  src/state.ts              resumable pipeline transition guard and checkpoint helpers
  src/synchronization.ts    beat-aware timeline stitching and SRT rendering
  src/ffmpeg.ts             deterministic FFmpeg filter graph and encode argument builder
  src/planner.ts            idempotent orchestration planner with checksum and tenant validation
  tests/media-pipeline.test.ts
```

## API contract

`POST /v1/workflows/{workflowId}/media-pipelines` accepts a `PipelineCommand` and returns a `PipelinePlan`.
The command is idempotent by `idempotencyKey`; each stage also has a derived checkpoint key in the form
`<command.idempotencyKey>:<stage>`, so a retry after worker or queue failure resumes from the last completed stage.

## Environment variables

- `MEDIA_EXPORT_BUCKET`: S3/MinIO bucket for SRT files and encoded exports.
- `FFMPEG_PATH`: absolute path to FFmpeg 7+ binary in workers.
- `MEDIA_PIPELINE_MAX_CONCURRENCY`: worker bulkhead limit for CPU-bound encode slots.

## Deployment notes

- Run media workers separately from render workers so FFmpeg saturation cannot starve provider polling.
- Mount short-lived S3 credentials through Kubernetes secrets or workload identity.
- Use node affinity for encode workers with local NVMe scratch volumes.

## Production hardening checklist

- [x] Every command, artifact, export profile, subtitle cue, and checkpoint is validated with Zod.
- [x] Checksum verification is mandatory before timeline assembly.
- [x] Invalid state transitions fail before side effects.
- [x] FFmpeg plans are deterministic and keyed by export profile hash.
- [x] Subtitle timelines reject overlap and out-of-program cues.
- [x] Pipeline database tables persist idempotency keys and per-stage checkpoints.
