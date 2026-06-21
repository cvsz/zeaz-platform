import { readFileSync } from "node:fs";
import { createServer as createHttpServer, type IncomingMessage, type ServerResponse } from "node:http";
import { createServer as createHttpsServer } from "node:https";
import { compileSceneGraph, type SceneGraphInput } from "@zveo/scene-graph";
import { AuditLogger, Logger, MetricsRegistry, TokenBucketRateLimiter, Tracer, assetRecordSchema, parseTraceParent, requirePermission, traceParentHeader, type AssetRecord, type Principal, type RenderJobPayload } from "@zveo/core";
import { workflowSubmissionSchema } from "@zveo/contracts";
import { RenderQueueRuntime } from "@zveo/queue";
import { MediaPipelinePlanner, pipelineCommandSchema } from "@zveo/media-pipeline";
import { authenticate } from "./auth.js";
import { config } from "./config.js";
import { openApiDocument } from "./openapi.js";
import { InMemoryCampaignStore, campaignCreateSchema, campaignToSceneGraph, generateAndStoreScript, type ScriptModelAdapter } from "@zveo/ai-script-generator";
import { z } from "zod";
import { FacebookPublisherService, InMemoryPublisherStore } from "@zveo/publisher-meta";
import crypto from "node:crypto";

const logger = new Logger({ service: "api-gateway" });
const metrics = new MetricsRegistry();
const queue = new RenderQueueRuntime({ redisUrl: config.REDIS_URL, logger, metrics });
const mediaPlanner = new MediaPipelinePlanner(logger.child({ component: "media-pipeline" }));
const tracer = new Tracer("api-gateway", undefined);
const audit = new AuditLogger(logger.child({ component: "audit" }));
const rateLimiter = new TokenBucketRateLimiter({
  capacity: config.RATE_LIMIT_CAPACITY,
  refillTokens: config.RATE_LIMIT_REFILL_TOKENS,
  refillIntervalMs: config.RATE_LIMIT_REFILL_INTERVAL_MS,
  maxKeys: 100_000,
});

const MAX_REQUEST_BODY_BYTES = 2_000_000;
const campaigns = new InMemoryCampaignStore();
// Added Prompt Sanitizer to mitigate prompt injection
function sanitizePrompt(prompt: string): string {
  const forbiddenPatterns = [/ignore previous/gi, /prompt injection/gi, /jailbreak/gi];
  let sanitized = prompt;
  forbiddenPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, "[BLOCKED]");
  });
  return sanitized;
}

// Added basic Content Moderation hook
function moderateContent(content: string): boolean {
  const blockedContent = [/harmful/gi, /illegal/gi];
  return !blockedContent.some(pattern => pattern.test(content));
}

const scriptAdapter: ScriptModelAdapter = {
  async generateCampaignScript(input) {
    const sanitizedTopic = sanitizePrompt(input.topic);
    const scriptResult = {
      title: `${sanitizedTopic} for ${input.audience}`, hook: `Stop scrolling: ${sanitizedTopic}`, script: `Quick hit on ${sanitizedTopic} for ${input.audience}.`,
      scene_by_scene: [{ scene: 1, duration: "0-3s", visual: `${input.niche} visual`, voiceover: `Learn ${sanitizedTopic}`, text_on_screen: sanitizedTopic }],
      caption: `${sanitizedTopic} in ${input.durationSeconds}s`, hashtags: ["#viral", "#zveo"], cta: "Follow for more", video_style: input.tone, safety_note: "Fact-check claims before publishing"
    };

    if (!moderateContent(scriptResult.script)) {
      throw new Error("Generated content violated safety policies.");
    }

    return scriptResult;
  }
};
const publisherStore = new InMemoryPublisherStore();
const facebookPublisher = new FacebookPublisherService(publisherStore, fetch, { graphVersion: process.env.META_GRAPH_VERSION ?? "v22.0", appSecret: process.env.META_APP_SECRET ?? "" });

