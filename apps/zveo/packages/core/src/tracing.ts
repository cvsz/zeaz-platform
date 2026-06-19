import { randomUUID } from "node:crypto";
import { Logger } from "./logger.js";

export interface TraceContext {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  sampled: boolean;
}

export interface SpanAttributes {
  [key: string]: string | number | boolean | undefined;
}

export interface SpanRecord {
  traceId: string;
  spanId: string;
  parentSpanId?: string;
  name: string;
  service: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  status: "ok" | "error";
  attributes: SpanAttributes;
  errorName?: string;
  errorMessage?: string;
}

export interface SpanExporter {
  export(span: SpanRecord): void | Promise<void>;
}

export class JsonLogSpanExporter implements SpanExporter {
  constructor(private readonly logger: Logger) {}

  export(span: SpanRecord): void {
    if (span.status === "error") {
      this.logger.error("trace span completed", new Error(span.errorMessage ?? "span failed"), { trace: span });
      return;
    }
    this.logger.info("trace span completed", { trace: span });
  }
}

export function newTraceContext(parent?: Partial<TraceContext>): TraceContext {
  return {
    traceId: parent?.traceId ?? randomUUID().replaceAll("-", ""),
    ...(parent?.spanId === undefined ? {} : { parentSpanId: parent.spanId }),
    spanId: randomUUID().replaceAll("-", "").slice(0, 16),
    sampled: parent?.sampled ?? true,
  };
}

export function traceParentHeader(context: TraceContext): string {
  return `00-${context.traceId.padEnd(32, "0").slice(0, 32)}-${context.spanId.padEnd(16, "0").slice(0, 16)}-${context.sampled ? "01" : "00"}`;
}

export function parseTraceParent(header: string | string[] | undefined): TraceContext | undefined {
  const value = Array.isArray(header) ? header[0] : header;
  if (!value) return undefined;
  const [, traceId, spanId, flags] = value.trim().split("-");
  if (!traceId || !spanId || traceId.length !== 32 || spanId.length !== 16) return undefined;
  return { traceId, spanId: randomUUID().replaceAll("-", "").slice(0, 16), parentSpanId: spanId, sampled: flags === "01" };
}

export class Tracer {
  private readonly exporter: SpanExporter;

  constructor(private readonly service: string, exporter?: SpanExporter) {
    this.exporter = exporter ?? new JsonLogSpanExporter(new Logger({ service }));
  }

  startSpan(name: string, parent?: Partial<TraceContext>, attributes: SpanAttributes = {}): Span {
    return new Span(this.service, name, newTraceContext(parent), attributes, this.exporter);
  }

  async withSpan<T>(name: string, parent: Partial<TraceContext> | undefined, attributes: SpanAttributes, operation: (span: Span) => Promise<T>): Promise<T> {
    const span = this.startSpan(name, parent, attributes);
    try {
      const result = await operation(span);
      await span.end("ok");
      return result;
    } catch (error) {
      await span.recordException(error).end("error");
      throw error;
    }
  }
}

export class Span {
  private readonly started = Date.now();
  private readonly startedAt = new Date().toISOString();
  private status: "ok" | "error" = "ok";
  private errorName: string | undefined;
  private errorMessage: string | undefined;

  constructor(
    private readonly service: string,
    private readonly name: string,
    readonly context: TraceContext,
    private readonly attributes: SpanAttributes,
    private readonly exporter: SpanExporter,
  ) {}

  setAttribute(key: string, value: string | number | boolean | undefined): this {
    this.attributes[key] = value;
    return this;
  }

  recordException(error: unknown): this {
    this.status = "error";
    if (error instanceof Error) {
      this.errorName = error.name;
      this.errorMessage = error.message;
    } else {
      this.errorName = "UnknownError";
      this.errorMessage = String(error);
    }
    return this;
  }

  async end(status: "ok" | "error" = this.status): Promise<void> {
    const endedAt = new Date().toISOString();
    await this.exporter.export({
      traceId: this.context.traceId,
      spanId: this.context.spanId,
      ...(this.context.parentSpanId === undefined ? {} : { parentSpanId: this.context.parentSpanId }),
      name: this.name,
      service: this.service,
      startedAt: this.startedAt,
      endedAt,
      durationMs: Date.now() - this.started,
      status,
      attributes: this.attributes,
      ...(this.errorName === undefined ? {} : { errorName: this.errorName }),
      ...(this.errorMessage === undefined ? {} : { errorMessage: this.errorMessage }),
    });
  }
}
