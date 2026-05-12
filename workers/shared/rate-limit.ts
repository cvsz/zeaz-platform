export interface TokenBucketState {
  tokens: number;
  updatedAtMs: number;
}

export interface RateLimitPolicy {
  capacity: number;
  refillPerSecond: number;
  cost?: number;
}

export interface RateLimitDecision {
  allowed: boolean;
  state: TokenBucketState;
  retryAfterSec: number;
  remaining: number;
}

export function consumeTokenBucket(
  state: TokenBucketState,
  policy: RateLimitPolicy,
  nowMs: number,
): RateLimitDecision {
  const cost = policy.cost ?? 1;
  if (policy.capacity <= 0 || policy.refillPerSecond <= 0 || cost <= 0) {
    throw new Error("Invalid rate limit policy");
  }

  const elapsedSeconds = Math.max((nowMs - state.updatedAtMs) / 1000, 0);
  const refilled = Math.min(policy.capacity, state.tokens + elapsedSeconds * policy.refillPerSecond);

  if (refilled >= cost) {
    const remaining = Math.max(0, refilled - cost);
    return {
      allowed: true,
      retryAfterSec: 0,
      remaining,
      state: { tokens: remaining, updatedAtMs: nowMs },
    };
  }

  const retryAfterSec = Math.ceil((cost - refilled) / policy.refillPerSecond);
  return {
    allowed: false,
    retryAfterSec,
    remaining: Math.max(0, refilled),
    state: { tokens: Math.max(0, refilled), updatedAtMs: nowMs },
  };
}