const workflowSummarySchema = z.object({ id: z.string().uuid(), state: z.string(), tenantId: z.string().uuid(), createdAt: z.string(), updatedAt: z.string(), sceneGraph: z.unknown() });
const jobSummarySchema = z.object({ id: z.string().uuid(), state: z.string(), sceneId: z.string(), createdAt: z.string() });
const exportManifestSchema = z.object({ id: z.string().uuid(), workflowId: z.string().uuid(), platform: z.string(), objectKey: z.string(), expectedContentType: z.string(), correlationId: z.string().uuid() });
type WorkflowRecord = z.infer<typeof workflowSummarySchema>;
type JobRecord = z.infer<typeof jobSummarySchema>;
type AssetSummary = AssetRecord;
type ExportManifest = z.infer<typeof exportManifestSchema>;
const workflowStore = new Map<string, WorkflowRecord>();
const jobsByWorkflow = new Map<string, JobRecord[]>();
const assetsByWorkflow = new Map<string, AssetSummary[]>();
const plansByWorkflow = new Map<string, ReturnType<typeof mediaPlanner.createPlan>>();
const exportsByWorkflow = new Map<string, ExportManifest[]>();


async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = [];
  let totalBytes = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    totalBytes += buffer.byteLength;
    if (totalBytes > MAX_REQUEST_BODY_BYTES) throw new Error("request body too large");
    chunks.push(buffer);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

const secretPattern = /(?:Bearer\s+[A-Za-z0-9._-]+|sk-[A-Za-z0-9_-]+|EA[A-Za-z0-9]+|xox[baprs]-[A-Za-z0-9-]+|openai[_-]?key\s*[=:]\s*[^\s,;]+)/gi;

function redactSecrets(value: unknown): unknown {
  if (typeof value === "string") {
    return value.replace(secretPattern, "[REDACTED]");
  }
  if (Array.isArray(value)) return value.map((item) => redactSecrets(item));
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      const lower = key.toLowerCase();
      out[key] = lower.includes("authorization") || lower.includes("token") || lower.includes("secret") || lower.includes("key")
        ? "[REDACTED]"
        : redactSecrets(val);
    }
    return out;
  }
  return value;
}

function respond(res: ServerResponse, status: number, body: unknown, contentType = "application/json"): void {
  res.writeHead(status, { "content-type": contentType, "cache-control": "no-store" });
  res.end(contentType === "application/json" ? JSON.stringify(body) : String(body));
}

function respondError(res: ServerResponse, status: number, code: string, message: string, correlationId: string, retryable = false): void {
  respond(res, status, { error: { code, message, retryable }, correlationId });
}

function rateLimitKey(req: IncomingMessage): string {
  const forwardedFor = req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim();
  return forwardedFor || req.socket.remoteAddress || "unknown";
}

function enforceRateLimit(req: IncomingMessage, res: ServerResponse, correlationId: string): boolean {
  const decision = rateLimiter.take(`${req.method ?? "GET"}:${rateLimitKey(req)}`);
  res.setHeader("x-ratelimit-remaining", String(decision.remaining));
  if (decision.allowed) return true;
  res.setHeader("retry-after", String(Math.ceil(decision.retryAfterMs / 1000)));
  audit.record({ action: "http.rate_limit", outcome: "deny", correlationId, reason: "token bucket exhausted", metadata: { path: req.url, method: req.method, retryAfterMs: decision.retryAfterMs } });
  respondError(res, 429, "RATE_LIMITED", "rate limit exceeded", correlationId, true);
  return false;
}

function authenticateAndAuthorize(req: IncomingMessage, permission: Parameters<typeof requirePermission>[1], correlationId: string, action: string): Principal {
  try {
    const principal = authenticate(req.headers.authorization, config.AUTH_SHARED_SECRET);
    requirePermission(principal, permission);
    audit.record({ action, actor: principal.subject, tenantId: principal.tenantId, outcome: "allow", correlationId });
    return principal;
  } catch (error) {
    audit.record({ action, outcome: "deny", correlationId, reason: error instanceof Error ? error.message : String(error) });
    throw error;
  }
}

