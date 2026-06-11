import type { Config } from "drizzle-kit";

export default {
  schema: "./packages/db/src/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "postgres://zveo:zveo_dev_password@localhost:5432/zveo",
  },
  strict: true,
  verbose: true,
} satisfies Config;
