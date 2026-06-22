import { NextRequest, NextResponse } from "next/server";
import { hashKey } from "@/lib/billing";
import { getUsageStats, toggleInternet, toggleMemory } from "@/lib/usage";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Usage tracking + internet/memory toggles.
 *
 * GET   /api/usage                    — get usage stats (requires X-API-Key)
 * PATCH /api/usage { internet?, memory? } — toggle internet/memory access
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  const stats = await getUsageStats(hashKey(apiKey));
  return NextResponse.json(stats);
}

export async function PATCH(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required." }, { status: 401 });
  try {
    const body = await req.json();
    const keyHash = hashKey(apiKey);
    const updates: Record<string, boolean> = {};
    if (typeof body.internet === "boolean") {
      updates.internet = await toggleInternet(keyHash, body.internet);
    }
    if (typeof body.memory === "boolean") {
      updates.memory = await toggleMemory(keyHash, body.memory);
    }
    return NextResponse.json({ ok: true, ...updates });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Failed" }, { status: 500 });
  }
}
