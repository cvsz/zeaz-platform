import { z } from "zod";
import { buildDashboardAuthHeaders, getDashboardRuntimeOptions } from "./service-auth";

const ServiceProbeSchema = z.object({
  status: z.string(),
  correlationId: z.string().min(1)
});

const OpsSummarySchema = z.object({
  status: z.string(),
  correlationId: z.string().min(1),
  queue: z.object({
    waiting: z.number().int().nonnegative(),
    active: z.number().int().nonnegative(),
    delayed: z.number().int().nonnegative(),
    completed: z.number().int().nonnegative(),
    failed: z.number().int().nonnegative()
  }),
  workers: z.object({
    onlineEstimate: z.number().int().nonnegative(),
    heartbeatTtlMs: z.number().int().positive()
  })
});

const ProviderHealthSchema = z.object({
  provider: z.string(),
  status: z.enum(["healthy", "degraded", "offline", "ok", "unavailable"]),
  latencyMs: z.number().nonnegative().optional(),
  correlationId: z.string().min(1)
});

const ProvidersHealthResponseSchema = z.object({
  status: z.string(),
  correlationId: z.string().min(1),
  providers: z.array(ProviderHealthSchema)
});

const SceneNodeSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  durationSeconds: z.number().int().positive(),
});

const SceneGraphSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  styleGuide: z.string().min(1),
  targetPlatforms: z.array(z.string().min(1)).min(1),
  scenes: z.array(SceneNodeSchema).min(1),
});

const AssetRecordSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  workflowId: z.string().uuid().optional(),
  kind: z.enum(["image", "video", "audio", "subtitle", "prompt", "manifest", "embedding"]),
  bucket: z.string().min(3).max(128),
  objectKey: z.string().min(1).max(1024),
  contentType: z.string().min(3).max(128),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  version: z.number().int().positive(),
  metadata: z.record(z.unknown()),
});

const ExportProfileSchema = z.object({
  platform: z.enum(["youtube", "tiktok", "instagram_reels", "x", "linkedin", "broadcast", "archive"]),
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

const BeatMarkerSchema = z.object({
  id: z.string().min(1),
  atSeconds: z.number().min(0),
  strength: z.number().min(0).max(1).default(1),
  label: z.string().min(1).optional(),
});

const SubtitleCueSchema = z.object({
  id: z.string().min(1),
  startSeconds: z.number().min(0),
  endSeconds: z.number().min(0),
  text: z.string().min(1).max(512),
  speaker: z.string().min(1).optional(),
}).superRefine((cue, ctx) => {
  if (cue.endSeconds <= cue.startSeconds) {
    ctx.addIssue({ code: "custom", message: "subtitle cue endSeconds must be greater than startSeconds", path: ["endSeconds"] });
  }
});

const RenderArtifactSchema = z.object({
  sceneId: z.string().min(1),
  asset: AssetRecordSchema,
  startSeconds: z.number().min(0),
  durationSeconds: z.number().positive(),
  checksumVerified: z.boolean(),
});

const PipelineCommandSchema = z.object({
  commandId: z.string().uuid(),
  workflowId: z.string().uuid(),
  tenantId: z.string().uuid(),
  idempotencyKey: z.string().min(8).max(256),
  renderArtifacts: z.array(RenderArtifactSchema).min(1),
  exportProfiles: z.array(ExportProfileSchema).min(1),
  beatMarkers: z.array(BeatMarkerSchema).default([]),
  subtitleCues: z.array(SubtitleCueSchema).default([]),
  voiceoverAsset: AssetRecordSchema.optional(),
  retryPolicy: z.object({
    maxAttempts: z.number().int().min(1).max(25).default(5),
    baseDelayMs: z.number().int().min(100).max(300_000).default(1_000),
    maxDelayMs: z.number().int().min(1_000).max(3_600_000).default(120_000),
    jitterRatio: z.number().min(0).max(1).default(0.25),
    retryableCodes: z.array(z.string().min(1)).default(["RATE_LIMITED", "PROVIDER_TIMEOUT", "LEASE_LOST", "TRANSIENT_STORAGE"]),
  }).default({}),
  requestedBy: z.string().uuid(),
});

const StageCheckpointSchema = z.object({
  stage: z.enum([
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
  ]),
  idempotencyKey: z.string().min(8).max(512),
  artifactKeys: z.array(z.string().min(1).max(2048)),
  metadata: z.record(z.unknown()),
  completedAt: z.string(),
});

const PipelinePlanSchema = z.object({
  workflowId: z.string().uuid(),
  tenantId: z.string().uuid(),
  commandId: z.string().uuid(),
  stages: z.array(StageCheckpointSchema.shape.stage),
  checkpoints: z.array(StageCheckpointSchema),
  ffmpegFilterGraph: z.string().min(1),
  exportManifests: z.array(z.object({
    platform: z.enum(["youtube", "tiktok", "instagram_reels", "x", "linkedin", "broadcast", "archive"]),
    objectKey: z.string().min(1),
    profileHash: z.string().regex(/^[a-f0-9]{64}$/),
    expectedContentType: z.string().min(3).max(128),
  })),
});

const WorkflowSchema = z.object({
  id: z.string(),
  state: z.string(),
  tenantId: z.string().optional(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  correlationId: z.string().min(1)
});
const WorkflowListSchema = z.object({ correlationId: z.string().min(1), workflows: z.array(WorkflowSchema) });
const WorkflowDetailSchema = z.object({
  correlationId: z.string().min(1),
  workflow: WorkflowSchema.extend({ sceneGraph: SceneGraphSchema }),
  jobs: z.array(z.object({ id: z.string(), state: z.string(), sceneId: z.string().optional(), createdAt: z.string().optional(), correlationId: z.string().min(1) })),
  assets: z.array(AssetRecordSchema),
  exportManifests: z.array(z.object({ id: z.string(), platform: z.string(), objectKey: z.string(), expectedContentType: z.string(), correlationId: z.string().min(1) })),
  publishReadyVideos: z.array(AssetRecordSchema),
});
const PipelineSubmitResponseSchema = PipelinePlanSchema.extend({
  subtitleAsset: AssetRecordSchema.optional(),
  correlationId: z.string().min(1),
  traceId: z.string().min(1),
});

export type ServiceProbe = z.infer<typeof ServiceProbeSchema>;
export type OpsSummary = z.infer<typeof OpsSummarySchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowDetail = z.infer<typeof WorkflowDetailSchema>;
export type SceneGraph = z.infer<typeof SceneGraphSchema>;
export type AssetRecord = z.infer<typeof AssetRecordSchema>;
export type ExportProfile = z.infer<typeof ExportProfileSchema>;
export type BeatMarker = z.infer<typeof BeatMarkerSchema>;
export type SubtitleCue = z.infer<typeof SubtitleCueSchema>;
export type RenderArtifact = z.infer<typeof RenderArtifactSchema>;
export type PipelineCommand = z.infer<typeof PipelineCommandSchema>;
export type PipelinePlan = z.infer<typeof PipelinePlanSchema>;
export type PipelineSubmitResponse = z.infer<typeof PipelineSubmitResponseSchema>;

function getApiBaseUrl(): string {
  return getDashboardRuntimeOptions().apiBaseUrl;
}

function buildRequestInit(authenticated = false, init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers);
  if (authenticated) {
    for (const [key, value] of Object.entries(buildDashboardAuthHeaders())) {
      headers.set(key, value);
    }
  }

  return {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  };
}

async function fetchAndParse<T>(path: string, schema: z.ZodSchema<T>, authenticated = false, init: RequestInit = {}): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, buildRequestInit(authenticated, init));
  if (response.status === 404) throw new Error(`missing-endpoint:${path}`);
  if (!response.ok) throw new Error(`API request failed for ${path}: ${response.status}`);
  return schema.parse(await response.json());
}

