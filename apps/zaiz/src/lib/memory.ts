import { db } from "./db";

/**
 * Memory system — server-only.
 *
 * Persistent per-user memories (facts, preferences, notes, context).
 * Memories are keyed by API key hash so each user has their own store.
 */

export type MemoryCategory = "fact" | "preference" | "note" | "context";

export interface MemoryEntry {
  id: string;
  keyHash: string;
  category: MemoryCategory;
  content: string;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

function toPublic(row: {
  id: string; keyHash: string; category: string; content: string;
  importance: number; createdAt: Date; updatedAt: Date;
}): MemoryEntry {
  return {
    id: row.id,
    keyHash: row.keyHash,
    category: row.category as MemoryCategory,
    content: row.content,
    importance: row.importance,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

/** List all memories for a key. */
export async function listMemories(keyHash: string): Promise<MemoryEntry[]> {
  const rows = await db.memory.findMany({
    where: { keyHash },
    orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
  });
  return rows.map(toPublic);
}

/** Add a memory. */
export async function addMemory(opts: {
  keyHash: string;
  category?: MemoryCategory;
  content: string;
  importance?: number;
}): Promise<MemoryEntry> {
  const row = await db.memory.create({
    data: {
      keyHash: opts.keyHash,
      category: opts.category ?? "note",
      content: opts.content.slice(0, 2000),
      importance: Math.max(1, Math.min(5, opts.importance ?? 3)),
    },
  });
  return toPublic(row);
}

/** Update a memory. */
export async function updateMemory(
  id: string,
  patch: { content?: string; importance?: number; category?: MemoryCategory },
): Promise<MemoryEntry | null> {
  const data: Record<string, unknown> = {};
  if (patch.content !== undefined) data.content = patch.content.slice(0, 2000);
  if (patch.importance !== undefined) data.importance = Math.max(1, Math.min(5, patch.importance));
  if (patch.category !== undefined) data.category = patch.category;
  const row = await db.memory.update({ where: { id }, data });
  return toPublic(row);
}

/** Delete a memory. */
export async function deleteMemory(id: string): Promise<boolean> {
  await db.memory.delete({ where: { id } });
  return true;
}

/** Clear all memories for a key. */
export async function clearMemories(keyHash: string): Promise<number> {
  const result = await db.memory.deleteMany({ where: { keyHash } });
  return result.count;
}

/** Get memories as a context string for prompt injection. */
export async function getMemoryContext(keyHash: string): Promise<string> {
  const memories = await listMemories(keyHash);
  if (memories.length === 0) return "";
  const lines = memories
    .filter((m) => m.importance >= 3)
    .slice(0, 20)
    .map((m) => `- [${m.category}] ${m.content}`);
  return `USER MEMORY — persistent facts about this user:\n${lines.join("\n")}`;
}
