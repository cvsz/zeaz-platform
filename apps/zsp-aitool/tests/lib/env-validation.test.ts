import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("@next/env", () => ({
  loadEnvConfig: vi.fn(),
}));

const requiredEnv = {
  DATABASE_URL: "postgresql://postgres:postgres@localhost:5432/zsp_aitool",
  AUTH_SECRET: "test-auth-secret-for-env-tests!!",
  NEXT_PUBLIC_APP_URL: "https://studio.zeaz.dev",
  NEXT_PUBLIC_API_BASE_URL: "https://studio.zeaz.dev/api",
  AI_DAILY_BUDGET_USD: "20",
  AI_MAX_REQUESTS_PER_MINUTE: "30",
  OCR_MAX_REQUESTS_PER_MINUTE: "20",
};

const originalEnv = Object.fromEntries(
  Object.keys(requiredEnv).map((key) => [key, process.env[key]]),
) as Record<string, string | undefined>;

function applyEnv(values: Record<string, string | undefined>) {
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
}

afterEach(() => {
  for (const [key, value] of Object.entries(originalEnv)) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  vi.resetModules();
});

describe("env validation", () => {
  it("parses the expected startup environment", async () => {
    applyEnv(requiredEnv);
    const { env } = await import("@/lib/env");

    expect(env.AUTH_SECRET).toHaveLength(32);
    expect(env.NEXT_PUBLIC_API_BASE_URL).toBe("https://studio.zeaz.dev/api");
    expect(env.DATABASE_URL).toContain("zsp_aitool");
  });
});
