import { z } from "zod";

export const uuidSchema = z.string().uuid();
export const nonEmptyString = z.string().trim().min(1).max(4096);
export const isoDateTimeSchema = z.string().datetime({ offset: true });

export const workflowStateSchema = z.enum([
  "draft",
  "submitted",
  "validating",
  "queued",
  "compiling_scene_graph",
  "compiling_prompts",
  "rendering",
  "validating_assets",
  "completed",
  "failed",
  "cancelled",
  "recovering",
]);

export const jobStateSchema = z.enum([
  "queued",
  "leased",
  "running",
  "heartbeat_lost",
  "retry_scheduled",
  "succeeded",
  "failed",
  "dead_lettered",
  "cancelled",
]);

export const renderProviderSchema = z.enum(["veo", "google_flow", "nano_banana"]);
export type RenderProvider = z.infer<typeof renderProviderSchema>;
export const assetKindSchema = z.enum(["image", "video", "audio", "subtitle", "prompt", "manifest", "embedding"]);
export const roleSchema = z.enum(["owner", "admin", "producer", "operator", "viewer", "service"]);
export const permissionSchema = z.enum([
  "workflow:create",
  "workflow:read",
  "workflow:update",
  "workflow:cancel",
  "render:enqueue",
  "render:operate",
  "asset:read",
  "asset:write",
  "admin:read",
  "admin:write",
]);

export const retryPolicySchema = z.object({
  maxAttempts: z.number().int().min(1).max(25).default(5),
  baseDelayMs: z.number().int().min(100).max(300_000).default(1_000),
  maxDelayMs: z.number().int().min(1_000).max(3_600_000).default(120_000),
  jitterRatio: z.number().min(0).max(1).default(0.25),
  retryableCodes: z.array(z.string().min(1)).default(["RATE_LIMITED", "PROVIDER_TIMEOUT", "LEASE_LOST", "TRANSIENT_STORAGE"]),
});

export const cameraSchema = z.object({
  framing: nonEmptyString,
  movement: nonEmptyString,
  lensMm: z.number().int().min(8).max(300),
  aperture: z.string().trim().min(1).max(32).optional(),
  angle: z.string().trim().min(1).max(128).optional(),
  stabilization: z.string().trim().min(1).max(128).optional(),
});

export const lightingSchema = z.object({
  setup: nonEmptyString,
  colorTemperature: z.string().trim().min(2).max(64),
  contrast: z.string().trim().min(1).max(128),
  direction: z.string().trim().min(1).max(128).optional(),
  motivatedBy: z.string().trim().min(1).max(256).optional(),
});

export const environmentSchema = z.object({
  id: z.string().trim().min(1).max(128),
  location: nonEmptyString,
  timeOfDay: z.string().trim().min(1).max(128),
  weather: z.string().trim().min(1).max(128),
  geography: z.string().trim().min(1).max(512).optional(),
  persistentProps: z.array(z.string().trim().min(1).max(256)).max(100).default([]),
  continuityNotes: z.string().trim().min(1).max(2048).optional(),
});

export const characterMemorySchema = z.object({
  id: z.string().trim().min(1).max(128),
  name: z.string().trim().min(1).max(256),
  appearance: nonEmptyString,
  wardrobe: nonEmptyString,
  voice: z.string().trim().min(1).max(512).optional(),
  currentState: z.string().trim().min(1).max(1024).optional(),
  emotionalArc: z.string().trim().min(1).max(2048).optional(),
  referenceAssetIds: z.array(uuidSchema).max(64).default([]),
  visualReferenceIds: z.array(z.string().trim().min(1).max(128)).max(64).default([]),
});

export const visualReferenceSchema = z.object({
  id: z.string().trim().min(1).max(128),
  embeddingUri: z.string().url(),
  description: nonEmptyString,
  assetIds: z.array(uuidSchema).max(64).default([]),
  tags: z.array(z.string().trim().min(1).max(64)).max(64).default([]),
  weight: z.number().positive().max(10).default(1),
});

export const sceneNodeSchema = z.object({
  id: z.string().trim().min(1).max(128),
  title: z.string().trim().min(1).max(256),
  description: nonEmptyString,
  durationSeconds: z.number().int().min(1).max(600),
  inheritsFrom: z.string().trim().min(1).max(128).optional(),
  previousSceneIds: z.array(z.string().trim().min(1).max(128)).max(128).default([]),
  characterIds: z.array(z.string().trim().min(1).max(128)).max(128).default([]),
  visualReferenceIds: z.array(z.string().trim().min(1).max(128)).max(128).default([]),
  environment: environmentSchema.partial().extend({ id: z.string().trim().min(1).max(128) }).optional(),
  camera: cameraSchema.partial().optional(),
  lighting: lightingSchema.partial().optional(),
  continuityPolicy: z.object({
    inheritCamera: z.boolean().default(true),
    inheritLighting: z.boolean().default(true),
    persistEnvironment: z.boolean().default(true),
    carryCharacters: z.boolean().default(true),
  }).partial().default({}),
  characterStateUpdates: z.record(z.string().trim().min(1).max(128), z.string().trim().min(1).max(1024)).default({}),
  transitionIn: z.enum(["cut", "match_cut", "dissolve", "whip_pan", "j_cut", "l_cut", "fade"]).default("cut"),
  priority: z.number().int().min(0).max(100).default(50),
});

