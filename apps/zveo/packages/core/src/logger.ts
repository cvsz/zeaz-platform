export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  service: string;
  correlationId?: string;
  tenantId?: string;
  workflowId?: string;
  jobId?: string;
  [key: string]: unknown;
}

export class Logger {
  constructor(private readonly base: LogContext) {}

  child(context: Partial<LogContext>): Logger {
    return new Logger({ ...this.base, ...context });
  }

  debug(message: string, context: Record<string, unknown> = {}): void { this.write("debug", message, context); }
  info(message: string, context: Record<string, unknown> = {}): void { this.write("info", message, context); }
  warn(message: string, context: Record<string, unknown> = {}): void { this.write("warn", message, context); }
  error(message: string, error?: unknown, context: Record<string, unknown> = {}): void {
    const serialized = error instanceof Error ? { errorName: error.name, errorMessage: error.message, stack: error.stack } : { error };
    this.write("error", message, { ...serialized, ...context });
  }

  private write(level: LogLevel, message: string, context: Record<string, unknown>): void {
    const record = { timestamp: new Date().toISOString(), level, message, ...this.base, ...context };
    const line = JSON.stringify(record);
    if (level === "error") process.stderr.write(`${line}\n`);
    else process.stdout.write(`${line}\n`);
  }
}
