import { consumeTokenBucket, type RateLimitPolicy, type TokenBucketState } from "./rate-limit";

export class DurableRateLimiter {
  constructor(private readonly state: DurableObjectState) {}

  async consume(key: string, policy: RateLimitPolicy): Promise<{ allowed: boolean; retryAfterSec: number }> {
    const nowMs = Date.now();
    const current = (await this.state.storage.get<TokenBucketState>(key)) ?? { tokens: policy.capacity, updatedAtMs: nowMs };
    const result = consumeTokenBucket(current, policy, nowMs);
    await this.state.storage.put(key, result.state);
    return { allowed: result.allowed, retryAfterSec: result.retryAfterSec };
  }
}
