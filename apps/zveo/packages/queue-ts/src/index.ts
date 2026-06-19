import { Queue, Worker, QueueEvents, type JobsOptions, type Processor, type WorkerOptions, type Job } from "bullmq";
import { Redis } from "ioredis";
import { classifyError, Logger, MetricsRegistry, shouldRetry, type ClassifiedError, type RenderJobPayload, type RetryPolicy } from "@zveo/core";
import { renderJobPayloadSchema, retryPolicySchema } from "@zveo/contracts";

export const RENDER_QUEUE = "zveo.render";
export const RENDER_DLQ = "zveo.render.dlq";
export const RENDER_STREAM = "zveo:streams:render-events";

export interface QueueRuntimeOptions {
  redisUrl: string;
  namespace?: string;
  logger?: Logger;
  metrics?: MetricsRegistry;
  defaultRetryPolicy?: RetryPolicy;
  deadLetterAnalyzer?: DeadLetterAnalyzer;
}

export interface EnqueueRenderOptions {
  priority?: number;
  delayMs?: number;
  retryPolicy?: RetryPolicy;
}

export interface DeadLetterRecord {
  jobId: string;
  queueJobId: string;
  workflowId: string;
  tenantId: string;
  sceneId: string;
  attemptsMade: number;
  classifiedError: ClassifiedError;
  deadLetteredAt: string;
}

export type DeadLetterAnalyzer = (record: DeadLetterRecord) => Promise<void> | void;

export interface AdaptiveConcurrencyOptions {
  minConcurrency: number;
  maxConcurrency: number;
  targetLatencySeconds: number;
  evaluationWindowMs: number;
}

export interface RenderQueueCounts {
  waiting: number;
  active: number;
  delayed: number;
  completed: number;
  failed: number;
}