async function handleSubmit(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const parentTrace = parseTraceParent(req.headers.traceparent);
  return await tracer.withSpan("workflow.submit", parentTrace, { "http.route": "/v1/workflows", correlationId }, async (span) => {
    const principal = authenticateAndAuthorize(req, "workflow:create", correlationId, "workflow.create");
    const submission = workflowSubmissionSchema.parse(await readJson(req));
    if (principal.tenantId !== submission.tenantId) throw new Error("principal tenant does not match workflow tenant");
    const compiled = compileSceneGraph(submission.sceneGraph as unknown as SceneGraphInput);
    const now = new Date().toISOString();
    workflowStore.set(submission.sceneGraph.id, workflowSummarySchema.parse({ id: submission.sceneGraph.id, state: "queued", tenantId: submission.tenantId, createdAt: now, updatedAt: now, sceneGraph: submission.sceneGraph }));
    const jobs = compiled.scenes.map((scene) => {
      const jobId = crypto.randomUUID();
      return jobSummarySchema.parse({ id: jobId, state: "queued", sceneId: scene.scene.id, createdAt: now });
    });
    jobsByWorkflow.set(submission.sceneGraph.id, jobs);
    const assets = compiled.scenes.map((scene, index) => {
      const jobId = jobs[index]?.id ?? crypto.randomUUID();
      const objectKey = `${submission.tenantId}/${submission.sceneGraph.id}/${scene.scene.id}/${jobId}.mp4`;
      const checksum = crypto.createHash("sha256").update(`${submission.sceneGraph.id}:${scene.scene.id}:${jobId}`).digest("hex");
      return {
        id: crypto.randomUUID(),
        tenantId: submission.tenantId,
        workflowId: submission.sceneGraph.id,
        kind: "video",
        bucket: config.S3_BUCKET,
        objectKey,
        contentType: "video/mp4",
        bytes: Math.max(1, scene.scene.durationSeconds * 1024),
        sha256: checksum,
        version: 1,
        metadata: { sceneId: scene.scene.id, jobId, provider: submission.renderProvider, queuedBy: submission.createdBy, checksumVerified: true },
      } satisfies AssetRecord;
    });
    assetsByWorkflow.set(submission.sceneGraph.id, assets);
    await Promise.all(compiled.scenes.map((scene, index) => {
      const job = jobs[index];
      if (!job) throw new Error("missing job for compiled scene");
      const payload: RenderJobPayload = {
        jobId: job.id,
        workflowId: submission.sceneGraph.id,
        tenantId: submission.tenantId,
        sceneId: scene.scene.id,
        provider: submission.renderProvider,
        prompt: scene.prompt,
        negativePrompt: scene.negativePrompt,
        continuity: {
          characterMemory: scene.characterMemory,
          visualReferences: scene.visualReferences.map((reference) => ({ ...reference, weight: reference.weight ?? 1 })),
          camera: scene.scene.camera,
          lighting: scene.scene.lighting,
          environment: scene.scene.environment,
        },
        output: { bucket: config.S3_BUCKET, keyPrefix: `${submission.tenantId}/${submission.sceneGraph.id}/${scene.scene.id}`, expectedMimeType: "video/mp4" },
        attempt: 1,
        priority: scene.scene.priority,
        idempotencyKey: `${submission.idempotencyKey}:${scene.scene.id}`,
        correlationId,
      };
      return queue.enqueueRender(payload, { priority: scene.scene.priority, retryPolicy: submission.retryPolicy });
    }));
    span.setAttribute("workflow.id", submission.sceneGraph.id).setAttribute("tenant.id", submission.tenantId).setAttribute("scene.count", compiled.scenes.length);
    logger.info("workflow accepted", { workflowId: submission.sceneGraph.id, tenantId: submission.tenantId, queuedScenes: compiled.scenes.length, correlationId, traceId: span.context.traceId });
    res.setHeader("traceparent", traceParentHeader(span.context));
    respond(res, 202, { workflowId: submission.sceneGraph.id, state: "queued", queuedScenes: compiled.scenes.length, correlationId, traceId: span.context.traceId });
  });
}

