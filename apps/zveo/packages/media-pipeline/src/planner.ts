import { Logger, type AssetRecord } from "@zveo/core";
import { createHash, randomUUID } from "node:crypto";
import { buildFfmpegFilterGraph, profileHash } from "./ffmpeg.js";
import { pipelineCommandSchema, pipelinePlanSchema, stageCheckpointSchema, type PipelineCommand, type PipelinePlan, type PipelineStage, type StageCheckpoint } from "./contracts.js";
import { currentStage, hasCheckpoint, assertPipelineTransition } from "./state.js";
import { renderSrt, stitchTimeline, validateSubtitleTimeline } from "./synchronization.js";

export interface PlanContext {
  readonly checkpoints?: readonly StageCheckpoint[];
  readonly now?: Date;
}

export class MediaPipelinePlanner {
  constructor(private readonly logger = new Logger({ service: "media-pipeline" })) {}

  createPlan(rawCommand: unknown, context: PlanContext = {}): PipelinePlan {
    const command = pipelineCommandSchema.parse(rawCommand);
    this.validateArtifacts(command);
    const clips = stitchTimeline(command.renderArtifacts, command.beatMarkers);
    const totalDurationSeconds = clips.at(-1)?.endSeconds ?? 0;
    validateSubtitleTimeline(command.subtitleCues, totalDurationSeconds);
    const subtitleObjectKey = command.subtitleCues.length > 0 ? `workflows/${command.workflowId}/subtitles/master.srt` : undefined;
    const ffmpegFilterGraph = buildFfmpegFilterGraph(clips, subtitleObjectKey);
    const checkpoints = this.buildCheckpoints(command, context.checkpoints ?? [], context.now ?? new Date(), subtitleObjectKey);
    const plan = pipelinePlanSchema.parse({
      workflowId: command.workflowId,
      tenantId: command.tenantId,
      commandId: command.commandId,
      stages: checkpoints.map((checkpoint) => checkpoint.stage),
      checkpoints,
      ffmpegFilterGraph,
      exportManifests: command.exportProfiles.map((profile) => ({
        platform: profile.platform,
        objectKey: `exports/${command.tenantId}/${command.workflowId}/${profile.platform}/${profileHash(profile)}.${profile.container}`,
        profileHash: profileHash(profile),
        expectedContentType: profile.container === "webm" ? "video/webm" : profile.container === "mov" ? "video/quicktime" : "video/mp4",
      })),
    });
    this.logger.info("media pipeline plan created", { workflowId: plan.workflowId, commandId: plan.commandId, stages: plan.stages.length, exports: plan.exportManifests.length });
    return plan;
  }

  createSubtitleAsset(command: PipelineCommand, bucket: string): AssetRecord | undefined {
    if (command.subtitleCues.length === 0) return undefined;
    const body = Buffer.from(renderSrt(command.subtitleCues), "utf8");
    return {
      id: randomUUID(),
      tenantId: command.tenantId,
      workflowId: command.workflowId,
      kind: "subtitle",
      bucket,
      objectKey: `workflows/${command.workflowId}/subtitles/master.srt`,
      contentType: "application/x-subrip",
      bytes: body.byteLength,
      sha256: createHash("sha256").update(body).digest("hex"),
      version: 1,
      metadata: { generatedBy: "media-pipeline", cueCount: command.subtitleCues.length },
    };
  }

  private validateArtifacts(command: PipelineCommand): void {
    const seen = new Set<string>();
    for (const artifact of command.renderArtifacts) {
      if (!artifact.checksumVerified) throw new Error(`render artifact ${artifact.sceneId} has not passed checksum validation`);
      const key = `${artifact.asset.bucket}/${artifact.asset.objectKey}`;
      if (seen.has(key)) throw new Error(`duplicate render artifact object key ${key}`);
      seen.add(key);
      if (artifact.asset.tenantId !== command.tenantId) throw new Error(`render artifact ${artifact.sceneId} tenant mismatch`);
    }
  }

  private buildCheckpoints(command: PipelineCommand, existing: readonly StageCheckpoint[], now: Date, subtitleObjectKey?: string): StageCheckpoint[] {
    const desired: PipelineStage[] = ["submitted", "render_manifest_locked", "artifacts_downloaded", "timeline_assembled", "audio_synchronized", "subtitles_muxed", "exports_encoded", "checksummed"];
    const checkpoints = [...existing];
    let stage = currentStage(checkpoints);
    for (const next of desired) {
      const key = `${command.idempotencyKey}:${next}`;
      if (hasCheckpoint(checkpoints, key)) {
        stage = next;
        continue;
      }
      if (next !== "submitted") assertPipelineTransition(stage, next);
      checkpoints.push(stageCheckpointSchema.parse({
        stage: next,
        idempotencyKey: key,
        artifactKeys: this.artifactKeysForStage(command, next, subtitleObjectKey),
        metadata: { retryPolicy: command.retryPolicy, renderArtifactCount: command.renderArtifacts.length },
        completedAt: now.toISOString(),
      }));
      stage = next;
    }
    return checkpoints;
  }

  private artifactKeysForStage(command: PipelineCommand, stage: PipelineStage, subtitleObjectKey?: string): string[] {
    if (stage === "artifacts_downloaded" || stage === "timeline_assembled") return command.renderArtifacts.map((artifact) => artifact.asset.objectKey);
    if (stage === "subtitles_muxed") return subtitleObjectKey ? [subtitleObjectKey] : [];
    if (stage === "exports_encoded" || stage === "checksummed") return command.exportProfiles.map((profile) => `exports/${command.tenantId}/${command.workflowId}/${profile.platform}/${profileHash(profile)}.${profile.container}`);
    return [];
  }
}
