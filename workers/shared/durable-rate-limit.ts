import { consumeTokenBucket, type RateLimitDecision, type RateLimitPolicy, type TokenBucketState } from "./rate-limit";

export interface DurableRateLimitStorage {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
}

export class DurableRateLimiter {
  constructor(private readonly storage: DurableRateLimitStorage) {}

  async consume(key: string, policy: RateLimitPolicy): Promise<RateLimitDecision> {
    const nowMs = Date.now();
    const current = (await this.storage.get<TokenBucketState>(key)) ?? {
      tokens: policy.capacity,
      updatedAtMs: nowMs,
    };
    const result = consumeTokenBucket(current, policy, nowMs);
    await this.storage.put(key, result.state);
    return result;
  }
}
