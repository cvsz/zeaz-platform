/**
 * Data & Privacy — server-only.
 *
 * GDPR-style data management: export all user data, delete user data,
 * view what's stored, and manage privacy settings.
 */

import { db } from "./db";
import { hashKey } from "./billing";
import { readFile, unlink, readdir, rmdir } from "fs/promises";
import path from "path";

export interface DataInventory {
  apiKey: { exists: boolean; name?: string; lastFour?: string; usageCount?: number; createdAt?: string };
  profile: { exists: boolean; email?: string; name?: string; plan?: string; credits?: number; tokensUsed?: number };
  usageRecords: { count: number; oldestDate?: string };
  memories: { count: number };
  invoices: { count: number };
  roles: { count: number; names: string[] };
  conversations: { count: number };
  tasks: { count: number };
  settings: { exists: boolean };
}

export interface DataExport {
  ok: boolean;
  keyHash: string;
  exportedAt: string;
  data: unknown;
  error?: string;
}

export interface DeleteResult {
  ok: boolean;
  deleted: {
    apiKey: boolean;
    profile: boolean;
    usageRecords: number;
    memories: number;
    invoices: number;
    roles: number;
    conversations: number;
    tasks: number;
  };
  error?: string;
}

/** Get a full inventory of what data is stored for a user. */
export async function getDataInventory(keyHash: string): Promise<DataInventory> {
  const [apiKey, profile, usageRecords, memories, invoices, roles, conversations, tasksCount] = await Promise.all([
    db.apiKey.findFirst({ where: { keyHash } }),
    db.userProfile.findUnique({ where: { keyHash } }),
    db.usageRecord.findMany({ where: { keyHash }, orderBy: { createdAt: "asc" }, take: 1 }),
    db.memory.findMany({ where: { keyHash } }),
    db.invoice.findMany({ where: { keyHash } }),
    db.apiKeyRole.findMany({ where: { apiKeyId: keyHash } }),
    countConversations(keyHash),
    countTasks(keyHash),
  ]);

  const roleRecords = await db.apiKeyRole.findMany({
    where: { apiKeyId: keyHash },
    include: { Role: false },
  });

  return {
    apiKey: apiKey
      ? { exists: true, name: apiKey.name, lastFour: apiKey.lastFour, usageCount: apiKey.usageCount, createdAt: apiKey.createdAt.toISOString() }
      : { exists: false },
    profile: profile
      ? { exists: true, email: profile.email, name: profile.name, plan: profile.plan, credits: profile.credits, tokensUsed: profile.tokensUsed }
      : { exists: false },
    usageRecords: {
      count: await db.usageRecord.count({ where: { keyHash } }),
      oldestDate: usageRecords[0]?.createdAt.toISOString(),
    },
    memories: { count: memories.length },
    invoices: { count: invoices.length },
    roles: { count: roleRecords.length, names: roleRecords.map((r) => r.roleName) },
    conversations: { count: conversations },
    tasks: { count: tasksCount },
    settings: { exists: await fileExists(path.join(process.cwd(), ".dev", "settings.json")) },
  };
}

/** Export all user data as JSON (GDPR right to data portability). */
export async function exportUserData(keyHash: string): Promise<DataExport> {
  try {
    const [apiKey, profile, usageRecords, memories, invoices, roles] = await Promise.all([
      db.apiKey.findFirst({ where: { keyHash } }),
      db.userProfile.findUnique({ where: { keyHash } }),
      db.usageRecord.findMany({ where: { keyHash } }),
      db.memory.findMany({ where: { keyHash } }),
      db.invoice.findMany({ where: { keyHash } }),
      db.apiKeyRole.findMany({ where: { apiKeyId: keyHash } }),
    ]);

    const conversations = await exportConversations(keyHash);
    const tasks = await exportTasks(keyHash);

    return {
      ok: true,
      keyHash,
      exportedAt: new Date().toISOString(),
      data: {
        apiKey: apiKey ? { name: apiKey.name, lastFour: apiKey.lastFour, createdAt: apiKey.createdAt } : null,
        profile: profile ? { email: profile.email, name: profile.name, plan: profile.plan, credits: profile.credits, tokensUsed: profile.tokensUsed, requestCount: profile.requestCount } : null,
        usageRecords: usageRecords.map((r) => ({ endpoint: r.endpoint, model: r.model, inputTokens: r.inputTokens, outputTokens: r.outputTokens, createdAt: r.createdAt })),
        memories: memories.map((m) => ({ category: m.category, content: m.content, importance: m.importance, createdAt: m.createdAt })),
        invoices: invoices.map((i) => ({ number: i.number, description: i.description, amountCents: i.amountCents, status: i.status, createdAt: i.createdAt })),
        roles: roles.map((r) => ({ roleName: r.roleName })),
        conversations,
        tasks,
      },
    };
  } catch (err) {
    return { ok: false, keyHash, exportedAt: new Date().toISOString(), data: null, error: err instanceof Error ? err.message : "Export failed" };
  }
}