export const sceneGraphSchema = z.object({
  id: uuidSchema,
  name: z.string().trim().min(1).max(256),
  styleGuide: nonEmptyString,
  targetPlatforms: z.array(z.string().trim().min(1).max(64)).max(20).default(["youtube"]),
  characters: z.array(characterMemorySchema).max(256).default([]),
  visualReferences: z.array(visualReferenceSchema).max(512).default([]),
  scenes: z.array(sceneNodeSchema).min(1).max(2048),
}).superRefine((graph, ctx) => {
  const sceneIds = new Set(graph.scenes.map((scene) => scene.id));
  if (sceneIds.size !== graph.scenes.length) ctx.addIssue({ code: "custom", message: "scene ids must be unique", path: ["scenes"] });
  const characterIds = new Set(graph.characters.map((character) => character.id));
  const visualIds = new Set(graph.visualReferences.map((reference) => reference.id));
  graph.scenes.forEach((scene, index) => {
    if (scene.inheritsFrom && !sceneIds.has(scene.inheritsFrom)) ctx.addIssue({ code: "custom", message: `inheritsFrom references missing scene ${scene.inheritsFrom}`, path: ["scenes", index, "inheritsFrom"] });
    scene.previousSceneIds.forEach((id) => { if (!sceneIds.has(id)) ctx.addIssue({ code: "custom", message: `previousSceneIds references missing scene ${id}`, path: ["scenes", index, "previousSceneIds"] }); });
    scene.characterIds.forEach((id) => { if (!characterIds.has(id)) ctx.addIssue({ code: "custom", message: `characterIds references missing character ${id}`, path: ["scenes", index, "characterIds"] }); });
    scene.visualReferenceIds.forEach((id) => { if (!visualIds.has(id)) ctx.addIssue({ code: "custom", message: `visualReferenceIds references missing visual reference ${id}`, path: ["scenes", index, "visualReferenceIds"] }); });
  });
});

export const workflowSubmissionSchema = z.object({
  idempotencyKey: z.string().trim().min(8).max(256),
  tenantId: uuidSchema,
  projectId: uuidSchema,
  createdBy: uuidSchema,
  priority: z.number().int().min(0).max(100).default(50),
  renderProvider: renderProviderSchema,
  sceneGraph: sceneGraphSchema,
  retryPolicy: retryPolicySchema.default({}),
});

export const renderJobPayloadSchema = z.object({
  jobId: uuidSchema,
  workflowId: uuidSchema,
  tenantId: uuidSchema,
  sceneId: z.string().trim().min(1).max(128),
  provider: renderProviderSchema,
  prompt: nonEmptyString,
  negativePrompt: z.string().trim().max(4096).default(""),
  continuity: z.object({
    characterMemory: z.array(characterMemorySchema).default([]),
    visualReferences: z.array(visualReferenceSchema).default([]),
    camera: cameraSchema,
    lighting: lightingSchema,
    environment: environmentSchema,
  }),
  output: z.object({
    bucket: z.string().trim().min(3).max(128),
    keyPrefix: z.string().trim().min(1).max(1024),
    expectedMimeType: z.string().trim().min(3).max(128).default("video/mp4"),
  }),
  attempt: z.number().int().min(1).max(25).default(1),
  priority: z.number().int().min(0).max(100).default(50),
  idempotencyKey: z.string().trim().min(8).max(256),
  correlationId: uuidSchema,
});

export const assetRecordSchema = z.object({
  id: uuidSchema,
  tenantId: uuidSchema,
  workflowId: uuidSchema.optional(),
  kind: assetKindSchema,
  bucket: z.string().trim().min(3).max(128),
  objectKey: z.string().trim().min(1).max(1024),
  contentType: z.string().trim().min(3).max(128),
  bytes: z.number().int().positive(),
  sha256: z.string().regex(/^[a-f0-9]{64}$/),
  version: z.number().int().positive(),
  metadata: z.record(z.unknown()).default({}),
});

export type WorkflowState = z.infer<typeof workflowStateSchema>;
export type JobState = z.infer<typeof jobStateSchema>;
export type Role = z.infer<typeof roleSchema>;
export type Permission = z.infer<typeof permissionSchema>;
export type RetryPolicy = z.infer<typeof retryPolicySchema>;
export type SceneGraph = z.infer<typeof sceneGraphSchema>;
export type WorkflowSubmission = z.infer<typeof workflowSubmissionSchema>;
export type RenderJobPayload = z.infer<typeof renderJobPayloadSchema>;
export type AssetRecord = z.infer<typeof assetRecordSchema>;
