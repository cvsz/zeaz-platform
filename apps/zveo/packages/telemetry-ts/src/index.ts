import { Logger, MetricsRegistry, Tracer, type SpanAttributes } from "@zveo/core";

export interface TelemetryOptions {
  readonly serviceName: string;
  readonly environment?: string;
  readonly version?: string;
  readonly logger?: Logger;
  readonly metrics?: MetricsRegistry;
  readonly tracer?: Tracer;
}

export interface HealthCheckResult {
  readonly name: string;
  readonly status: "ok" | "degraded" | "failed";
  readonly latencyMs: number;
  readonly checkedAt: string;
  readonly details: Record<string, unknown>;
}

export type HealthCheck = () => Promise<HealthCheckResult>;

export class TelemetryRuntime {
  readonly logger: Logger;
  readonly metrics: MetricsRegistry;
  readonly tracer: Tracer;
  private readonly checks = new Map<string, HealthCheck>();

  constructor(readonly options: TelemetryOptions) {
    this.logger = options.logger ?? new Logger({ service: options.serviceName, environment: options.environment ?? "production", version: options.version ?? "0.0.0" });
    this.metrics = options.metrics ?? new MetricsRegistry();
    this.tracer = options.tracer ?? new Tracer(options.serviceName);
  }

  registerHealthCheck(name: string, check: HealthCheck): this {
    this.checks.set(name, check);
    return this;
  }

  async health(): Promise<{ status: "ok" | "degraded" | "failed"; checks: readonly HealthCheckResult[] }> {
    const checks = await Promise.all([...this.checks.entries()].map(async ([name, check]) => timedHealthCheck(name, check)));
    const status = checks.some((check) => check.status === "failed") ? "failed" : checks.some((check) => check.status === "degraded") ? "degraded" : "ok";
    this.logger.info("health checks collected", { status, checks: checks.map((check) => ({ name: check.name, status: check.status, latencyMs: check.latencyMs })) });
    return { status, checks };
  }

  async instrument<T>(name: string, attributes: SpanAttributes, operation: () => Promise<T>): Promise<T> {
    return this.tracer.withSpan(name, undefined, attributes, async () => operation());
  }

  collectMetrics(): string {
    return this.metrics.collect();
  }
}

export async function timedHealthCheck(name: string, check: HealthCheck): Promise<HealthCheckResult> {
  const started = Date.now();
  try {
    const result = await check();
    return { ...result, name, latencyMs: Date.now() - started, checkedAt: new Date().toISOString() };
  } catch (error) {
    return { name, status: "failed", latencyMs: Date.now() - started, checkedAt: new Date().toISOString(), details: { message: error instanceof Error ? error.message : String(error) } };
  }
}

export function okHealth(name: string, details: Record<string, unknown> = {}): HealthCheckResult {
  return { name, status: "ok", latencyMs: 0, checkedAt: new Date().toISOString(), details };
}