/** Delete all user data (GDPR right to erasure). */
export async function deleteUserData(keyHash: string): Promise<DeleteResult> {
  try {
    const [usageResult, memoryResult, invoiceResult, roleResult, profileResult, apiKeyResult] = await Promise.all([
      db.usageRecord.deleteMany({ where: { keyHash } }),
      db.memory.deleteMany({ where: { keyHash } }),
      db.invoice.deleteMany({ where: { keyHash } }),
      db.apiKeyRole.deleteMany({ where: { apiKeyId: keyHash } }),
      db.userProfile.deleteMany({ where: { keyHash } }),
      db.apiKey.deleteMany({ where: { keyHash } }),
    ]);

    const conversationsDeleted = await deleteConversationFiles(keyHash);
    const tasksDeleted = await deleteTasksData(keyHash);

    return {
      ok: true,
      deleted: {
        apiKey: apiKeyResult.count > 0,
        profile: profileResult.count > 0,
        usageRecords: usageResult.count,
        memories: memoryResult.count,
        invoices: invoiceResult.count,
        roles: roleResult.count,
        conversations: conversationsDeleted,
        tasks: tasksDeleted,
      },
    };
  } catch (err) {
    return { ok: false, deleted: { apiKey: false, profile: false, usageRecords: 0, memories: 0, invoices: 0, roles: 0, conversations: 0, tasks: 0 }, error: err instanceof Error ? err.message : "Delete failed" };
  }
}

// --- helpers ---

async function fileExists(p: string): Promise<boolean> {
  try { await readFile(p); return true; } catch { return false; }
}

async function countConversations(keyHash: string): Promise<number> {
  try {
    const dir = path.join(process.cwd(), ".dev", "conversations", keyHash);
    const files = await readdir(dir).catch(() => []);
    return files.filter((f) => f.endsWith(".json")).length;
  } catch { return 0; }
}

async function countTasks(keyHash: string): Promise<number> {
  try {
    const raw = await readFile(path.join(process.cwd(), ".dev", "tasks.json"), "utf-8");
    const store = JSON.parse(raw) as Record<string, unknown[]>;
    return (store[keyHash] ?? []).length;
  } catch { return 0; }
}

async function exportConversations(keyHash: string): Promise<unknown[]> {
  try {
    const dir = path.join(process.cwd(), ".dev", "conversations", keyHash);
    const files = await readdir(dir).catch(() => []);
    const convs: unknown[] = [];
    for (const file of files) {
      if (!file.endsWith(".json")) continue;
      const raw = await readFile(path.join(dir, file), "utf-8");
      convs.push(JSON.parse(raw));
    }
    return convs;
  } catch { return []; }
}

async function exportTasks(keyHash: string): Promise<unknown[]> {
  try {
    const raw = await readFile(path.join(process.cwd(), ".dev", "tasks.json"), "utf-8");
    const store = JSON.parse(raw) as Record<string, unknown[]>;
    return store[keyHash] ?? [];
  } catch { return []; }
}

async function deleteConversationFiles(keyHash: string): Promise<number> {
  try {
    const dir = path.join(process.cwd(), ".dev", "conversations", keyHash);
    const files = await readdir(dir).catch(() => []);
    for (const file of files) {
      await unlink(path.join(dir, file)).catch(() => {});
    }
    await rmdir(dir).catch(() => {});
    return files.length;
  } catch { return 0; }
}

async function deleteTasksData(keyHash: string): Promise<number> {
  try {
    const raw = await readFile(path.join(process.cwd(), ".dev", "tasks.json"), "utf-8");
    const store = JSON.parse(raw) as Record<string, unknown[]>;
    const count = (store[keyHash] ?? []).length;
    delete store[keyHash];
    await import("fs/promises").then(({ writeFile }) =>
      writeFile(path.join(process.cwd(), ".dev", "tasks.json"), JSON.stringify(store, null, 2), "utf-8")
    );
    return count;
  } catch { return 0; }
}