export async function getHealth(): Promise<ServiceProbe> { return fetchAndParse("/healthz", ServiceProbeSchema); }
export async function getReadiness(): Promise<ServiceProbe> { return fetchAndParse("/readyz", ServiceProbeSchema); }
export async function getOpsSummary(): Promise<OpsSummary> { return fetchAndParse("/v1/ops/summary", OpsSummarySchema); }
export async function getProvidersHealth(): Promise<ProviderHealth[]> {
  try {
    const response = await fetchAndParse("/v1/providers/health", ProvidersHealthResponseSchema, true);
    return response.providers.map((provider) => ({
      ...provider,
      status: provider.status === "ok" ? "healthy" : provider.status === "unavailable" ? "offline" : provider.status,
    }));
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("missing-endpoint:")) {
      return [
        { provider: "veo", status: "offline", correlationId: "fallback-provider-health" },
        { provider: "google_flow", status: "offline", correlationId: "fallback-provider-health" },
        { provider: "nano_banana", status: "offline", correlationId: "fallback-provider-health" },
      ];
    }
    throw error;
  }
}
export async function getWorkflows(): Promise<Workflow[]> {
  const response = await fetchAndParse("/v1/workflows", WorkflowListSchema, true);
  return response.workflows;
}
export async function getWorkflowDetail(id: string): Promise<WorkflowDetail> {
  return fetchAndParse(`/v1/workflows/${id}`, WorkflowDetailSchema, true);
}