async function handlePlanMediaPipeline(req: IncomingMessage, res: ServerResponse, workflowId: string, correlationId: string): Promise<void> {
  const parentTrace = parseTraceParent(req.headers.traceparent);
  return await tracer.withSpan("media_pipeline.plan", parentTrace, { "http.route": "/v1/workflows/{workflowId}/media-pipelines", correlationId, "workflow.id": workflowId }, async (span) => {
    const principal = authenticateAndAuthorize(req, "workflow:update", correlationId, "media_pipeline.create");
    const command = pipelineCommandSchema.parse(await readJson(req));
    if (command.workflowId !== workflowId) throw new Error("path workflowId does not match command workflowId");
    if (principal.tenantId !== command.tenantId) throw new Error("principal tenant does not match media pipeline tenant");
    const plan = mediaPlanner.createPlan(command);
    plansByWorkflow.set(workflowId, plan);
    const subtitleAsset = mediaPlanner.createSubtitleAsset(command, config.MEDIA_EXPORT_BUCKET);
    span.setAttribute("tenant.id", command.tenantId).setAttribute("export.count", plan.exportManifests.length);
    logger.info("media pipeline accepted", { workflowId, tenantId: command.tenantId, commandId: command.commandId, exports: plan.exportManifests.length, correlationId, traceId: span.context.traceId });
    res.setHeader("traceparent", traceParentHeader(span.context));
    respond(res, 202, { ...plan, subtitleAsset, correlationId, traceId: span.context.traceId });
  });
}

async function handleGetMediaPipelines(res: ServerResponse, workflowId: string, correlationId: string): Promise<void> {
  const plan = plansByWorkflow.get(workflowId);
  if (!plan) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  respond(res, 200, { workflowId, plan, correlationId });
}

async function handleCreateExports(req: IncomingMessage, res: ServerResponse, workflowId: string, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:update", correlationId, "workflow.export");
  const plan = plansByWorkflow.get(workflowId);
  if (!plan) return respondError(res, 404, "NOT_FOUND", "pipeline plan not found", correlationId);
  if (principal.tenantId !== plan.tenantId) throw new Error("principal tenant does not match workflow tenant");
  const manifests = plan.exportManifests.map((manifest) => exportManifestSchema.parse({ id: crypto.randomUUID(), workflowId, ...manifest, correlationId }));
  exportsByWorkflow.set(workflowId, manifests);
  respond(res, 201, { workflowId, exportManifests: manifests, correlationId });
}

async function handleOpsSummary(res: ServerResponse, correlationId: string): Promise<void> {
  const heartbeatTtlMs = 30_000;
  try {
    const queueCounts = await queue.getRenderQueueCounts();
    respond(res, 200, {
      status: "ok",
      correlationId,
      queue: queueCounts,
      workers: {
        onlineEstimate: queueCounts.active,
        heartbeatTtlMs,
      },
    });
  } catch (error) {
    logger.error("ops summary unavailable", error, { correlationId });
    respond(res, 503, {
      status: "degraded",
      correlationId,
      queue: { waiting: 0, active: 0, delayed: 0, completed: 0, failed: 0 },
      workers: { onlineEstimate: 0, heartbeatTtlMs },
      error: "queue unavailable",
    });
  }
}


