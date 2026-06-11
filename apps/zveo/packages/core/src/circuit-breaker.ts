import { z } from "zod";
import { Logger } from "./logger.js";

export const circuitBreakerOptionsSchema = z.object({
  name: z.string().trim().min(1).max(128),
  failureThreshold: z.number().int().min(1).max(10_000).default(5),
  halfOpenAfterMs: z.number().int().min(100).max(3_600_000).default(30_000),
  successThreshold: z.number().int().min(1).max(10_000).default(2),
});

export type CircuitBreakerState = "closed" | "open" | "half_open";
export type CircuitBreakerOptions = z.infer<typeof circuitBreakerOptionsSchema>;

export class CircuitOpenError extends Error {
  constructor(readonly breakerName: string) {
    super(`circuit breaker ${breakerName} is open`);
    this.name = "CircuitOpenError";
  }
}

export class CircuitBreaker {
  private stateValue: CircuitBreakerState = "closed";
  private failures = 0;
  private successes = 0;
  private openedAt = 0;
  private readonly options: CircuitBreakerOptions;
  private readonly logger: Logger;

  constructor(rawOptions: z.input<typeof circuitBreakerOptionsSchema>, logger = new Logger({ service: "circuit-breaker" })) {
    this.options = circuitBreakerOptionsSchema.parse(rawOptions);
    this.logger = logger.child({ circuitBreaker: this.options.name });
  }

  get state(): CircuitBreakerState { return this.stateValue; }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    this.beforeCall();
    try {
      const result = await operation();
      this.recordSuccess();
      return result;
    } catch (error) {
      this.recordFailure(error);
      throw error;
    }
  }

  private beforeCall(): void {
    if (this.stateValue !== "open") return;
    if (Date.now() - this.openedAt >= this.options.halfOpenAfterMs) {
      this.stateValue = "half_open";
      this.successes = 0;
      this.logger.warn("circuit breaker half-open probe enabled");
      return;
    }
    throw new CircuitOpenError(this.options.name);
  }

  private recordSuccess(): void {
    if (this.stateValue === "half_open") {
      this.successes += 1;
      if (this.successes >= this.options.successThreshold) this.close();
      return;
    }
    this.failures = 0;
  }

  private recordFailure(error: unknown): void {
    this.failures += 1;
    this.successes = 0;
    if (this.stateValue === "half_open" || this.failures >= this.options.failureThreshold) {
      this.stateValue = "open";
      this.openedAt = Date.now();
      this.logger.error("circuit breaker opened", error, { failures: this.failures });
    }
  }

  private close(): void {
    this.stateValue = "closed";
    this.failures = 0;
    this.successes = 0;
    this.openedAt = 0;
    this.logger.info("circuit breaker closed");
  }
}
