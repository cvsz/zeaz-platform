import { drizzle } from "drizzle-orm/pg-core"
import { drizzle as drizzleNode } from "drizzle-orm/node-postgres"
import pg from "pg"
import { parsePgConnectionConfig } from "./pg-config"
import * as schema from "./schema"

export type DenDbMode = "pg"
type DenDb = ReturnType<typeof drizzleNode>

const TRANSIENT_DB_ERROR_CODES = new Set([
  "ECONNRESET",
  "EPIPE",
  "ETIMEDOUT",
  "PROTOCOL_CONNECTION_LOST",
])

const RETRYABLE_QUERY_PREFIXES = ["select", "show", "describe", "explain"]

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null
}

function getErrorCode(error: unknown): string | null {
  if (!isRecord(error)) {
    return null
  }

  if (typeof error.code === "string") {
    return error.code
  }

  return getErrorCode(error.cause)
}

export function isTransientDbConnectionError(error: unknown): boolean {
  const code = getErrorCode(error)
  if (!code) {
    return false
  }
  return TRANSIENT_DB_ERROR_CODES.has(code)
}

function extractSql(value: unknown): string | null {
  if (typeof value === "string") {
    return value
  }

  if (!isRecord(value)) {
    return null
  }

  if (typeof value.sql === "string") {
    return value.sql
  }

  return null
}

function isRetryableReadQuery(sql: string | null): boolean {
  if (!sql) {
    return false
  }

  const normalized = sql.trimStart().toLowerCase()
  return RETRYABLE_QUERY_PREFIXES.some((prefix) => normalized.startsWith(prefix))
}

async function retryReadQuery<T>(label: "query" | "execute", sql: string | null, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (!isRetryableReadQuery(sql) || !isTransientDbConnectionError(error)) {
      throw error
    }

    const queryType = sql?.trimStart().split(/\s+/, 1)[0]?.toUpperCase() ?? "QUERY"
    console.warn(`[db] transient pg error on ${label} (${queryType}); retrying once`)
    return run()
  }
}

export function createDenDb(input: {
  databaseUrl?: string | null
  mode?: DenDbMode
}) {
  if (!input.databaseUrl) {
    throw new Error("PostgreSQL mode requires DATABASE_URL")
  }

  const client = new pg.Pool({
    ...parsePgConnectionConfig(input.databaseUrl),
    max: 10,
    idleTimeoutMillis: 60_000,
    connectionTimeoutMillis: 10_000,
    allowExitOnIdle: true,
  })

  const query = client.query.bind(client)
  const retryingQuery: typeof query = (async (...args: Parameters<typeof query>) => {
    const sql = extractSql(args[0])
    return retryReadQuery("query", sql, () => query(...args))
  }) as typeof query

  client.query = retryingQuery

  return {
    client,
    db: drizzleNode(client, { schema }) as unknown as DenDb,
  }
}
