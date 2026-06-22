import { NextRequest, NextResponse } from "next/server";
import { hashKey } from "@/lib/billing";
import { saveConversation, listConversations, loadConversation, deleteConversation } from "@/lib/conversations";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/conversations — list conversations (requires X-API-Key) */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const url = new URL(req.url);
  const loadId = url.searchParams.get("load");

  if (loadId) {
    const conv = await loadConversation(hashKey(apiKey), loadId);
    if (!conv) return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    return NextResponse.json(conv);
  }

  const list = await listConversations(hashKey(apiKey));
  return NextResponse.json({ conversations: list });
}

/** POST /api/conversations — save conversation { title, messages, model, mode, id? } */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  try {
    const body = await req.json();
    const conv = await saveConversation({
      keyHash: hashKey(apiKey),
      title: String(body.title ?? "Untitled"),
      messages: Array.isArray(body.messages) ? body.messages : [],
      model: String(body.model ?? "zlm-4.5-air"),
      mode: String(body.mode ?? "chat"),
      id: body.id,
    });
    return NextResponse.json(conv, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to save conversation" }, { status: 500 });
  }
}

/** DELETE /api/conversations?id=<id> — delete conversation */
export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "`id` required" }, { status: 400 });
  const ok = await deleteConversation(hashKey(apiKey), id);
  return NextResponse.json({ ok });
}
