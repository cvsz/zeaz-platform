import type { PipelineStage, StageCheckpoint } from "./contracts.js";

const transitions: Record<PipelineStage, readonly PipelineStage[]> = {
  submitted: ["render_manifest_locked", "cancelled", "failed"],
  render_manifest_locked: ["artifacts_downloaded", "cancelled", "failed"],
  artifacts_downloaded: ["timeline_assembled", "cancelled", "failed"],
  timeline_assembled: ["audio_synchronized", "cancelled", "failed"],
  audio_synchronized: ["subtitles_muxed", "cancelled", "failed"],
  subtitles_muxed: ["exports_encoded", "cancelled", "failed"],
  exports_encoded: ["checksummed", "cancelled", "failed"],
  checksummed: ["published", "cancelled", "failed"],
  published: [],
  failed: ["render_manifest_locked"],
  cancelled: [],
};

export function assertPipelineTransition(from: PipelineStage, to: PipelineStage): PipelineStage {
  if (!transitions[from]?.includes(to)) throw new Error(`invalid media pipeline transition ${from} -> ${to}`);
  return to;
}

export function nextPipelineStages(from: PipelineStage): readonly PipelineStage[] {
  return transitions[from] ?? [];
}

export function currentStage(checkpoints: readonly StageCheckpoint[]): PipelineStage {
  return checkpoints.at(-1)?.stage ?? "submitted";
}

export function hasCheckpoint(checkpoints: readonly StageCheckpoint[], idempotencyKey: string): boolean {
  return checkpoints.some((checkpoint) => checkpoint.idempotencyKey === idempotencyKey);
}
