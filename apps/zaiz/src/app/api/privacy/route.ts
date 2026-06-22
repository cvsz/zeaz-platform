import { NextRequest, NextResponse } from "next/server";
import { getDataInventory, exportUserData, deleteUserData } from "@/lib/privacy";
import { hashKey } from "@/lib/billing";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Data & Privacy (GDPR).
 *
 * GET    /api/privacy              — data inventory (requires X-API-Key)
 * POST   /api/privacy { action: "export" }   — export all data as JSON
 * DELETE /api/privacy              — delete all user data (right to erasure)
 */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const inventory = await getDataInventory(hashKey(apiKey));
  return NextResponse.json(inventory);
}

export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  try {
    const body = await req.json();
    if (body.action === "export") {
      const result = await exportUserData(hashKey(apiKey));
      return NextResponse.json(result);
    }
    return NextResponse.json({ error: "Unknown action. Use 'export'." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const result = await deleteUserData(hashKey(apiKey));
  return NextResponse.json(result);
}
