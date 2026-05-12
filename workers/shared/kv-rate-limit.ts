import { consumeTokenBucket, type RateLimitDecision, type RateLimitPolicy, type TokenBucketState } from "./rate-limit";

export async function enforceKvRateLimit(
  kv: KVNamespace,
  key: string,
  policy: RateLimitPolicy,
  ttlSeconds = 120,
): Promise<RateLimitDecision> {
  const nowMs = Date.now();
  const existing = await kv.get<TokenBucketState>(key, "json");
  const state = existing ?? { tokens: policy.capacity, updatedAtMs: nowMs };
  const result = consumeTokenBucket(state, policy, nowMs);
  await kv.put(key, JSON.stringify(result.state), { expirationTtl: ttlSeconds });
  return result;
}
