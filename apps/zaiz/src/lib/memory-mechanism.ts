import { db } from "./db";
import { runStream, composeSystemPrompt, type ChatMessage } from "./glm";

/**
 * Memory mechanism — server-only.
 *
 * Enhances the existing Memory model with:
 * - Auto-extraction: GLM scans conversation turns and pulls out memories
 * - Context injection: memories are composed into the system prompt
 * - Importance scoring: GLM rates memory importance 1-5
 * - Decay: old low-importance memories can be pruned
 */

export interface ExtractedMemory {
  content: string;
  category: "fact" | "preference" | "note" | "context";
  importance: number;
}

/**
 * Use GLM to extract memories from a conversation.
 * Returns a JSON array of { content, category, importance }.
 */
export async function extractMemories(
  messages: ChatMessage[],
): Promise<ExtractedMemory[]> {
  const systemPrompt = `You are a memory extraction system. Analyze the conversation and extract persistent facts about the user that would be useful in future conversations.

Extract:
- **fact**: Things the user stated about themselves, their project, or their environment
- **preference**: Coding style, tool, language, or workflow preferences
- **note**: Important context that affects future responses
- **context**: Project context (framework, version, structure)

Respond with ONLY a JSON array. Each element:
{"content": "<concise memory, max 200 chars>", "category": "fact|preference|note|context", "importance": 1-5}

Only extract genuinely useful, persistent memories. Skip trivial things. Max 5 memories. If nothing worth remembering, return [].`;

  const conversation = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .slice(-10)
    .map((m) => `${m.role}: ${m.content.slice(0, 500)}`)
    .join("\n\n");

  if (!conversation.trim()) return [];

  try {
    let result = "";
    for await (const delta of runStream(systemPrompt, [{ role: "user", content: conversation }], null)) {
      result += delta;
    }

    // Parse JSON array
    const start = result.indexOf("[");
    const end = result.lastIndexOf("]");
    if (start === -1 || end === -1) return [];

    const parsed = JSON.parse(result.slice(start, end + 1));
    if (!Array.isArray(parsed)) return [];

    return parsed
      .filter((m: unknown) => {
        const item = m as Record<string, unknown>;
        return typeof item.content === "string" && item.content.trim().length > 0;
      })
      .slice(0, 5)
      .map((m: unknown) => {
        const item = m as Record<string, unknown>;
        const cat = item.category as string;
        const validCats = ["fact", "preference", "note", "context"];
        return {
          content: String(item.content).slice(0, 200),
          category: (validCats.includes(cat) ? cat : "note") as "fact" | "preference" | "note" | "context",
          importance: Math.max(1, Math.min(5, typeof item.importance === "number" ? item.importance : 3)),
        };
      });
  } catch {
    return [];
  }
}

/**
 * Auto-extract and store memories from a conversation for a given key.
 */
export async function autoExtractAndStore(
  keyHash: string,
  messages: ChatMessage[],
): Promise<number> {
  const extracted = await extractMemories(messages);
  if (extracted.length === 0) return 0;

  // Get existing memories to avoid duplicates
  const existing = await db.memory.findMany({ where: { keyHash } });
  const existingContents = new Set(existing.map((m) => m.content.toLowerCase().slice(0, 50)));

  let stored = 0;
  for (const mem of extracted) {
    // Skip if a similar memory already exists
    if (existingContents.has(mem.content.toLowerCase().slice(0, 50))) continue;

    await db.memory.create({
      data: {
        keyHash,
        category: mem.category,
        content: mem.content,
        importance: mem.importance,
      },
    });
    stored++;
  }

  return stored;
}

/**
 * Build a memory context block for system prompt injection.
 * Returns a string to append to the system prompt, or empty if no memories.
 */
export async function buildMemoryContext(keyHash: string): Promise<string> {
  const memories = await db.memory.findMany({
    where: { keyHash },
    orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
    take: 15,
  });

  if (memories.length === 0) return "";

  const lines = memories
    .filter((m) => m.importance >= 2)
    .map((m) => `- [${m.category}] ${m.content}`)
    .join("\n");

  if (!lines) return "";

  return `\n\nUSER MEMORY — persistent facts about this user (use these to personalize responses):\n${lines}`;
}

/**
 * Build a semantic memory context block based on user query keyword matching (RAG).
 * Returns only memories relevant to the current user's prompt query.
 */
export async function buildSemanticMemoryContext(keyHash: string, userQuery: string): Promise<string> {
  const memories = await db.memory.findMany({
    where: { keyHash },
    orderBy: [{ importance: "desc" }, { updatedAt: "desc" }],
  });

  if (memories.length === 0) return "";

  const query = userQuery.toLowerCase();
  const keywords = query.split(/\s+/).filter((w) => w.length > 3);

  if (keywords.length === 0) {
    // Fallback to default memory context if the query is too short
    return buildMemoryContext(keyHash);
  }

  const scored = memories
    .map((m) => {
      let score = 0;
      const content = m.content.toLowerCase();

      // Semantic relevance scoring
      keywords.forEach((kw) => {
        if (content.includes(kw)) {
          score += 3.0;
        }
      });

      // Factor in importance
      score += m.importance * 0.5;

      return { memory: m, score };
    })
    .filter((item) => item.score > 1.5) // Min threshold for relevance
    .sort((a, b) => b.score - a.score)
    .slice(0, 10); // Limit context size

  if (scored.length === 0) return "";

  const lines = scored.map((item) => `- [${item.memory.category}] ${item.memory.content}`).join("\n");

  return `\n\nUSER MEMORY (semantically matched to query) — persistent facts about this user:\n${lines}`;
}

/**
 * Prune low-importance memories older than N days.
 */
export async function pruneMemories(keyHash: string, daysOld = 30): Promise<number> {
  const cutoff = new Date(Date.now() - daysOld * 86400000);
  const result = await db.memory.deleteMany({
    where: {
      keyHash,
      importance: { lte: 2 },
      updatedAt: { lt: cutoff },
    },
  });
  return result.count;
}
