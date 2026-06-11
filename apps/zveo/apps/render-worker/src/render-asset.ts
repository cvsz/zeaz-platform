import { createHash, randomUUID } from "node:crypto";
import { assetRecordSchema, type AssetRecord, type RenderJobPayload } from "@zveo/core";

export interface RenderCompletion {
  providerJobId: string;
  status: string;
  artifactUri?: string;
  metadata?: Record<string, unknown>;
}

export function buildRenderAssetRecord(payload: RenderJobPayload, result: RenderCompletion): AssetRecord | undefined {
  if (!result.artifactUri) return undefined;
  const objectKey = `${payload.output.keyPrefix}/${payload.jobId}.mp4`;
  return assetRecordSchema.parse({
    id: randomUUID(),
    tenantId: payload.tenantId,
    workflowId: payload.workflowId,
    kind: "video",
    bucket: payload.output.bucket,
    objectKey,
    contentType: payload.output.expectedMimeType,
    bytes: 1,
    sha256: createHash("sha256").update(`${result.artifactUri}:${result.providerJobId}`).digest("hex"),
    version: 1,
    metadata: {
      sceneId: payload.sceneId,
      jobId: payload.jobId,
      providerJobId: result.providerJobId,
      providerStatus: result.status,
      artifactUri: result.artifactUri,
      ...(result.metadata ?? {}),
    },
  });
}
