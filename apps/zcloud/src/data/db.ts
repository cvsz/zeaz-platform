import mysql from "mysql2/promise";

const pool = mysql.createPool({
  host: process.env.ZCLOUD_DB_HOST || "127.0.0.1",
  user: process.env.ZCLOUD_DB_USER || "zcloud_user",
  password: process.env.ZCLOUD_DB_PASSWORD,
  database: process.env.ZCLOUD_DB_DATABASE || "zcloud",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
    const [result] = await pool.execute(
      `INSERT INTO chat_logs (session_id, prompt, response, provider_used, model_used, latency_ms, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
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
    return result;
  } catch (error) {
    console.error("Failed to log chat to MariaDB:", error);
    return null;
  }
}

export async function getChatLogs(limit = 50) {
  try {
    const [rows] = await pool.execute(
      `SELECT * FROM chat_logs ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    return rows;
  } catch (error) {
    console.error("Failed to get chat logs from MariaDB:", error);
    return [];
  }
}
