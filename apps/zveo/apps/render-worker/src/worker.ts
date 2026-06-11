import { z } from "zod";
import { Bulkhead, CircuitBreaker, Logger, MetricsRegistry, Tracer, type RenderProvider } from "@zveo/core";
import { createProviderRegistry, executeProviderRender } from "./provider-executor.js";
import { renderJobPayloadSchema } from "@zveo/contracts";
import { RenderQueueRuntime } from "@zveo/queue";
import { buildRenderAssetRecord } from "./render-asset.js";

const config = z.object({
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  WORKER_ID: z.string().min(1).default(`render-worker-${process.pid}`),
  CONCURRENCY: z.coerce.number().int().min(1).max(64).default(2),
  HEARTBEAT_MS: z.coerce.number().int().min(1000).max(60000).default(10000),
  PROVIDER_TIMEOUT_MS: z.coerce.number().int().min(10000).max(3_600_000).default(900000),
  VEO_PROVIDER_ENDPOINT: z.string().url().optional(),
  VEO_PROVIDER_API_KEY: z.string().min(1).optional(),
  GOOGLE_FLOW_PROVIDER_ENDPOINT: z.string().url().optional(),
  GOOGLE_FLOW_PROVIDER_API_KEY: z.string().min(1).optional(),
  NANO_BANANA_PROVIDER_ENDPOINT: z.string().url().optional(),
  NANO_BANANA_PROVIDER_API_KEY: z.string().min(1).optional(),
  PROVIDER_MOCK_MODE: z.enum(["true", "false"]).optional(),
  PROVIDER_BULKHEAD_CONCURRENCY: z.coerce.number().int().min(1).max(64).default(2),
  PROVIDER_BULKHEAD_QUEUE: z.coerce.number().int().min(0).max(1000).default(8),
  CIRCUIT_FAILURE_THRESHOLD: z.coerce.number().int().min(1).max(1000).default(5),
  CIRCUIT_HALF_OPEN_AFTER_MS: z.coerce.number().int().min(100).max(3_600_000).default(30_000),
}).parse(process.env);

const logger = new Logger({ service: "render-worker", workerId: config.WORKER_ID });
const metrics = new MetricsRegistry();
const runtime = new RenderQueueRuntime({ redisUrl: config.REDIS_URL, logger, metrics });
const tracer = new Tracer("render-worker", undefined);
const providerBulkheads = new Map<RenderProvider, Bulkhead>();
const providerCircuits = new Map<RenderProvider, CircuitBreaker>();

function bulkheadFor(provider: RenderProvider): Bulkhead {
  const existing = providerBulkheads.get(provider);
  if (existing) return existing;
  const created = new Bulkhead({ name: `provider:${provider}`, maxConcurrent: config.PROVIDER_BULKHEAD_CONCURRENCY, maxQueue: config.PROVIDER_BULKHEAD_QUEUE });
  providerBulkheads.set(provider, created);
  return created;
}

function circuitFor(provider: RenderProvider): CircuitBreaker {
  const existing = providerCircuits.get(provider);
  if (existing) return existing;
  const created = new CircuitBreaker({ name: `provider:${provider}`, failureThreshold: config.CIRCUIT_FAILURE_THRESHOLD, halfOpenAfterMs: config.CIRCUIT_HALF_OPEN_AFTER_MS });
  providerCircuits.set(provider, created);
  return created;
}

function providerConfig(endpoint: string | undefined, apiKey: string | undefined): { endpoint?: string; apiKey?: string } {
  return { ...(endpoint ? { endpoint } : {}), ...(apiKey ? { apiKey } : {}) };
}

const providerRegistry = createProviderRegistry({
  ...(process.env.NODE_ENV ? { nodeEnv: process.env.NODE_ENV } : {}),
  ...(config.PROVIDER_MOCK_MODE ? { providerMockMode: config.PROVIDER_MOCK_MODE } : {}),
  providerTimeoutMs: config.PROVIDER_TIMEOUT_MS,
  veo: providerConfig(config.VEO_PROVIDER_ENDPOINT, config.VEO_PROVIDER_API_KEY),
  googleFlow: providerConfig(config.GOOGLE_FLOW_PROVIDER_ENDPOINT, config.GOOGLE_FLOW_PROVIDER_API_KEY),
  nanoBanana: providerConfig(config.NANO_BANANA_PROVIDER_ENDPOINT, config.NANO_BANANA_PROVIDER_API_KEY),
}, logger);

const worker = runtime.createWorker(async (job) => {
  const payload = renderJobPayloadSchema.parse(job.data);
  const heartbeat = setInterval(() => void runtime.heartbeat(job, { workerId: config.WORKER_ID, provider: payload.provider }), config.HEARTBEAT_MS);
  try {
    return await tracer.withSpan("render.provider_execute", undefined, { provider: payload.provider, "workflow.id": payload.workflowId, "scene.id": payload.sceneId, "job.id": payload.jobId, correlationId: payload.correlationId }, async (span) => {
      const result = await bulkheadFor(payload.provider).execute(() => circuitFor(payload.provider).execute(() => executeProviderRender(providerRegistry, payload)));
      const asset = buildRenderAssetRecord(payload, result);
      if (result.artifactUri) span.setAttribute("artifact.uri", result.artifactUri);
      span.setAttribute("provider.job_id", result.providerJobId).setAttribute("provider.status", result.status);
      logger.info("provider render completed", { jobId: payload.jobId, workflowId: payload.workflowId, sceneId: payload.sceneId, providerJobId: result.providerJobId, status: result.status, artifactUri: result.artifactUri, metadata: result.metadata, asset, traceId: span.context.traceId });
      return { ...result, asset };
    });
  } finally {
    clearInterval(heartbeat);
  }
}, { concurrency: config.CONCURRENCY });

process.on("SIGTERM", () => {
  logger.info("render worker shutting down");
  void worker.close().then(() => runtime.close()).then(() => process.exit(0));
});