const CampaignSchema = z.object({
  id: z.string(),
  tenantId: z.string().uuid().optional(),
  projectId: z.string().uuid().optional(),
  niche: z.string().optional(),
  audience: z.string().optional(),
  topic: z.string(),
  language: z.string().optional(),
  tone: z.string().optional(),
  durationSeconds: z.number().int().positive().optional(),
  status: z.string(),
  title: z.string().optional(),
  hook: z.string().optional(),
  script: z.string().optional(),
  caption: z.string().optional(),
  scenes: z.unknown().optional(),
  hashtags: z.array(z.string()).optional(),
  workflowId: z.string().optional(),
  correlationId: z.string().optional(),
});
export type Campaign = z.infer<typeof CampaignSchema>;
const CampaignListSchema = z.object({ correlationId: z.string().min(1), campaigns: z.array(CampaignSchema) });
const PublishJobSchema = z.object({ id: z.string(), state: z.string(), provider: z.literal("facebook"), correlationId: z.string().optional() });
const PublishJobResponseSchema = z.object({ correlationId: z.string().min(1), publishJob: PublishJobSchema });
export async function getCampaigns(): Promise<Campaign[]> { const response = await fetchAndParse("/v1/campaigns", CampaignListSchema, true); return response.campaigns; }
export async function getFacebookPublishJob(id: string): Promise<z.infer<typeof PublishJobSchema>> {
  const response = await fetchAndParse(`/v1/publish/${id}`, PublishJobResponseSchema, true);
  return response.publishJob;
}

export const DEFAULT_EXPORT_PROFILES: readonly ExportProfile[] = [
  { platform: "youtube", container: "mp4", width: 1920, height: 1080, videoBitrateKbps: 12_000, fps: 24, audioBitrateKbps: 192, colorSpace: "bt709", loudnessLufs: -14, videoCodec: "h264", audioCodec: "aac" },
  { platform: "tiktok", container: "mp4", width: 1080, height: 1920, videoBitrateKbps: 9_000, fps: 30, audioBitrateKbps: 192, colorSpace: "bt709", loudnessLufs: -14, videoCodec: "h264", audioCodec: "aac" },
  { platform: "instagram_reels", container: "mp4", width: 1080, height: 1920, videoBitrateKbps: 8_000, fps: 30, audioBitrateKbps: 192, colorSpace: "bt709", loudnessLufs: -14, videoCodec: "h264", audioCodec: "aac" },
] as const;

export function deriveRenderArtifactsFromWorkflowDetail(detail: WorkflowDetail): Array<{ sceneId: string; asset: AssetRecord; startSeconds: number; durationSeconds: number; checksumVerified: boolean }> {
  const assetsByScene = new Map<string, AssetRecord>();
  for (const asset of detail.assets) {
    const sceneId = String(asset.metadata.sceneId ?? asset.workflowId ?? asset.id);
    if (!assetsByScene.has(sceneId)) {
      assetsByScene.set(sceneId, asset);
    }
  }

  let startSeconds = 0;
  return detail.workflow.sceneGraph.scenes.map((scene) => {
    const asset = assetsByScene.get(scene.id) ?? detail.assets.find((candidate) => String(candidate.metadata.sceneId) === scene.id) ?? null;
    if (!asset) {
      throw new Error(`missing asset for scene ${scene.id}`);
    }

    const renderArtifact = {
      sceneId: scene.id,
      asset,
      startSeconds,
      durationSeconds: scene.durationSeconds,
      checksumVerified: asset.metadata.checksumVerified !== false,
    };
    startSeconds += scene.durationSeconds;
    return renderArtifact;
  });
}

export function buildArtifactBackedPipelineCommand(detail: WorkflowDetail, options: {
  readonly requestedBy: string;
  readonly tenantId: string;
  readonly commandId?: string;
  readonly idempotencyKey?: string;
  readonly exportProfiles?: readonly ExportProfile[];
}): PipelineCommand {
  const renderArtifacts = deriveRenderArtifactsFromWorkflowDetail(detail);
  const durationMap = new Map(detail.workflow.sceneGraph.scenes.map((scene) => [scene.id, scene.durationSeconds] as const));
  let cursor = 0;
  const beatMarkers: BeatMarker[] = [];
  const subtitleCues: SubtitleCue[] = [];

  for (const scene of detail.workflow.sceneGraph.scenes) {
    beatMarkers.push({
      id: `beat-${scene.id}`,
      atSeconds: cursor,
      strength: 1,
      label: scene.title,
    });
    subtitleCues.push({
      id: `cue-${scene.id}`,
      startSeconds: cursor,
      endSeconds: cursor + (durationMap.get(scene.id) ?? scene.durationSeconds),
      text: `${scene.title}: ${scene.description}`,
    });
    cursor += durationMap.get(scene.id) ?? scene.durationSeconds;
  }

  const commandId = options.commandId ?? globalThis.crypto.randomUUID();
  return PipelineCommandSchema.parse({
    commandId,
    workflowId: detail.workflow.id,
    tenantId: options.tenantId,
    idempotencyKey: options.idempotencyKey ?? `pipeline-${detail.workflow.id}-${commandId}`,
    renderArtifacts,
    exportProfiles: options.exportProfiles ?? DEFAULT_EXPORT_PROFILES,
    beatMarkers,
    subtitleCues,
    retryPolicy: {},
    requestedBy: options.requestedBy,
  });
}

export async function submitMediaPipeline(workflowId: string, command: PipelineCommand): Promise<PipelineSubmitResponse> {
  return fetchAndParse(`/v1/workflows/${workflowId}/media-pipelines`, PipelineSubmitResponseSchema, true, {
    method: "POST",
    body: JSON.stringify(command),
  });
}