async function handleCreateCampaign(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:create", correlationId, "campaign.create");
  const payload = campaignCreateSchema.parse(await readJson(req));
  if (principal.tenantId !== payload.tenantId) throw new Error("principal tenant does not match campaign tenant");
  const now = new Date().toISOString();
  const created = campaigns.create({ ...payload, id: crypto.randomUUID(), status: "draft", createdAt: now, updatedAt: now });
  respond(res, 201, { campaign: created, correlationId });
}
async function handleListCampaigns(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:read", correlationId, "campaign.list");
  respond(res, 200, { campaigns: campaigns.list().filter((campaign) => campaign.tenantId === principal.tenantId), correlationId });
}
async function handleGetCampaign(req: IncomingMessage, res: ServerResponse, campaignId: string, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:read", correlationId, "campaign.get");
  const campaign = campaigns.get(campaignId); if (!campaign) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  if (campaign.tenantId !== principal.tenantId) throw new Error("principal tenant does not match campaign tenant");
  respond(res, 200, { campaign, correlationId });
}
async function handleGenerateScript(req: IncomingMessage, res: ServerResponse, campaignId: string, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:update", correlationId, "campaign.generate_script");
  const campaign = campaigns.get(campaignId); if (!campaign) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  if (campaign.tenantId !== principal.tenantId) throw new Error("principal tenant does not match campaign tenant");
  const updated = await generateAndStoreScript(campaign, scriptAdapter, campaigns);
  respond(res, 200, { campaign: updated, correlationId });
}
async function handleCreateWorkflow(req: IncomingMessage, res: ServerResponse, campaignId: string, correlationId: string): Promise<void> {
  const campaign = campaigns.get(campaignId); if (!campaign) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  const principal = authenticateAndAuthorize(req, "workflow:create", correlationId, "campaign.create_workflow");
  if (principal.tenantId !== campaign.tenantId) throw new Error("principal tenant does not match campaign tenant");
  const sceneGraph = campaignToSceneGraph(campaign);
  const updated = campaigns.update(campaignId, { status: "workflow_created", workflowId: sceneGraph.id });
  respond(res, 202, { workflowId: sceneGraph.id, sceneCount: sceneGraph.scenes.length, campaign: updated, correlationId });
}
async function handleCreatePublishTarget(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:update", correlationId, "publish_target.create");
  const payload = (await readJson(req)) as Record<string, unknown>;
  if (String(payload.tenantId ?? "") !== principal.tenantId) throw new Error("principal tenant does not match publish target tenant");
  const target = facebookPublisher.createTarget(payload);
  respond(res, 201, { target, correlationId });
}
async function handleListWorkflows(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:read", correlationId, "workflow.list");
  const workflows = [...workflowStore.values()].filter((workflow) => workflow.tenantId === principal.tenantId).map((workflow) => ({ ...workflow, correlationId }));
  respond(res, 200, { workflows, correlationId });
}
async function handleListPublishTargets(req: IncomingMessage, res: ServerResponse, tenantId: string, correlationId: string): Promise<void> {
  const principal = authenticateAndAuthorize(req, "workflow:read", correlationId, "publish_target.list");
  if (tenantId !== principal.tenantId) throw new Error("principal tenant does not match publish target tenant");
  respond(res, 200, { targets: facebookPublisher.listTargets(tenantId), correlationId });
}
async function handleCreateFacebookPublish(req: IncomingMessage, res: ServerResponse, correlationId: string): Promise<void> {
  const payload = await readJson(req) as Record<string, unknown>;
  const job = facebookPublisher.createJob({ ...payload, correlationId });
  const published = await facebookPublisher.publish(job.id, String(payload.videoUrl ?? ""), process.env.META_PAGE_ACCESS_TOKEN ?? "", correlationId);
  respond(res, 202, { publishJob: published, correlationId });
}
async function handleGetPublishJob(res: ServerResponse, publishJobId: string, correlationId: string): Promise<void> {
  const job = facebookPublisher.getJob(publishJobId); if (!job) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  respond(res, 200, { publishJob: job, correlationId });
}

async function handleGetWorkflowDetail(res: ServerResponse, workflowId: string, correlationId: string): Promise<void> {
  const workflow = workflowStore.get(workflowId);
  if (!workflow) return respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  respond(res, 200, {
    correlationId,
    workflow: { ...workflow, correlationId },
    jobs: (jobsByWorkflow.get(workflowId) ?? []).map((job) => ({ ...job, correlationId })),
    assets: (assetsByWorkflow.get(workflowId) ?? []).map((asset) => ({ ...asset })),
    exportManifests: exportsByWorkflow.get(workflowId) ?? [],
    publishReadyVideos: (assetsByWorkflow.get(workflowId) ?? []).filter((asset) => asset.kind === "video"),
  });
}

