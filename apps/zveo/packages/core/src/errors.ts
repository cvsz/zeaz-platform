import { z } from "zod";
import { retryPolicySchema, type RetryPolicy } from "./schemas.js";

export const errorSeveritySchema = z.enum(["transient", "provider", "storage", "validation", "authorization", "fatal"]);
export const classifiedErrorSchema = z.object({
  code: z.string().trim().min(1).max(128),
  severity: errorSeveritySchema,
  message: z.string().trim().min(1).max(4096),
  retryable: z.boolean(),
  details: z.record(z.unknown()).default({}),
});

export type ErrorSeverity = z.infer<typeof errorSeveritySchema>;
export type ClassifiedError = z.infer<typeof classifiedErrorSchema>;

export class ZveoError extends Error {
  readonly code: string;
  readonly severity: ErrorSeverity;
  readonly retryable: boolean;
  readonly details: Record<string, unknown>;

  constructor(input: z.input<typeof classifiedErrorSchema>) {
    const parsed = classifiedErrorSchema.parse(input);
    super(parsed.message);
    this.name = "ZveoError";
    this.code = parsed.code;
    this.severity = parsed.severity;
    this.retryable = parsed.retryable;
    this.details = parsed.details;
  }

  toJSON(): ClassifiedError {
    return { code: this.code, severity: this.severity, message: this.message, retryable: this.retryable, details: this.details };
  }
}

export function classifyError(error: unknown): ClassifiedError {
  if (error instanceof ZveoError) return error.toJSON();
  if (error instanceof z.ZodError) {
    return {
      code: "VALIDATION_FAILED",
      severity: "validation",
      message: error.issues.map((issue) => `${issue.path.join(".") || "root"}: ${issue.message}`).join("; "),
      retryable: false,
      details: { issues: error.issues },
    };
  }
  if (error instanceof Error) {
    const code = "code" in error && typeof error.code === "string" ? error.code : error.name.toUpperCase().replace(/[^A-Z0-9]+/g, "_");
    const retryable = /TIMEOUT|ECONNRESET|ETIMEDOUT|EAI_AGAIN|RATE|STALLED|TRANSIENT|LEASE/.test(code) || /timeout|rate limit|temporar|stalled|lease/i.test(error.message);
    return { code: code || "UNCLASSIFIED_ERROR", severity: retryable ? "transient" : "fatal", message: error.message, retryable, details: { name: error.name, stack: error.stack } };
  }
  return { code: "UNKNOWN_THROWABLE", severity: "fatal", message: "unknown non-error throwable", retryable: false, details: { value: error } };
}

export function shouldRetry(error: unknown, attempt: number, rawPolicy: RetryPolicy): boolean {
  const policy = retryPolicySchema.parse(rawPolicy);
  const classified = classifyError(error);
  if (attempt >= policy.maxAttempts) return false;
  if (!classified.retryable) return false;
  return policy.retryableCodes.includes(classified.code) || classified.severity === "transient" || classified.severity === "provider" || classified.severity === "storage";
}
