import { z } from "zod";
import { loadSecret } from "@zveo/core";

const rawConfigSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(8080),
  REDIS_URL: z.string().url().default("redis://localhost:6379"),
  AUTH_SHARED_SECRET: z.string().min(32).optional(),
  AUTH_SHARED_SECRET_FILE: z.string().min(1).optional(),
  S3_BUCKET: z.string().min(3).default("zveo-renders"),
  MEDIA_EXPORT_BUCKET: z.string().min(3).default("zveo-exports"),
  TLS_CERT_FILE: z.string().min(1).optional(),
  TLS_KEY_FILE: z.string().min(1).optional(),
  RATE_LIMIT_CAPACITY: z.coerce.number().int().min(1).max(100_000).default(120),
  RATE_LIMIT_REFILL_TOKENS: z.coerce.number().int().min(1).max(100_000).default(120),
  RATE_LIMIT_REFILL_INTERVAL_MS: z.coerce.number().int().min(100).max(3_600_000).default(60_000),
  OPENAI_MODEL: z.string().min(1).default("gpt-4.1-mini"),
});

const raw = rawConfigSchema.parse(process.env);

const secretSource = {
  name: "AUTH_SHARED_SECRET",
  minLength: 32,
  ...(raw.AUTH_SHARED_SECRET_FILE === undefined ? {} : { file: raw.AUTH_SHARED_SECRET_FILE }),
  ...(raw.AUTH_SHARED_SECRET === undefined && raw.NODE_ENV === "production" ? {} : { env: raw.AUTH_SHARED_SECRET ?? "development-only-signing-key-change-before-production" }),
};

export const config = {
  ...raw,
  AUTH_SHARED_SECRET: loadSecret(secretSource),
};

export type ApiConfig = typeof config;
