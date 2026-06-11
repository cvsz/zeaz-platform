import type { JobState, WorkflowState } from "./schemas.js";

export class InvalidStateTransitionError extends Error {
  constructor(entity: "workflow" | "job", from: string, to: string) {
    super(`invalid ${entity} state transition from ${from} to ${to}`);
    this.name = "InvalidStateTransitionError";
  }
}

const workflowTransitions: Readonly<Record<WorkflowState, readonly WorkflowState[]>> = {
  draft: ["submitted", "cancelled"],
  submitted: ["validating", "cancelled"],
  validating: ["queued", "failed", "cancelled"],
  queued: ["compiling_scene_graph", "cancelled"],
  compiling_scene_graph: ["compiling_prompts", "recovering", "failed", "cancelled"],
  compiling_prompts: ["rendering", "recovering", "failed", "cancelled"],
  rendering: ["validating_assets", "recovering", "failed", "cancelled"],
  validating_assets: ["completed", "recovering", "failed", "cancelled"],
  completed: [],
  failed: ["recovering", "cancelled"],
  cancelled: [],
  recovering: ["queued", "compiling_scene_graph", "compiling_prompts", "rendering", "validating_assets", "failed", "cancelled"],
};

const jobTransitions: Readonly<Record<JobState, readonly JobState[]>> = {
  queued: ["leased", "cancelled"],
  leased: ["running", "heartbeat_lost", "retry_scheduled", "failed", "cancelled"],
  running: ["succeeded", "retry_scheduled", "failed", "heartbeat_lost", "cancelled"],
  heartbeat_lost: ["queued", "retry_scheduled", "dead_lettered"],
  retry_scheduled: ["queued", "dead_lettered", "cancelled"],
  succeeded: [],
  failed: ["retry_scheduled", "dead_lettered"],
  dead_lettered: [],
  cancelled: [],
};

function assertTransition<T extends string>(entity: "workflow" | "job", transitions: Readonly<Record<T, readonly T[]>>, from: T, to: T): T {
  if (from === to || transitions[from]?.includes(to)) return to;
  throw new InvalidStateTransitionError(entity, from, to);
}

export function assertWorkflowTransition(from: WorkflowState, to: WorkflowState): WorkflowState {
  return assertTransition("workflow", workflowTransitions, from, to);
}

export function assertJobTransition(from: JobState, to: JobState): JobState {
  return assertTransition("job", jobTransitions, from, to);
}

export function workflowNextStates(from: WorkflowState): readonly WorkflowState[] {
  return workflowTransitions[from];
}

export function jobNextStates(from: JobState): readonly JobState[] {
  return jobTransitions[from];
}
