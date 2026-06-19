import { z } from "zod";

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
  status: z.enum(["healthy", "degraded", "offline"]),
  latencyMs: z.number().nonnegative().optional(),
  correlationId: z.string().min(1)
});

const ProvidersHealthResponseSchema = z.object({
  status: z.string(),
  correlationId: z.string().min(1),
  providers: z.array(ProviderHealthSchema)
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
  workflow: WorkflowSchema,
  jobs: z.array(z.object({ id: z.string(), state: z.string(), sceneId: z.string().optional(), createdAt: z.string().optional(), correlationId: z.string().min(1) })),
  assets: z.array(z.object({ id: z.string(), kind: z.string(), url: z.string().optional(), checksum: z.string().optional(), sceneId: z.string().optional(), correlationId: z.string().min(1) })),
  exportManifests: z.array(z.object({ id: z.string(), platform: z.string(), objectKey: z.string(), expectedContentType: z.string(), correlationId: z.string().min(1) })).default([]),
  publishReadyVideos: z.array(z.object({ id: z.string(), kind: z.string(), correlationId: z.string().min(1) })).default([]),
});

export type ServiceProbe = z.infer<typeof ServiceProbeSchema>;
export type OpsSummary = z.infer<typeof OpsSummarySchema>;
export type ProviderHealth = z.infer<typeof ProviderHealthSchema>;
export type Workflow = z.infer<typeof WorkflowSchema>;
export type WorkflowDetail = z.infer<typeof WorkflowDetailSchema>;

function getApiBaseUrl(): string {
  return process.env.ZVEO_API_URL ?? "http://localhost:8080";
}

async function fetchAndParse<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, { cache: "no-store" });
  if (response.status === 404) throw new Error(`missing-endpoint:${path}`);
  if (!response.ok) throw new Error(`API request failed for ${path}: ${response.status}`);
  return schema.parse(await response.json());
}

export async function getHealth(): Promise<ServiceProbe> { return fetchAndParse("/healthz", ServiceProbeSchema); }
export async function getReadiness(): Promise<ServiceProbe> { return fetchAndParse("/readyz", ServiceProbeSchema); }
export async function getOpsSummary(): Promise<OpsSummary> { return fetchAndParse("/v1/ops/summary", OpsSummarySchema); }
export async function getProvidersHealth(): Promise<ProviderHealth[]> {
  const response = await fetchAndParse("/v1/providers/health", ProvidersHealthResponseSchema);
  return response.providers;
}
export async function getWorkflows(): Promise<Workflow[]> {
  const response = await fetchAndParse("/v1/workflows", WorkflowListSchema);
  return response.workflows;
}
export async function getWorkflowDetail(id: string): Promise<WorkflowDetail> {
  return fetchAndParse(`/v1/workflows/${id}`, WorkflowDetailSchema) as unknown as Promise<WorkflowDetail>;
}

const CampaignSchema = z.object({ id: z.string(), topic: z.string(), status: z.string(), title: z.string().optional(), correlationId: z.string().optional() });
const CampaignListSchema = z.object({ correlationId: z.string().min(1), campaigns: z.array(CampaignSchema) });
const PublishJobSchema = z.object({ id: z.string(), state: z.string(), provider: z.literal("facebook"), correlationId: z.string().optional() });
const PublishJobResponseSchema = z.object({ correlationId: z.string().min(1), publishJob: PublishJobSchema });
export type Campaign = z.infer<typeof CampaignSchema>;
export async function getCampaigns(): Promise<Campaign[]> { const response = await fetchAndParse("/v1/campaigns", CampaignListSchema); return response.campaigns; }
export async function getFacebookPublishJob(id: string): Promise<z.infer<typeof PublishJobSchema>> {
  const response = await fetchAndParse(`/v1/publish/${id}`, PublishJobResponseSchema);
  return response.publishJob;
}
