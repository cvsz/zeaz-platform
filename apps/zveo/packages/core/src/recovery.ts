import { z } from "zod";
import { isoDateTimeSchema, jobStateSchema, uuidSchema, workflowStateSchema } from "./schemas.js";

export const workflowCheckpointSchema = z.object({
  workflowId: uuidSchema,
  tenantId: uuidSchema,
  state: workflowStateSchema,
  completedSceneIds: z.array(z.string().trim().min(1).max(128)).default([]),
  queuedSceneIds: z.array(z.string().trim().min(1).max(128)).default([]),
  failedSceneIds: z.array(z.string().trim().min(1).max(128)).default([]),
  assetKeys: z.array(z.string().trim().min(1).max(1024)).default([]),
  updatedAt: isoDateTimeSchema,
});

export const resumableJobSnapshotSchema = z.object({
  jobId: uuidSchema,
  sceneId: z.string().trim().min(1).max(128),
  idempotencyKey: z.string().trim().min(1).max(512),
  state: jobStateSchema,
  attemptsMade: z.number().int().min(0).max(10_000),
  lastHeartbeatAt: isoDateTimeSchema.optional(),
  outputKey: z.string().trim().min(1).max(1024).optional(),
});

export type WorkflowCheckpoint = z.infer<typeof workflowCheckpointSchema>;
export type ResumableJobSnapshot = z.infer<typeof resumableJobSnapshotSchema>;

export interface RecoveryPlan {
  workflowId: string;
  resumeSceneIds: string[];
  skipSceneIds: string[];
  requeueJobIds: string[];
  inspectJobIds: string[];
  reason: string;
}

export function planWorkflowRecovery(checkpointInput: WorkflowCheckpoint, jobInputs: ResumableJobSnapshot[], staleHeartbeatBefore: Date): RecoveryPlan {
  const checkpoint = workflowCheckpointSchema.parse(checkpointInput);
  const jobs = jobInputs.map((job) => resumableJobSnapshotSchema.parse(job));
  const completed = new Set(checkpoint.completedSceneIds);
  const resumeSceneIds = new Set<string>(checkpoint.failedSceneIds);
  const skipSceneIds = new Set<string>(checkpoint.completedSceneIds);
  const requeueJobIds: string[] = [];
  const inspectJobIds: string[] = [];

  for (const job of jobs) {
    if (job.state === "succeeded" || (job.outputKey && completed.has(job.sceneId))) {
      skipSceneIds.add(job.sceneId);
      continue;
    }
    if (job.state === "queued" || job.state === "retry_scheduled") continue;
    if (job.state === "failed" || job.state === "dead_lettered" || job.state === "heartbeat_lost") {
      resumeSceneIds.add(job.sceneId);
      requeueJobIds.push(job.jobId);
      continue;
    }
    if ((job.state === "leased" || job.state === "running") && job.lastHeartbeatAt && new Date(job.lastHeartbeatAt) < staleHeartbeatBefore) {
      resumeSceneIds.add(job.sceneId);
      requeueJobIds.push(job.jobId);
      continue;
    }
    if (job.state === "leased" || job.state === "running") inspectJobIds.push(job.jobId);
  }

  for (const sceneId of checkpoint.queuedSceneIds) {
    if (!skipSceneIds.has(sceneId)) resumeSceneIds.add(sceneId);
  }

  return {
    workflowId: checkpoint.workflowId,
    resumeSceneIds: [...resumeSceneIds].filter((sceneId) => !skipSceneIds.has(sceneId)).sort(),
    skipSceneIds: [...skipSceneIds].sort(),
    requeueJobIds,
    inspectJobIds,
    reason: "checkpoint compared against resumable job snapshots with idempotent scene keys",
  };
}
