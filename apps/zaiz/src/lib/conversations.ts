import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

/**
 * Conversation manager — server-only.
 *
 * Saves, loads, lists, and deletes conversations per user (keyed by API key hash).
 * Stored as JSON files in `.dev/conversations/<keyHash>/<id>.json`.
 */

export interface SavedConversation {
  id: string;
  keyHash: string;
  title: string;
  messages: { role: "user" | "assistant" | "system"; content: string; mode?: string }[];
  model: string;
  mode: string;
  createdAt: string;
  updatedAt: string;
}

const CONV_DIR = path.join(process.cwd(), ".dev", "conversations");

function convPath(keyHash: string, id: string): string {
  return path.join(CONV_DIR, keyHash, `${id}.json`);
}

function genId(): string {
  return `conv-${Date.now().toString(36)}-${randomBytes(3).toString("hex")}`;
}

/** Save a conversation. */
export async function saveConversation(opts: {
  keyHash: string;
  title: string;
  messages: { role: "user" | "assistant" | "system"; content: string; mode?: string }[];
  model: string;
  mode: string;
  id?: string;
}): Promise<SavedConversation> {
  const id = opts.id ?? genId();
  const dir = path.join(CONV_DIR, opts.keyHash);
  await mkdir(dir, { recursive: true });

  const now = new Date().toISOString();
  const conv: SavedConversation = {
    id,
    keyHash: opts.keyHash,
    title: opts.title.slice(0, 120) || "Untitled conversation",
    messages: opts.messages.slice(-50), // keep last 50
    model: opts.model,
    mode: opts.mode,
    createdAt: now,
    updatedAt: now,
  };

  await writeFile(convPath(opts.keyHash, id), JSON.stringify(conv, null, 2), "utf-8");
  return conv;
}

/** List all conversations for a user. */
export async function listConversations(keyHash: string): Promise<{ id: string; title: string; createdAt: string; updatedAt: string; messageCount: number }[]> {
  const dir = path.join(CONV_DIR, keyHash);
  let files: string[];
  try {
    files = await readFile(dir).then(() => []).catch(async () => {
      const { readdir } = await import("fs/promises");
      return readdir(dir).catch(() => []);
    });
  } catch {
    return [];
  }

  // Re-read properly
  const { readdir } = await import("fs/promises");
  let entries: string[];
  try {
    entries = await readdir(dir);
  } catch {
    return [];
  }

  const results: { id: string; title: string; createdAt: string; updatedAt: string; messageCount: number }[] = [];
  for (const file of entries) {
    if (!file.endsWith(".json")) continue;
    try {
      const raw = await readFile(path.join(dir, file), "utf-8");
      const conv = JSON.parse(raw) as SavedConversation;
      results.push({
        id: conv.id,
        title: conv.title,
        createdAt: conv.createdAt,
        updatedAt: conv.updatedAt,
        messageCount: conv.messages.length,
      });
    } catch {
      /* skip corrupt files */
    }
  }

  return results.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

/** Load a specific conversation. */
export async function loadConversation(keyHash: string, id: string): Promise<SavedConversation | null> {
  try {
    const raw = await readFile(convPath(keyHash, id), "utf-8");
    return JSON.parse(raw) as SavedConversation;
  } catch {
    return null;
  }
}

/** Delete a conversation. */
export async function deleteConversation(keyHash: string, id: string): Promise<boolean> {
  const { unlink } = await import("fs/promises");
  try {
    await unlink(convPath(keyHash, id));
    return true;
  } catch {
    return false;
  }
}
