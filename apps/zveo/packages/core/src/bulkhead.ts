export class BulkheadRejectedError extends Error {
  constructor(readonly bulkheadName: string) {
    super(`bulkhead ${bulkheadName} capacity exhausted`);
    this.name = "BulkheadRejectedError";
  }
}

export interface BulkheadOptions {
  name: string;
  maxConcurrent: number;
  maxQueue: number;
}

interface WaitingOperation<T> {
  resolve: (value: T) => void;
  reject: (reason: unknown) => void;
  operation: () => Promise<T>;
}

export class Bulkhead {
  private active = 0;
  private readonly waiting: WaitingOperation<unknown>[] = [];

  constructor(private readonly options: BulkheadOptions) {
    if (options.maxConcurrent < 1) throw new Error("bulkhead maxConcurrent must be positive");
    if (options.maxQueue < 0) throw new Error("bulkhead maxQueue cannot be negative");
  }

  get activeCount(): number { return this.active; }
  get queuedCount(): number { return this.waiting.length; }

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.active < this.options.maxConcurrent) return await this.run(operation);
    if (this.waiting.length >= this.options.maxQueue) throw new BulkheadRejectedError(this.options.name);
    return await new Promise<T>((resolve, reject) => {
      this.waiting.push({ resolve: resolve as (value: unknown) => void, reject, operation });
    });
  }

  private async run<T>(operation: () => Promise<T>): Promise<T> {
    this.active += 1;
    try {
      return await operation();
    } finally {
      this.active -= 1;
      this.drain();
    }
  }

  private drain(): void {
    if (this.active >= this.options.maxConcurrent) return;
    const next = this.waiting.shift();
    if (!next) return;
    void this.run(next.operation).then(next.resolve, next.reject);
  }
}
