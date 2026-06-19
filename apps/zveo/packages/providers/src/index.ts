import { Logger } from "@zveo/core";
import { retryPolicySchema } from "@zveo/contracts";
import { renderJobPayloadSchema, renderProviderSchema, type RenderJobPayload, type RenderProvider, type RetryPolicy } from "@zveo/contracts";

export interface ProviderRenderResult {
  readonly providerJobId: string;
  readonly status: "submitted" | "completed";
  readonly artifactUri?: string;
  readonly metadata: Record<string, unknown>;
}

export interface ProviderHealth {
  readonly provider: RenderProvider;
  readonly status: "ok" | "degraded" | "unavailable";
  readonly checkedAt: string;
  readonly latencyMs: number;
  readonly details: Record<string, unknown>;
}

export interface RenderProviderAdapter {
  readonly provider: RenderProvider;
  render(payload: RenderJobPayload): Promise<ProviderRenderResult>;
  health(): Promise<ProviderHealth>;
}

export class ProviderRegistry {
  private readonly adapters = new Map<RenderProvider, RenderProviderAdapter>();
  constructor(private readonly logger = new Logger({ service: "providers" })) {}

  register(adapter: RenderProviderAdapter): this {
    renderProviderSchema.parse(adapter.provider);
    this.adapters.set(adapter.provider, adapter);
    this.logger.info("render provider registered", { provider: adapter.provider });
    return this;
  }

  get(provider: RenderProvider): RenderProviderAdapter {
    const adapter = this.adapters.get(provider);
    if (!adapter) throw new Error(`render provider adapter not registered: ${provider}`);
    return adapter;
  }

  async health(): Promise<readonly ProviderHealth[]> {
    return Promise.all([...this.adapters.values()].map((adapter) => adapter.health()));
  }
}

export interface HttpProviderAdapterOptions {
  readonly provider: RenderProvider;
  readonly endpoint: string;
  readonly apiKey?: string;
  readonly timeoutMs?: number;
  readonly retryPolicy?: RetryPolicy;
  readonly fetchImpl?: typeof fetch;
  readonly logger?: Logger;
}

export class HttpRenderProviderAdapter implements RenderProviderAdapter {
  readonly provider: RenderProvider;
  private readonly fetchImpl: typeof fetch;
  private readonly timeoutMs: number;
  private readonly retryPolicy: RetryPolicy;
  private readonly logger: Logger;

  constructor(private readonly options: HttpProviderAdapterOptions) {
    this.provider = renderProviderSchema.parse(options.provider);
    this.fetchImpl = options.fetchImpl ?? fetch;
    this.timeoutMs = options.timeoutMs ?? 120_000;
    this.retryPolicy = retryPolicySchema.parse(options.retryPolicy ?? {});
    this.logger = options.logger ?? new Logger({ service: "providers", provider: this.provider });
  }

  async render(rawPayload: RenderJobPayload): Promise<ProviderRenderResult> {
    const payload = renderJobPayloadSchema.parse(rawPayload);
    return this.withRetries("render", async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.timeoutMs).unref();
      try {
        const response = await this.fetchImpl(`${this.options.endpoint.replace(/\/$/, "")}/v1/render`, {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "x-correlation-id": payload.correlationId,
            ...(this.options.apiKey ? { authorization: `Bearer ${this.options.apiKey}` } : {}),
          },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`provider ${this.provider} render failed with ${response.status}`);
        const body = await response.json() as ProviderRenderResult;
        this.logger.info("provider render accepted", { provider: this.provider, jobId: payload.jobId, providerJobId: body.providerJobId });
        return body;
      } finally {
        clearTimeout(timeout);
      }
    });
  }

  async health(): Promise<ProviderHealth> {
    const started = Date.now();
    try {
      const response = await this.fetchImpl(`${this.options.endpoint.replace(/\/$/, "")}/healthz`, { method: "GET" });
      return { provider: this.provider, status: response.ok ? "ok" : "degraded", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, details: { statusCode: response.status } };
    } catch (error) {
      this.logger.error("provider health check failed", error, { provider: this.provider });
      return { provider: this.provider, status: "unavailable", checkedAt: new Date().toISOString(), latencyMs: Date.now() - started, details: { message: error instanceof Error ? error.message : String(error) } };
    }
  }

  private async withRetries<T>(operation: string, execute: () => Promise<T>): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= this.retryPolicy.maxAttempts; attempt += 1) {
      try { return await execute(); }
      catch (error) {
        lastError = error;
        this.logger.warn("provider operation retry scheduled", { provider: this.provider, operation, attempt, error: error instanceof Error ? error.message : String(error) });
        if (attempt >= this.retryPolicy.maxAttempts) break;
        await new Promise((resolve) => setTimeout(resolve, retryDelay(attempt, this.retryPolicy)));
      }
    }
    throw lastError;
  }
}

export function retryDelay(attempt: number, policy: RetryPolicy): number {
  const parsed = retryPolicySchema.parse(policy);
  const exponential = Math.min(parsed.maxDelayMs, parsed.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  return Math.round(exponential + exponential * parsed.jitterRatio * Math.random());
}
