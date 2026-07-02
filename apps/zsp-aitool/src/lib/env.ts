import { loadEnvConfig } from "@next/env";
import { z } from "zod";

loadEnvConfig(process.cwd());

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().url(),
  AUTH_SECRET: z.string().min(32),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),
  NEXT_PUBLIC_API_BASE_URL: z.string().url().optional(),
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_BASE_URL: z.string().url().optional(),
  AI_DAILY_BUDGET_USD: z.coerce.number().positive().default(20),
  AI_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(30),
  OCR_MAX_REQUESTS_PER_MINUTE: z.coerce.number().int().positive().default(20),
  ZSP_ENABLE_DEMO_USER: z.string().optional(),
  DEFAULT_USER_ID: z.string().min(1).optional(),
}).superRefine((values, ctx) => {
  if (values.ZSP_ENABLE_DEMO_USER === "true" && !values.DEFAULT_USER_ID) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["DEFAULT_USER_ID"],
      message: "DEFAULT_USER_ID is required when ZSP_ENABLE_DEMO_USER is true",
    });
  }
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  AUTH_SECRET: process.env.AUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || undefined,
  OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || undefined,
  AI_DAILY_BUDGET_USD: process.env.AI_DAILY_BUDGET_USD,
  AI_MAX_REQUESTS_PER_MINUTE: process.env.AI_MAX_REQUESTS_PER_MINUTE,
  OCR_MAX_REQUESTS_PER_MINUTE: process.env.OCR_MAX_REQUESTS_PER_MINUTE,
  ZSP_ENABLE_DEMO_USER: process.env.ZSP_ENABLE_DEMO_USER,
  DEFAULT_USER_ID: process.env.DEFAULT_USER_ID,
});

export type Env = z.infer<typeof envSchema>;
