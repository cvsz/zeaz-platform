import { randomUUID } from "node:crypto";
import { assertWorkflowTransition, classifyError, Logger, shouldRetry, type ClassifiedError } from "@zveo/core";
import { retryPolicySchema } from "@zveo/contracts";
import { type RetryPolicy, type WorkflowState, workflowSubmissionSchema, type WorkflowSubmission } from "@zveo/contracts";

export interface WorkflowStep {
  readonly name: string;
  readonly state: WorkflowState;
  readonly compensate?: (context: WorkflowContext) => Promise<void>;
  run(context: WorkflowContext): Promise<void>;
}

export interface WorkflowContext {
  readonly workflowId: string;
  readonly tenantId: string;
  readonly correlationId: string;
  readonly submission: WorkflowSubmission;
  readonly metadata: Record<string, unknown>;
  setState(state: WorkflowState): void;
  recordCheckpoint(stepName: string, state: WorkflowState): void;
}

export interface WorkflowCheckpoint {
  readonly workflowId: string;
  readonly tenantId: string;
  readonly state: WorkflowState;
  readonly completedSteps: readonly string[];
  readonly updatedAt: string;
  readonly lastError?: ClassifiedError;
  readonly metadata: Record<string, unknown>;
}

export interface WorkflowCheckpointStore {
  load(workflowId: string): Promise<WorkflowCheckpoint | undefined>;
  save(checkpoint: WorkflowCheckpoint): Promise<void>;
}

export class InMemoryWorkflowCheckpointStore implements WorkflowCheckpointStore {
  private readonly checkpoints = new Map<string, WorkflowCheckpoint>();
  async load(workflowId: string): Promise<WorkflowCheckpoint | undefined> { return this.checkpoints.get(workflowId); }
  async save(checkpoint: WorkflowCheckpoint): Promise<void> { this.checkpoints.set(checkpoint.workflowId, checkpoint); }
}

export interface WorkflowEngineOptions {
  readonly steps: readonly WorkflowStep[];
  readonly store?: WorkflowCheckpointStore;
  readonly retryPolicy?: RetryPolicy;
  readonly logger?: Logger;
}

export interface WorkflowRunResult {
  readonly workflowId: string;
  readonly state: WorkflowState;
  readonly completedSteps: readonly string[];
  readonly attempts: number;
}

class RuntimeWorkflowContext implements WorkflowContext {
  state: WorkflowState;
  readonly completedSteps: string[];

  constructor(
    readonly workflowId: string,
    readonly tenantId: string,
    readonly correlationId: string,
    readonly submission: WorkflowSubmission,
    readonly metadata: Record<string, unknown>,
    checkpoint?: WorkflowCheckpoint,
  ) {
    this.state = checkpoint?.state ?? "submitted";
    this.completedSteps = [...(checkpoint?.completedSteps ?? [])];
  }

  setState(state: WorkflowState): void {
    this.state = assertWorkflowTransition(this.state, state);
  }

  recordCheckpoint(stepName: string, state: WorkflowState): void {
    this.setState(state);
    if (!this.completedSteps.includes(stepName)) this.completedSteps.push(stepName);
  }
}

export class WorkflowEngine {
  private readonly store: WorkflowCheckpointStore;
  private readonly retryPolicy: RetryPolicy;
  private readonly logger: Logger;

  constructor(private readonly options: WorkflowEngineOptions) {
    this.store = options.store ?? new InMemoryWorkflowCheckpointStore();
    this.retryPolicy = retryPolicySchema.parse(options.retryPolicy ?? {});
    this.logger = options.logger ?? new Logger({ service: "workflow-engine" });
  }

  async run(rawSubmission: WorkflowSubmission, metadata: Record<string, unknown> = {}): Promise<WorkflowRunResult> {
    const submission = workflowSubmissionSchema.parse(rawSubmission);
    const workflowId = submission.sceneGraph.id;
    const checkpoint = await this.store.load(workflowId);
    const context = new RuntimeWorkflowContext(
      workflowId,
      submission.tenantId,
      String(metadata.correlationId ?? randomUUID()),
      submission,
      metadata,
      checkpoint,
    );

    let attempts = 0;
    for (const step of this.options.steps) {
      if (context.completedSteps.includes(step.name)) continue;
      context.setState(step.state);
      await this.save(context);
      for (;;) {
        attempts += 1;
        try {
          this.logger.info("workflow step started", { workflowId, tenantId: submission.tenantId, step: step.name, attempt: attempts });
          await step.run(context);
          context.recordCheckpoint(step.name, step.state);
          await this.save(context);
          this.logger.info("workflow step completed", { workflowId, tenantId: submission.tenantId, step: step.name });
          break;
        } catch (error) {
          const classified = classifyError(error);
          await this.save(context, classified);
          this.logger.error("workflow step failed", error, { workflowId, tenantId: submission.tenantId, step: step.name, attempt: attempts, classified });
          if (!shouldRetry(error, attempts, this.retryPolicy)) {
            await this.compensate(context, step.name);
            context.setState("failed");
            await this.save(context, classified);
            return { workflowId, state: context.state, completedSteps: context.completedSteps, attempts };
          }
          await new Promise((resolve) => setTimeout(resolve, computeRetryDelay(attempts, this.retryPolicy)));
        }
      }
    }
    context.setState("completed");
    await this.save(context);
    return { workflowId, state: context.state, completedSteps: context.completedSteps, attempts };
  }

  private async compensate(context: RuntimeWorkflowContext, failedStep: string): Promise<void> {
    for (const step of [...this.options.steps].reverse()) {
      if (step.name === failedStep) break;
      if (!context.completedSteps.includes(step.name) || !step.compensate) continue;
      await step.compensate(context);
      this.logger.warn("workflow compensation completed", { workflowId: context.workflowId, step: step.name });
    }
  }

  private async save(context: RuntimeWorkflowContext, lastError?: ClassifiedError): Promise<void> {
    await this.store.save({
      workflowId: context.workflowId,
      tenantId: context.tenantId,
      state: context.state,
      completedSteps: context.completedSteps,
      updatedAt: new Date().toISOString(),
      ...(lastError === undefined ? {} : { lastError }),
      metadata: context.metadata,
    });
  }
}

export function computeRetryDelay(attempt: number, policy: RetryPolicy): number {
  const parsed = retryPolicySchema.parse(policy);
  const exponential = Math.min(parsed.maxDelayMs, parsed.baseDelayMs * 2 ** Math.max(0, attempt - 1));
  const jitter = exponential * parsed.jitterRatio * Math.random();
  return Math.round(exponential + jitter);
}
