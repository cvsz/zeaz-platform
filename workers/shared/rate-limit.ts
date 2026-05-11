export interface TokenBucketState { tokens: number; updatedAtMs: number }
export interface RateLimitPolicy { capacity: number; refillPerSecond: number; cost?: number }

export function consumeTokenBucket(state: TokenBucketState, policy: RateLimitPolicy, nowMs: number): { allowed: boolean; state: TokenBucketState; retryAfterSec: number } {
  const cost = policy.cost ?? 1;
  const elapsedSeconds = Math.max((nowMs - state.updatedAtMs) / 1000, 0);
  const refilled = Math.min(policy.capacity, state.tokens + elapsedSeconds * policy.refillPerSecond);
  if (refilled >= cost) {
    return { allowed: true, retryAfterSec: 0, state: { tokens: refilled - cost, updatedAtMs: nowMs } };
  }
  const retryAfterSec = Math.ceil((cost - refilled) / policy.refillPerSecond);
  return { allowed: false, retryAfterSec, state: { tokens: refilled, updatedAtMs: nowMs } };
}