export function computeBackoffDelay(attempt: number, policy: RetryPolicy): number {
  const exponential = Math.min(policy.maxDelayMs, policy.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = exponential * policy.jitterRatio * Math.random();
  return Math.round(exponential + jitter);
}

export function bullPriority(priority: number): number {
  return 101 - Math.max(0, Math.min(100, priority));
}

export class RenderQueueRuntime {
  readonly connection: Redis;
  readonly renderQueue: Queue<RenderJobPayload>;
  readonly deadLetterQueue: Queue<RenderJobPayload>;
  readonly events: QueueEvents;
  private readonly logger: Logger;
  private readonly metrics: MetricsRegistry;
  private readonly retryPolicy: RetryPolicy;
  private readonly namespace: string;
  private readonly deadLetterAnalyzer: DeadLetterAnalyzer | undefined;

  constructor(options: QueueRuntimeOptions) {
    this.connection = new Redis(options.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
    this.namespace = options.namespace ?? "zveo";
    this.renderQueue = new Queue<RenderJobPayload>(RENDER_QUEUE, { connection: this.connection, prefix: this.namespace });
    this.deadLetterQueue = new Queue<RenderJobPayload>(RENDER_DLQ, { connection: this.connection, prefix: this.namespace });
    this.events = new QueueEvents(RENDER_QUEUE, { connection: this.connection, prefix: this.namespace });
    this.logger = options.logger ?? new Logger({ service: "queue" });
    this.metrics = options.metrics ?? new MetricsRegistry();
    this.retryPolicy = retryPolicySchema.parse(options.defaultRetryPolicy ?? {});
    this.deadLetterAnalyzer = options.deadLetterAnalyzer;
  }

  async enqueueRender(payload: RenderJobPayload, options: EnqueueRenderOptions = {}): Promise<Job<RenderJobPayload>> {
    const parsed = renderJobPayloadSchema.parse(payload);
    const retryPolicy = retryPolicySchema.parse(options.retryPolicy ?? this.retryPolicy);
    const jobOptions: JobsOptions = {
      jobId: parsed.idempotencyKey,
      priority: bullPriority(options.priority ?? parsed.priority),
      ...(options.delayMs === undefined ? {} : { delay: options.delayMs }),
      attempts: retryPolicy.maxAttempts,
      removeOnComplete: { age: 86_400, count: 50_000 },
      removeOnFail: false,
      backoff: { type: "exponential", delay: retryPolicy.baseDelayMs, jitter: retryPolicy.jitterRatio },
    };
    const job = await this.renderQueue.add("render.scene", parsed, jobOptions);
    this.metrics.jobsEnqueued.inc();
    await this.publishEvent("render.enqueued", parsed, { queueJobId: job.id, priority: parsed.priority });
    this.logger.info("render job enqueued", { jobId: parsed.jobId, workflowId: parsed.workflowId, queueJobId: job.id, priority: parsed.priority });
    return job;
  }

  createWorker(processor: Processor<RenderJobPayload>, options: Partial<WorkerOptions> = {}): Worker<RenderJobPayload> {
    const worker = new Worker<RenderJobPayload>(RENDER_QUEUE, async (job) => {
      const payload = renderJobPayloadSchema.parse(job.data);
      const started = Date.now();
      this.metrics.activeLeases.inc();
      try {
        await this.heartbeat(job, { state: "running" });
        const result = await processor(job);
        this.metrics.jobsCompleted.inc();
        this.metrics.jobLatency.observe((Date.now() - started) / 1000);
        await this.publishEvent("render.completed", payload, { queueJobId: job.id, durationMs: Date.now() - started });
        return result;
      } catch (error) {
        const attempts = job.attemptsMade + 1;
        const classifiedError = classifyError(error);
        this.metrics.jobsFailed.inc();
        await this.publishEvent("render.failed", payload, { queueJobId: job.id, attempts, classifiedError });
        if (shouldRetry(error, attempts, this.retryPolicy)) this.metrics.jobsRetried.inc();
        if (attempts >= (job.opts.attempts ?? this.retryPolicy.maxAttempts)) await this.moveToDeadLetter(job, error);
        throw error;
      } finally {
        this.metrics.activeLeases.dec();
      }
    }, {
      connection: this.connection,
      prefix: options.prefix ?? this.namespace,
      concurrency: options.concurrency ?? 2,
      lockDuration: options.lockDuration ?? 120_000,
      stalledInterval: options.stalledInterval ?? 30_000,
      maxStalledCount: options.maxStalledCount ?? 2,
      ...options,
    });
    worker.on("failed", (job, error) => this.logger.error("render queue job failed", error, { queueJobId: job?.id, attemptsMade: job?.attemptsMade }));
    worker.on("completed", (job) => this.logger.info("render queue job completed", { queueJobId: job.id }));
    return worker;
  }

  attachAdaptiveConcurrency(worker: Worker<RenderJobPayload>, rawOptions: Partial<AdaptiveConcurrencyOptions> = {}): NodeJS.Timeout {
    const options: AdaptiveConcurrencyOptions = {
      minConcurrency: rawOptions.minConcurrency ?? 1,
      maxConcurrency: rawOptions.maxConcurrency ?? 16,
      targetLatencySeconds: rawOptions.targetLatencySeconds ?? 120,
      evaluationWindowMs: rawOptions.evaluationWindowMs ?? 30_000,
    };
    let lastCompleted = 0;
    return setInterval(async () => {
      const counts = await this.renderQueue.getJobCounts("waiting", "active", "delayed", "completed", "failed");
      const completed = counts.completed ?? 0;
      const backlog = (counts.waiting ?? 0) + (counts.delayed ?? 0);
      const current = worker.concurrency;
      const throughput = completed - lastCompleted;
      lastCompleted = completed;
      const next = backlog > current && throughput >= current ? Math.min(options.maxConcurrency, current + 1) : backlog === 0 ? Math.max(options.minConcurrency, current - 1) : current;
      if (next !== current) {
        worker.concurrency = next;
        this.logger.info("adaptive worker concurrency changed", { from: current, to: next, backlog, throughput, targetLatencySeconds: options.targetLatencySeconds });
      }
    }, options.evaluationWindowMs).unref();
  }

  async getRenderQueueCounts(): Promise<RenderQueueCounts> {
    const counts = await this.renderQueue.getJobCounts("waiting", "active", "delayed", "completed", "failed");
    return {
      waiting: counts.waiting ?? 0,
      active: counts.active ?? 0,
      delayed: counts.delayed ?? 0,
      completed: counts.completed ?? 0,
      failed: counts.failed ?? 0,
    };
  }

  async heartbeat(job: Job<RenderJobPayload>, metadata: Record<string, unknown> = {}): Promise<void> {
    const payload = renderJobPayloadSchema.parse(job.data);
    const heartbeatAt = new Date().toISOString();
    await job.updateProgress({ state: "running", heartbeatAt, ...metadata });
    await this.publishEvent("render.heartbeat", payload, { queueJobId: job.id, heartbeatAt, ...metadata });
  }

  async moveToDeadLetter(job: Job<RenderJobPayload>, error: unknown): Promise<void> {
    const payload = renderJobPayloadSchema.parse(job.data);
    const classifiedError = classifyError(error);
    const record: DeadLetterRecord = {
      jobId: payload.jobId,
      queueJobId: String(job.id),
      workflowId: payload.workflowId,
      tenantId: payload.tenantId,
      sceneId: payload.sceneId,
      attemptsMade: job.attemptsMade + 1,
      classifiedError,
      deadLetteredAt: new Date().toISOString(),
    };
    await this.deadLetterQueue.add("render.dead_lettered", payload, {
      jobId: `dlq:${payload.idempotencyKey}:${record.attemptsMade}`,
      removeOnComplete: false,
      removeOnFail: false,
    });
    await this.publishEvent("job.dead_lettered", payload, record as unknown as Record<string, unknown>);
    await this.deadLetterAnalyzer?.(record);
    this.metrics.jobsDeadLettered.inc();
    this.logger.error("render job moved to dead letter queue", error, record as unknown as Record<string, unknown>);
  }

  private async publishEvent(name: string, payload: RenderJobPayload, metadata: Record<string, unknown>): Promise<void> {
    await this.connection.xadd(
      RENDER_STREAM,
      "MAXLEN",
      "~",
      "100000",
      "*",
      "name",
      name,
      "tenantId",
      payload.tenantId,
      "workflowId",
      payload.workflowId,
      "jobId",
      payload.jobId,
      "correlationId",
      payload.correlationId,
      "payload",
      JSON.stringify(metadata),
    );
  }

  async close(): Promise<void> {
    await Promise.all([this.events.close(), this.renderQueue.close(), this.deadLetterQueue.close(), this.connection.quit()]);
  }
}
