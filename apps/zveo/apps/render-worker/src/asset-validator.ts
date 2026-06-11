import { createHash } from "node:crypto";
import { stat } from "node:fs/promises";
import { assetRecordSchema, type AssetRecord } from "@zveo/core";

const allowedMimeTypes = new Set(["video/mp4", "video/webm", "image/png", "image/jpeg", "application/json"]);

export async function validateRenderedAsset(input: Omit<AssetRecord, "sha256" | "bytes" | "version"> & { bytes: Buffer; version?: number }): Promise<AssetRecord> {
  if (!allowedMimeTypes.has(input.contentType)) throw new Error(`unsupported content type ${input.contentType}`);
  if (input.bytes.byteLength <= 0) throw new Error("asset is empty");
  if (input.bytes.byteLength > 10 * 1024 * 1024 * 1024) throw new Error("asset exceeds maximum render size");
  return assetRecordSchema.parse({
    ...input,
    bytes: input.bytes.byteLength,
    sha256: createHash("sha256").update(input.bytes).digest("hex"),
    version: input.version ?? 1,
  });
}

export async function validateLocalPath(path: string): Promise<void> {
  const info = await stat(path);
  if (!info.isFile()) throw new Error(`asset path is not a file: ${path}`);
  if (info.size <= 0) throw new Error(`asset file is empty: ${path}`);
}
