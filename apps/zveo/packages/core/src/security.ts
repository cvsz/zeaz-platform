import { readFileSync } from "node:fs";
import { Logger } from "./logger.js";

export interface SecretSource {
  env?: string;
  file?: string;
  minLength?: number;
  name: string;
}

export function loadSecret(source: SecretSource): string {
  const value = source.file ? readFileSync(source.file, "utf8").trim() : source.env;
  if (!value) throw new Error(`missing required secret ${source.name}`);
  const minLength = source.minLength ?? 32;
  if (value.length < minLength) throw new Error(`secret ${source.name} must be at least ${minLength} characters`);
  return value;
}

export interface AuditEvent {
  action: string;
  actor?: string;
  tenantId?: string;
  resourceType?: string;
  resourceId?: string;
  outcome: "allow" | "deny" | "error";
  correlationId?: string;
  traceId?: string;
  reason?: string;
  metadata?: Record<string, unknown>;
}

export class AuditLogger {
  constructor(private readonly logger = new Logger({ service: "audit" })) {}

  record(event: AuditEvent): void {
    this.logger.info("audit event", {
      audit: true,
      action: event.action,
      actor: event.actor,
      tenantId: event.tenantId,
      resourceType: event.resourceType,
      resourceId: event.resourceId,
      outcome: event.outcome,
      correlationId: event.correlationId,
      traceId: event.traceId,
      reason: event.reason,
      metadata: event.metadata ?? {},
    });
  }
}

export interface TokenBucketRateLimiterOptions {
  capacity: number;
  refillTokens: number;
  refillIntervalMs: number;
  maxKeys?: number;
  now?: () => number;
}

export interface RateLimitDecision {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

interface Bucket {
  tokens: number;
  updatedAt: number;
}

export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private readonly now: () => number;

  constructor(private readonly options: TokenBucketRateLimiterOptions) {
    if (options.capacity < 1) throw new Error("rate limiter capacity must be positive");
    if (options.refillTokens < 1) throw new Error("rate limiter refillTokens must be positive");
    if (options.refillIntervalMs < 1) throw new Error("rate limiter refillIntervalMs must be positive");
    this.now = options.now ?? Date.now;
  }

  take(key: string, cost = 1): RateLimitDecision {
    const now = this.now();
    const bucket = this.refill(this.buckets.get(key) ?? { tokens: this.options.capacity, updatedAt: now }, now);
    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      this.setBucket(key, bucket);
      return { allowed: true, remaining: Math.floor(bucket.tokens), retryAfterMs: 0 };
    }
    this.setBucket(key, bucket);
    const missing = cost - bucket.tokens;
    const intervals = Math.ceil(missing / this.options.refillTokens);
    return { allowed: false, remaining: Math.floor(bucket.tokens), retryAfterMs: intervals * this.options.refillIntervalMs };
  }

  private refill(bucket: Bucket, now: number): Bucket {
    const elapsedIntervals = Math.floor((now - bucket.updatedAt) / this.options.refillIntervalMs);
    if (elapsedIntervals <= 0) return bucket;
    return {
      tokens: Math.min(this.options.capacity, bucket.tokens + elapsedIntervals * this.options.refillTokens),
      updatedAt: bucket.updatedAt + elapsedIntervals * this.options.refillIntervalMs,
    };
  }

  private setBucket(key: string, bucket: Bucket): void {
    if (this.options.maxKeys && this.buckets.size >= this.options.maxKeys && !this.buckets.has(key)) {
      const oldest = this.buckets.keys().next().value as string | undefined;
      if (oldest) this.buckets.delete(oldest);
    }
    this.buckets.set(key, bucket);
  }
}
