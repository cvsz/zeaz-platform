import { NextRequest, NextResponse } from "next/server";
import { scanProject, getScanRules } from "@/lib/security-scanner";
import { validateRequest, extractApiKey } from "@/lib/api-keys";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

/** GET /api/security — list scan rules */
export async function GET() {
  return NextResponse.json({ rules: getScanRules() });
}

/** POST /api/security — run a full project scan */
export async function POST(req: NextRequest) {
  const auth = await validateRequest(extractApiKey(req));
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error ?? "Unauthorized" }, { status: auth.status });
  }
  const result = await scanProject();
  return NextResponse.json(result);
}
