import "./src/load-env.ts"
import { defineConfig } from "drizzle-kit"
import { parsePgConnectionConfig } from "./src/pg-config.ts"

const databaseUrl = process.env.DATABASE_URL?.trim()

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/schema.ts",
  out: "./drizzle",
  dbCredentials: databaseUrl
    ? parsePgConnectionConfig(databaseUrl)
    : {
        host: "127.0.0.1",
        port: 5432,
        user: "postgres",
        password: "postgres",
        database: "den",
      },
})
