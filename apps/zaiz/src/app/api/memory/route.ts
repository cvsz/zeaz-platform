import { NextRequest, NextResponse } from "next/server";
import { hashKey } from "@/lib/billing";
import { listMemories, addMemory, updateMemory, deleteMemory, clearMemories, type MemoryCategory } from "@/lib/memory";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Memory system.
 *
 * GET    /api/memory              — list memories (requires X-API-Key)
 * POST   /api/memory              — add memory { content, category?, importance? }
 * PATCH  /api/memory              — update memory { id, content?, importance?, category? }
 * DELETE /api/memory?id=<id>      — delete one memory (or ?clear=1 to clear all)
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  const memories = await listMemories(hashKey(apiKey));
  return NextResponse.json({ memories });
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  try {
    const body = await req.json();
    const content = typeof body.content === "string" ? body.content.trim() : "";
    if (!content) return NextResponse.json({ error: "`content` is required." }, { status: 400 });
    const memory = await addMemory({
      keyHash: hashKey(apiKey),
      content,
      category: body.category as MemoryCategory | undefined,
      importance: typeof body.importance === "number" ? body.importance : undefined,
    });
    return NextResponse.json(memory, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  try {
    const body = await req.json();
    if (typeof body.id !== "string") return NextResponse.json({ error: "`id` required." }, { status: 400 });
    const memory = await updateMemory(body.id, {
      content: typeof body.content === "string" ? body.content : undefined,
      importance: typeof body.importance === "number" ? body.importance : undefined,
      category: body.category as MemoryCategory | undefined,
    });
    return NextResponse.json(memory);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  const clear = url.searchParams.get("clear") === "1";
  if (clear) {
    const count = await clearMemories(hashKey(apiKey));
    return NextResponse.json({ ok: true, cleared: count });
  }
  if (!id) return NextResponse.json({ error: "`id` or `clear=1` required." }, { status: 400 });
  await deleteMemory(id);
  return NextResponse.json({ ok: true });
}
