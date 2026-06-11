type ParsedPgConfig = {
  host: string
  port: number
  user: string
  password: string
  database: string
  ssl?: {
    rejectUnauthorized: boolean
  }
}

function readSslSettings(parsed: URL) {
  const sslMode =
    parsed.searchParams.get("sslmode")?.trim().toLowerCase() ??
    parsed.searchParams.get("ssl-mode")?.trim().toLowerCase()

  if (!sslMode) {
    return undefined
  }

  const rejectUnauthorized =
    sslMode === "verify-ca" ||
    sslMode === "verify-full" ||
    sslMode === "require"

  return { rejectUnauthorized }
}

export function parsePgConnectionConfig(databaseUrl: string): ParsedPgConfig {
  const parsed = new URL(databaseUrl)
  const database = parsed.pathname.replace(/^\//, "")

  if (!parsed.hostname || !parsed.username || !database) {
    throw new Error("DATABASE_URL must include host, username, and database for pg mode")
  }

  return {
    host: parsed.hostname,
    port: Number(parsed.port || "5432"),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database,
    ssl: readSslSettings(parsed),
  }
}
