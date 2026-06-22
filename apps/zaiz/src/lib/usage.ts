import { db } from "./db";

/**
 * Usage tracking + internet toggle — server-only.
 *
 * Records per-request usage (tokens, duration, endpoint) and enforces
 * plan-based limits (credits, internet access, memory access).
 */

export interface UsageRecordInput {
  keyHash: string;
  endpoint: string;
  model?: string | null;
  inputTokens?: number;
  outputTokens?: number;
  durationMs?: number;
  ok?: boolean;
}

/** Record a usage event + update the user profile counters. */
export async function recordUsage(input: UsageRecordInput): Promise<void> {
  const inputTokens = input.inputTokens ?? 0;
  const outputTokens = input.outputTokens ?? 0;
  const totalTokens = inputTokens + outputTokens;

  await db.usageRecord.create({
    data: {
      keyHash: input.keyHash,
      endpoint: input.endpoint,
      model: input.model ?? null,
      inputTokens,
      outputTokens,
      durationMs: input.durationMs ?? 0,
      ok: input.ok ?? true,
    },
  });

  // Update profile counters (fire-and-forget).
  db.userProfile
    .update({
      where: { keyHash: input.keyHash },
      data: {
        tokensUsed: { increment: totalTokens },
        requestCount: { increment: 1 },
        credits: { decrement: 1 },
        updatedAt: new Date(),
      },
    })
    .catch(() => {
      /* profile may not exist yet */
    });
}

/** Estimate tokens from text (~4 chars = 1 token). */
export function estimateTokens(text: string): number {
  return Math.ceil((text?.length ?? 0) / 4);
}

export interface PlanLimits {
  credits: number;
  rateLimitPerHour: number;
  internetEnabled: boolean;
  memoryEnabled: boolean;
  canUseAgents: boolean;
  canUsePlans: boolean;
  canUseMedia: boolean;
  canUseSandbox: boolean;
  canUseMCP: boolean;
}

/** Plan → limits mapping. */
export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: {
    credits: 100,
    rateLimitPerHour: 20,
    internetEnabled: true,
    memoryEnabled: true,
    canUseAgents: false,
    canUsePlans: false,
    canUseMedia: false,
    canUseSandbox: true,
    canUseMCP: false,
  },
  starter: {
    credits: 500,
    rateLimitPerHour: 60,
    internetEnabled: true,
    memoryEnabled: true,
    canUseAgents: true,
    canUsePlans: true,
    canUseMedia: false,
    canUseSandbox: true,
    canUseMCP: true,
  },
  pro: {
    credits: 5000,
    rateLimitPerHour: 200,
    internetEnabled: true,
    memoryEnabled: true,
    canUseAgents: true,
    canUsePlans: true,
    canUseMedia: true,
    canUseSandbox: true,
    canUseMCP: true,
  },
  team: {
    credits: 20000,
    rateLimitPerHour: 1000,
    internetEnabled: true,
    memoryEnabled: true,
    canUseAgents: true,
    canUsePlans: true,
    canUseMedia: true,
    canUseSandbox: true,
    canUseMCP: true,
  },
  enterprise: {
    credits: 100000,
    rateLimitPerHour: 0,
    internetEnabled: true,
    memoryEnabled: true,
    canUseAgents: true,
    canUsePlans: true,
    canUseMedia: true,
    canUseSandbox: true,
    canUseMCP: true,
  },
};

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  inputTokens: number;
  outputTokens: number;
  byEndpoint: Record<string, { count: number; tokens: number }>;
  last24h: { requests: number; tokens: number };
  last7d: { requests: number; tokens: number };
}

/** Get aggregated usage stats for a key. */
export async function getUsageStats(keyHash: string): Promise<UsageStats> {
  const now = new Date();
  const dayAgo = new Date(now.getTime() - 86400000);
  const weekAgo = new Date(now.getTime() - 604800000);

  const [records, last24, last7d] = await Promise.all([
    db.usageRecord.findMany({ where: { keyHash } }),
    db.usageRecord.findMany({ where: { keyHash, createdAt: { gte: dayAgo } } }),
    db.usageRecord.findMany({ where: { keyHash, createdAt: { gte: weekAgo } } }),
  ]);

  const byEndpoint: Record<string, { count: number; tokens: number }> = {};
  let inputTokens = 0;
  let outputTokens = 0;
  for (const r of records) {
    const ep = r.endpoint;
    if (!byEndpoint[ep]) byEndpoint[ep] = { count: 0, tokens: 0 };
    byEndpoint[ep].count++;
    byEndpoint[ep].tokens += r.inputTokens + r.outputTokens;
    inputTokens += r.inputTokens;
    outputTokens += r.outputTokens;
  }

  return {
    totalRequests: records.length,
    totalTokens: inputTokens + outputTokens,
    inputTokens,
    outputTokens,
    byEndpoint,
    last24h: {
      requests: last24.length,
      tokens: last24.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0),
    },
    last7d: {
      requests: last7d.length,
      tokens: last7d.reduce((s, r) => s + r.inputTokens + r.outputTokens, 0),
    },
  };
}

/** Toggle internet access for a user profile. */
export async function toggleInternet(keyHash: string, enabled: boolean): Promise<boolean> {
  await db.userProfile.update({
    where: { keyHash },
    data: { internetEnabled: enabled },
  });
  return enabled;
}

/** Toggle memory access for a user profile. */
export async function toggleMemory(keyHash: string, enabled: boolean): Promise<boolean> {
  await db.userProfile.update({
    where: { keyHash },
    data: { memoryEnabled: enabled },
  });
  return enabled;
}
