import { createHash, randomBytes } from "crypto";
import { db } from "./db";

/**
 * API key management — server-only.
 *
 * Keys are stored hashed (sha256). The raw key is only ever returned once at
 * creation time. Rate limiting uses an in-memory sliding window per key.
 *
 * The "require key" gate is controlled by a single-row config in the
 * KeyConfig table (lazily created). When enabled, all /api/cli, /api/agent,
 * and /api/plan requests must carry a valid `X-API-Key` header.
 */

export interface ApiKeyPublic {
  id: string;
  lastFour: string;
  name: string;
  rateLimitPerHour: number;
  usageCount: number;
  active: boolean;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
}

export interface ApiKeyCreated extends ApiKeyPublic {
  /** The raw key — only returned at creation. Never stored. */
  key: string;
}

export interface KeyConfig {
  requireKey: boolean;
}

/* ---------------- hashing & generation ---------------- */

function hashKey(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

/** Generate a random key like `zlm-<32 hex chars>`. */
export function generateRawKey(): string {
  return `zlm-${randomBytes(16).toString("hex")}`;
}

function toPublic(row: {
  id: string;
  lastFour: string;
  name: string;
  rateLimitPerHour: number;
  usageCount: number;
  active: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}): ApiKeyPublic {
  return {
    id: row.id,
    lastFour: row.lastFour,
    name: row.name,
    rateLimitPerHour: row.rateLimitPerHour,
    usageCount: row.usageCount,
    active: row.active,
    lastUsedAt: row.lastUsedAt ? row.lastUsedAt.toISOString() : null,
    expiresAt: row.expiresAt ? row.expiresAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
  };
}

/* ---------------- CRUD ---------------- */

/** List all keys (never returns the raw key). */
export async function listKeys(): Promise<ApiKeyPublic[]> {
  const rows = await db.apiKey.findMany({
    orderBy: { createdAt: "desc" },
  });
  return rows.map(toPublic);
}

/** Create a new key. Returns the raw key once. */
export async function createKey(opts: {
  name: string;
  rateLimitPerHour?: number;
  expiresAt?: Date | null;
}): Promise<ApiKeyCreated> {
  const raw = generateRawKey();
  const lastFour = raw.slice(-4);
  const row = await db.apiKey.create({
    data: {
      keyHash: hashKey(raw),
      lastFour,
      name: opts.name.trim().slice(0, 80) || "Unnamed key",
      rateLimitPerHour: opts.rateLimitPerHour ?? 60,
      expiresAt: opts.expiresAt ?? null,
    },
  });
  return { ...toPublic(row), key: raw };
}

/** Revoke (deactivate) a key by id. */
export async function revokeKey(id: string): Promise<boolean> {
  const row = await db.apiKey.update({
    where: { id },
    data: { active: false },
  });
  return !row.active;
}

/** Delete a key permanently. */
export async function deleteKey(id: string): Promise<boolean> {
  await db.apiKey.delete({ where: { id } });
  return true;
}

/** Update a key's rate limit. */
export async function updateKeyRateLimit(
  id: string,
  rateLimitPerHour: number,
): Promise<ApiKeyPublic | null> {
  const row = await db.apiKey.update({
    where: { id },
    data: { rateLimitPerHour: Math.max(0, Math.floor(rateLimitPerHour)) },
  });
  return toPublic(row);
}

/* ---------------- config (require-key gate) ---------------- */

/**
 * The require-key config is stored as a singleton row in the `KeyConfig`-like
 * shape. We persist it via a dedicated table-free approach: a JSON file under
 * `.dev/key-config.json`. This avoids a schema migration for a single boolean.
 */
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";

const CONFIG_PATH = path.join(process.cwd(), ".dev", "key-config.json");

export async function getKeyConfig(): Promise<KeyConfig> {
  try {
    const raw = await readFile(CONFIG_PATH, "utf-8");
    const parsed = JSON.parse(raw) as Partial<KeyConfig>;
    return { requireKey: parsed.requireKey === true };
  } catch {
    return { requireKey: false };
  }
}

export async function setKeyConfig(cfg: KeyConfig): Promise<KeyConfig> {
  await mkdir(path.dirname(CONFIG_PATH), { recursive: true });
  await writeFile(CONFIG_PATH, JSON.stringify(cfg, null, 2), "utf-8");
  return cfg;
}

/* ---------------- validation & rate limiting ---------------- */

/** In-memory sliding-window rate limiter: key hash -> [timestamps]. */
const rateBuckets = new Map<string, number[]>();
const WINDOW_MS = 60 * 60 * 1000; // 1 hour

function checkRateLimit(keyHash: string, limit: number): {
  ok: boolean;
  remaining: number;
  resetInMs: number;
} {
  if (limit <= 0) return { ok: true, remaining: Infinity, resetInMs: 0 };
  const now = Date.now();
  const cutoff = now - WINDOW_MS;
  const bucket = (rateBuckets.get(keyHash) ?? []).filter((t) => t > cutoff);
  if (bucket.length >= limit) {
    const oldest = bucket[0];
    return { ok: false, remaining: 0, resetInMs: oldest + WINDOW_MS - now };
  }
  bucket.push(now);
  rateBuckets.set(keyHash, bucket);
  return { ok: true, remaining: limit - bucket.length, resetInMs: WINDOW_MS };
}

export interface ValidationResult {
  ok: boolean;
  status: number; // 0 if ok
  error?: string;
  keyId?: string;
  remaining?: number;
}

/**
 * Validate an incoming API key (from the `X-API-Key` header) against the DB,
 * check active + expiry, then check the rate limit.
 *
 * If `requireKey` is false, returns ok immediately with no key context.
 */
export async function validateRequest(
  apiKey: string | null | undefined,
): Promise<ValidationResult> {
  const config = await getKeyConfig();
  if (!config.requireKey) {
    return { ok: true, status: 0 };
  }

  if (!apiKey) {
    return {
      ok: false,
      status: 401,
      error: "API key required. Set one via /keys and send it in the X-API-Key header.",
    };
  }

  const keyHash = hashKey(apiKey);
  const row = await db.apiKey.findUnique({ where: { keyHash } });

  if (!row) {
    return { ok: false, status: 401, error: "Invalid API key." };
  }
  if (!row.active) {
    return { ok: false, status: 401, error: "This API key has been revoked." };
  }
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) {
    return { ok: false, status: 401, error: "This API key has expired." };
  }

  const rate = checkRateLimit(keyHash, row.rateLimitPerHour);
  if (!rate.ok) {
    return {
      ok: false,
      status: 429,
      error: `Rate limit exceeded (${row.rateLimitPerHour}/hour). Try again in ${Math.ceil(rate.resetInMs / 1000)}s.`,
      keyId: row.id,
      remaining: 0,
    };
  }

  // Bump usage + lastUsed asynchronously (fire-and-forget).
  db.apiKey
    .update({
      where: { id: row.id },
      data: {
        usageCount: { increment: 1 },
        lastUsedAt: new Date(),
      },
    })
    .catch(() => {
      /* ignore usage-update errors */
    });

  return {
    ok: true,
    status: 0,
    keyId: row.id,
    remaining: rate.remaining,
  };
}

/** Extract the API key from a NextRequest (header or ?apiKey=). */
export function extractApiKey(req: Request): string | null {
  const fromHeader = req.headers.get("x-api-key");
  if (fromHeader) return fromHeader.trim();
  const url = new URL(req.url);
  const fromQuery = url.searchParams.get("apiKey");
  if (fromQuery) return fromQuery.trim();
  return null;
}