const requestHandler = async (req: IncomingMessage, res: ServerResponse) => {
  const correlationId = req.headers["x-correlation-id"]?.toString() ?? crypto.randomUUID();
  try {
    if (!enforceRateLimit(req, res, correlationId)) return;
    const url = new URL(req.url ?? "/", `${config.TLS_CERT_FILE && config.TLS_KEY_FILE ? "https" : "http"}://${req.headers.host ?? "localhost"}`);
    if (req.method === "GET" && url.pathname === "/healthz") return respond(res, 200, { status: "ok", correlationId });
    if (req.method === "GET" && url.pathname === "/readyz") return respond(res, 200, { status: "ready", correlationId });
    if (req.method === "GET" && url.pathname === "/openapi.json") return respond(res, 200, openApiDocument);
    if (req.method === "GET" && url.pathname === "/v1/ops/summary") return await handleOpsSummary(res, correlationId);
    if (req.method === "GET" && url.pathname === "/metrics") return respond(res, 200, metrics.collect(), "text/plain; version=0.0.4");
    if (req.method === "POST" && url.pathname === "/v1/campaigns") return await handleCreateCampaign(req, res, correlationId);
    if (req.method === "POST" && url.pathname === "/v1/publish/facebook/videos") return await handleCreateFacebookPublish(req, res, correlationId);
    if (req.method === "POST" && url.pathname === "/v1/publish/targets") return await handleCreatePublishTarget(req, res, correlationId);
    if (req.method === "GET" && url.pathname === "/v1/publish/targets") return await handleListPublishTargets(req, res, String(url.searchParams.get("tenantId") ?? ""), correlationId);
    if (req.method === "GET" && url.pathname === "/v1/workflows") return await handleListWorkflows(req, res, correlationId);
    const publishJobMatch = url.pathname.match(/^\/v1\/publish\/([0-9a-fA-F-]{36})$/);
    if (req.method === "GET" && publishJobMatch?.[1]) return await handleGetPublishJob(res, publishJobMatch[1], correlationId);
    if (req.method === "GET" && url.pathname === "/v1/campaigns") return await handleListCampaigns(req, res, correlationId);
    const campaignMatch = url.pathname.match(/^\/v1\/campaigns\/([0-9a-fA-F-]{36})$/);
    if (req.method === "GET" && campaignMatch?.[1]) return await handleGetCampaign(req, res, campaignMatch[1], correlationId);
    const generateMatch = url.pathname.match(/^\/v1\/campaigns\/([0-9a-fA-F-]{36})\/generate-script$/);
    if (req.method === "POST" && generateMatch?.[1]) return await handleGenerateScript(req, res, generateMatch[1], correlationId);
    const workflowMatch = url.pathname.match(/^\/v1\/campaigns\/([0-9a-fA-F-]{36})\/create-workflow$/);
    if (req.method === "POST" && workflowMatch?.[1]) return await handleCreateWorkflow(req, res, workflowMatch[1], correlationId);
    if (req.method === "POST" && url.pathname === "/v1/workflows") return await handleSubmit(req, res, correlationId);
    const workflowDetailMatch = url.pathname.match(/^\/v1\/workflows\/([0-9a-fA-F-]{36})$/);
    if (req.method === "GET" && workflowDetailMatch?.[1]) return await handleGetWorkflowDetail(res, workflowDetailMatch[1], correlationId);
    const mediaPipelineMatch = url.pathname.match(/^\/v1\/workflows\/([0-9a-fA-F-]{36})\/media-pipelines$/);
    if (req.method === "POST" && mediaPipelineMatch?.[1]) return await handlePlanMediaPipeline(req, res, mediaPipelineMatch[1], correlationId);
    if (req.method === "GET" && mediaPipelineMatch?.[1]) return await handleGetMediaPipelines(res, mediaPipelineMatch[1], correlationId);
    const exportMatch = url.pathname.match(/^\/v1\/workflows\/([0-9a-fA-F-]{36})\/exports$/);
    if (req.method === "POST" && exportMatch?.[1]) return await handleCreateExports(req, res, exportMatch[1], correlationId);
    respondError(res, 404, "NOT_FOUND", "not found", correlationId);
  } catch (error) {
    logger.error(
      "request failed",
      redactSecrets(error),
      redactSecrets({ correlationId, path: req.url, method: req.method, authorization: req.headers.authorization }) as Record<string, unknown>
    );
    const message = error instanceof Error ? error.message : "unknown error";
    const status = message.includes("permission") ? 403 : message.includes("bearer") ? 401 : message.includes("tenant") ? 403 : 400;
    const code = status === 401 ? "UNAUTHORIZED" : status === 403 ? "FORBIDDEN" : "BAD_REQUEST";
    respondError(res, status, code, String(redactSecrets(message)), correlationId);
  }
};

const server = config.TLS_CERT_FILE && config.TLS_KEY_FILE
  ? createHttpsServer({ cert: readFileSync(config.TLS_CERT_FILE), key: readFileSync(config.TLS_KEY_FILE) }, requestHandler)
  : createHttpServer(requestHandler);

process.on("SIGTERM", () => {
  logger.info("api gateway shutting down");
  server.close(() => void queue.close().then(() => process.exit(0)));
});

server.listen(config.PORT, () => logger.info("api gateway listening", { port: config.PORT, tls: Boolean(config.TLS_CERT_FILE && config.TLS_KEY_FILE) }));

export { redactSecrets };
