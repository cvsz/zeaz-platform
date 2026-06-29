import crypto from "node:crypto";
import { z } from "zod";

export const publishStateSchema = z.enum(["queued", "uploading", "published", "failed"]);
export type PublishState = z.infer<typeof publishStateSchema>;

export interface PublishTarget { id: string; tenantId: string; provider: "facebook"; pageId: string; displayName: string; encryptedAccessTokenRef: string; metadata: Record<string, unknown>; createdAt: string; updatedAt: string; }
export interface PublishJob { id: string; tenantId: string; workflowId: string; assetId: string; targetId: string; provider: "facebook"; state: PublishState; caption: string; remotePostId?: string; remoteVideoId?: string; lastError?: string; createdAt: string; updatedAt: string; }
export interface PublishEvent { id: string; tenantId: string; publishJobId: string; name: string; payload: Record<string, unknown>; correlationId: string; occurredAt: string; }

const targetInputSchema = z.object({ tenantId: z.string().uuid(), provider: z.literal("facebook"), pageId: z.string().min(1), displayName: z.string().min(1), encryptedAccessTokenRef: z.string().min(1), metadata: z.record(z.string(), z.unknown()).default({}) });
const createJobSchema = z.object({ tenantId: z.string().uuid(), workflowId: z.string().uuid(), assetId: z.string().uuid(), targetId: z.string().uuid(), caption: z.string().max(2200), correlationId: z.string().uuid() });

export class InMemoryPublisherStore {
  targets = new Map<string, PublishTarget>(); jobs = new Map<string, PublishJob>(); events: PublishEvent[] = [];
  addEvent(event: Omit<PublishEvent, "id" | "occurredAt">): PublishEvent { const saved = { ...event, id: crypto.randomUUID(), occurredAt: new Date().toISOString() }; this.events.push(saved); return saved; }
}

export function buildAppSecretProof(token: string, appSecret: string): string { return crypto.createHmac("sha256", appSecret).update(token).digest("hex"); }

export function classifyPublishRetry(statusCode: number): "retryable" | "fatal" { return statusCode >= 500 || statusCode === 429 ? "retryable" : "fatal"; }

export async function validatePageToken(fetchImpl: typeof fetch, token: string, appId: string, appSecret: string, graphVersion: string): Promise<boolean> {
  const appsecret_proof = buildAppSecretProof(token, appSecret);
  const url = `https://graph.facebook.com/${graphVersion}/debug_token?input_token=${encodeURIComponent(token)}&access_token=${encodeURIComponent(`${appId}|${appSecret}`)}&appsecret_proof=${appsecret_proof}`;
  const response = await fetchImpl(url);
  if (!response.ok) return false;
  const body = z.object({ data: z.object({ is_valid: z.boolean() }) }).parse(await response.json());
  return body.data.is_valid;
}

export class FacebookPublisherService {
  constructor(private readonly store: InMemoryPublisherStore, private readonly fetchImpl: typeof fetch, private readonly env: { graphVersion: string; appSecret: string }) {}
  createTarget(input: unknown): PublishTarget { const parsed = targetInputSchema.parse(input); const now = new Date().toISOString(); const target = { id: crypto.randomUUID(), ...parsed, createdAt: now, updatedAt: now }; this.store.targets.set(target.id, target); return target; }
  listTargets(tenantId: string): PublishTarget[] { return [...this.store.targets.values()].filter((it) => it.tenantId === tenantId); }
  createJob(input: unknown): PublishJob { const parsed = createJobSchema.parse(input); const target = this.store.targets.get(parsed.targetId); if (!target || target.tenantId !== parsed.tenantId) throw new Error("invalid publish target"); const now = new Date().toISOString(); const job: PublishJob = { id: crypto.randomUUID(), provider: "facebook", state: "queued", createdAt: now, updatedAt: now, ...parsed }; this.store.jobs.set(job.id, job); this.store.addEvent({ tenantId: job.tenantId, publishJobId: job.id, name: "publish.queued", payload: { state: job.state }, correlationId: parsed.correlationId }); return job; }
  getJob(id: string): PublishJob | undefined { return this.store.jobs.get(id); }
  async publish(jobId: string, videoUrl: string, token: string, correlationId: string): Promise<PublishJob> {
    const job = this.store.jobs.get(jobId); if (!job) throw new Error("job not found");
    job.state = "uploading"; job.updatedAt = new Date().toISOString(); this.store.addEvent({ tenantId: job.tenantId, publishJobId: job.id, name: "publish.uploading", payload: { state: job.state }, correlationId });
    const appsecret_proof = buildAppSecretProof(token, this.env.appSecret);
    const target = this.store.targets.get(job.targetId); if (!target) throw new Error("target missing");
    const response = await this.fetchImpl(`https://graph.facebook.com/${this.env.graphVersion}/${target.pageId}/videos`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ file_url: videoUrl, description: job.caption, access_token: token, appsecret_proof }) });
    if (!response.ok) { const safeError = `facebook publish failed with status ${response.status}`; job.state = "failed"; job.lastError = safeError; this.store.addEvent({ tenantId: job.tenantId, publishJobId: job.id, name: "publish.failed", payload: { state: job.state, retry: classifyPublishRetry(response.status) }, correlationId }); return job; }
    const body = z.object({ id: z.string(), post_id: z.string().optional() }).parse(await response.json());
    job.state = "published";
    job.remoteVideoId = body.id;
    if (body.post_id) {
      job.remotePostId = body.post_id;
    }
    job.updatedAt = new Date().toISOString();
    this.store.addEvent({ tenantId: job.tenantId, publishJobId: job.id, name: "publish.published", payload: { state: job.state }, correlationId });
    return job;
  }
}
