export class Counter {
  private value = 0;
  constructor(readonly name: string, readonly help: string) {}
  inc(amount = 1): void { this.value += amount; }
  collect(): string { return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} counter\n${this.name} ${this.value}`; }
}

export class Gauge {
  private value = 0;
  constructor(readonly name: string, readonly help: string) {}
  set(value: number): void { this.value = value; }
  inc(amount = 1): void { this.value += amount; }
  dec(amount = 1): void { this.value -= amount; }
  collect(): string { return `# HELP ${this.name} ${this.help}\n# TYPE ${this.name} gauge\n${this.name} ${this.value}`; }
}

export class Histogram {
  private readonly counts: number[];
  private sum = 0;
  constructor(readonly name: string, readonly help: string, private readonly buckets: number[]) {
    this.counts = buckets.map(() => 0);
  }
  observe(value: number): void {
    this.sum += value;
    this.buckets.forEach((bucket, index) => { if (value <= bucket) this.counts[index] = (this.counts[index] ?? 0) + 1; });
  }
  collect(): string {
    const rows = [`# HELP ${this.name} ${this.help}`, `# TYPE ${this.name} histogram`];
    this.buckets.forEach((bucket, index) => rows.push(`${this.name}_bucket{le="${bucket}"} ${this.counts[index] ?? 0}`));
    rows.push(`${this.name}_sum ${this.sum}`, `${this.name}_count ${this.counts.at(-1) ?? 0}`);
    return rows.join("\n");
  }
}

export class MetricsRegistry {
  readonly jobsEnqueued = new Counter("zveo_jobs_enqueued_total", "Total render jobs enqueued");
  readonly jobsCompleted = new Counter("zveo_jobs_completed_total", "Total render jobs completed");
  readonly jobsDeadLettered = new Counter("zveo_jobs_dead_lettered_total", "Total jobs moved to dead letter queues");
  readonly jobsFailed = new Counter("zveo_jobs_failed_total", "Total render job execution failures");
  readonly jobsRetried = new Counter("zveo_jobs_retried_total", "Total retryable render job failures scheduled for another attempt");
  readonly activeLeases = new Gauge("zveo_active_leases", "Active distributed job leases");
  readonly jobLatency = new Histogram("zveo_job_latency_seconds", "Render job execution latency", [1, 5, 15, 30, 60, 120, 300, 900, 1800]);
  collect(): string { return [this.jobsEnqueued, this.jobsCompleted, this.jobsDeadLettered, this.jobsFailed, this.jobsRetried, this.activeLeases, this.jobLatency].map((metric) => metric.collect()).join("\n"); }
}
