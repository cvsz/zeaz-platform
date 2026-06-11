import pg from "pg";

const pool = new pg.Pool({
  host: process.env.ZCLOUD_DB_HOST || "127.0.0.1",
  user: process.env.ZCLOUD_DB_USER || "zcloud_user",
  password: process.env.ZCLOUD_DB_PASSWORD,
  database: process.env.ZCLOUD_DB_DATABASE || "zcloud",
  port: parseInt(process.env.ZCLOUD_DB_PORT || "5432", 10),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("error", (err) => {
  console.error("Unexpected PostgreSQL pool error:", err);
});

export default pool;

export async function logChat(params: {
  sessionId: string;
  prompt: string;
  response: string;
  providerUsed: string;
  modelUsed: string;
  latencyMs: number;
  status: string;
}) {
  try {
    const result = await pool.query(
      `INSERT INTO chat_logs (session_id, prompt, response, provider_used, model_used, latency_ms, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        params.sessionId,
        params.prompt,
        params.response,
        params.providerUsed,
        params.modelUsed,
        params.latencyMs,
        params.status,
      ]
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to log chat to PostgreSQL:", error);
    return null;
  }
}

export async function getChatLogs(limit = 50) {
  try {
    const result = await pool.query(
      "SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT $1",
      [limit]
    );
    return result.rows;
  } catch (error) {
    console.error("Failed to get chat logs from PostgreSQL:", error);
    return [];
  }
}
