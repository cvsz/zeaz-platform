import { z } from "zod";
import { isoDateTimeSchema, jobStateSchema, nonEmptyString, renderJobPayloadSchema, uuidSchema, workflowStateSchema } from "./schemas.js";

export const eventNameSchema = z.enum([
  "workflow.submitted",
  "workflow.state_changed",
  "scene_graph.compiled",
  "prompt.compiled",
  "render.enqueued",
  "render.heartbeat",
  "render.completed",
  "render.failed",
  "asset.validated",
  "media_pipeline.planned",
  "media_pipeline.checkpointed",
  "media_pipeline.export_completed",
  "job.dead_lettered",
]);

export const eventEnvelopeSchema = z.object({
  id: uuidSchema,
  name: eventNameSchema,
  occurredAt: isoDateTimeSchema,
  tenantId: uuidSchema,
  workflowId: uuidSchema.optional(),
  correlationId: uuidSchema,
  causationId: uuidSchema.optional(),
  actorId: uuidSchema.optional(),
  schemaVersion: z.literal(1),
  payload: z.record(z.unknown()),
});

export const workflowStateChangedPayloadSchema = z.object({
  from: workflowStateSchema,
  to: workflowStateSchema,
  reason: nonEmptyString,
});

export const jobDeadLetteredPayloadSchema = z.object({
  queueName: z.string().min(1),
  jobId: uuidSchema,
  previousState: jobStateSchema,
  errorCode: z.string().min(1),
  errorMessage: z.string().min(1),
  attempts: z.number().int().min(1),
  payload: renderJobPayloadSchema,
});

export type EventEnvelope = z.infer<typeof eventEnvelopeSchema>;
export type EventName = z.infer<typeof eventNameSchema>;

export function createEvent(input: Omit<EventEnvelope, "id" | "occurredAt" | "schemaVersion"> & { id?: string; occurredAt?: string }): EventEnvelope {
  return eventEnvelopeSchema.parse({
    ...input,
    id: input.id ?? crypto.randomUUID(),
    occurredAt: input.occurredAt ?? new Date().toISOString(),
    schemaVersion: 1,
  });
}
