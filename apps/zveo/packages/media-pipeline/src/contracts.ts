import { z } from "zod";
import { assetRecordSchema, uuidSchema } from "@zveo/core";
import { retryPolicySchema } from "@zveo/contracts";

export const mediaPlatformSchema = z.enum(["youtube", "tiktok", "instagram_reels", "x", "linkedin", "broadcast", "archive"]);
export const pipelineStageSchema = z.enum([
  "submitted",
  "render_manifest_locked",
  "artifacts_downloaded",
  "timeline_assembled",
  "audio_synchronized",
  "subtitles_muxed",
  "exports_encoded",
  "checksummed",
  "published",
  "failed",
  "cancelled",
]);

export const exportProfileSchema = z.object({
  platform: mediaPlatformSchema,
  container: z.enum(["mp4", "mov", "webm", "mkv"]).default("mp4"),
  videoCodec: z.enum(["h264", "h265", "vp9", "prores"]).default("h264"),
  audioCodec: z.enum(["aac", "opus", "pcm_s16le"]).default("aac"),
  width: z.number().int().min(256).max(8192),
  height: z.number().int().min(256).max(8192),
  fps: z.number().min(1).max(120).default(24),
  videoBitrateKbps: z.number().int().min(250).max(200_000),
  audioBitrateKbps: z.number().int().min(32).max(1536).default(192),
  colorSpace: z.enum(["bt709", "bt2020", "p3"]).default("bt709"),
  loudnessLufs: z.number().min(-30).max(-8).default(-14),
  maxDurationSeconds: z.number().int().positive().optional(),
});

export const beatMarkerSchema = z.object({
  id: z.string().trim().min(1).max(128),
  atSeconds: z.number().min(0),
  strength: z.number().min(0).max(1).default(1),
  label: z.string().trim().min(1).max(128).optional(),
});

export const subtitleCueSchema = z.object({
  id: z.string().trim().min(1).max(128),
  startSeconds: z.number().min(0),
  endSeconds: z.number().min(0),
  text: z.string().trim().min(1).max(512),
  speaker: z.string().trim().min(1).max(128).optional(),
}).superRefine((cue, ctx) => {
  if (cue.endSeconds <= cue.startSeconds) ctx.addIssue({ code: "custom", message: "subtitle cue endSeconds must be greater than startSeconds", path: ["endSeconds"] });
});

export const renderArtifactSchema = z.object({
  sceneId: z.string().trim().min(1).max(128),
  asset: assetRecordSchema,
  startSeconds: z.number().min(0),
  durationSeconds: z.number().positive(),
  checksumVerified: z.boolean(),
});

export const pipelineCommandSchema = z.object({
  commandId: uuidSchema,
  workflowId: uuidSchema,
  tenantId: uuidSchema,
  idempotencyKey: z.string().trim().min(8).max(256),
  renderArtifacts: z.array(renderArtifactSchema).min(1).max(4096),
  exportProfiles: z.array(exportProfileSchema).min(1).max(32),
  beatMarkers: z.array(beatMarkerSchema).max(10_000).default([]),
  subtitleCues: z.array(subtitleCueSchema).max(50_000).default([]),
  voiceoverAsset: assetRecordSchema.optional(),
  retryPolicy: retryPolicySchema.default({
    maxAttempts: 5,
    baseDelayMs: 1_000,
    maxDelayMs: 120_000,
    jitterRatio: 0.25,
    retryableCodes: ["RATE_LIMITED", "PROVIDER_TIMEOUT", "LEASE_LOST", "TRANSIENT_STORAGE"],
  }),
  requestedBy: uuidSchema,
});

export const stageCheckpointSchema = z.object({
  stage: pipelineStageSchema,
  idempotencyKey: z.string().trim().min(8).max(512),
  artifactKeys: z.array(z.string().trim().min(1).max(2048)).default([]),
  metadata: z.record(z.string(), z.unknown()).default({}),
  completedAt: z.string().datetime({ offset: true }),
});

export const pipelinePlanSchema = z.object({
  workflowId: uuidSchema,
  tenantId: uuidSchema,
  commandId: uuidSchema,
  stages: z.array(pipelineStageSchema),
  checkpoints: z.array(stageCheckpointSchema),
  ffmpegFilterGraph: z.string().trim().min(1).max(65_536),
  exportManifests: z.array(z.object({
    platform: mediaPlatformSchema,
    objectKey: z.string().trim().min(1).max(2048),
    profileHash: z.string().regex(/^[a-f0-9]{64}$/),
    expectedContentType: z.string().trim().min(3).max(128),
  })),
});

export type MediaPlatform = z.infer<typeof mediaPlatformSchema>;
export type PipelineStage = z.infer<typeof pipelineStageSchema>;
export type ExportProfile = z.infer<typeof exportProfileSchema>;
export type BeatMarker = z.infer<typeof beatMarkerSchema>;
export type SubtitleCue = z.infer<typeof subtitleCueSchema>;
export type RenderArtifact = z.infer<typeof renderArtifactSchema>;
export type PipelineCommand = z.infer<typeof pipelineCommandSchema>;
export type StageCheckpoint = z.infer<typeof stageCheckpointSchema>;
export type PipelinePlan = z.infer<typeof pipelinePlanSchema>;
