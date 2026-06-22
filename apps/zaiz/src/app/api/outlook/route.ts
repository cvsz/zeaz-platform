import { NextRequest, NextResponse } from "next/server";
import { listOutlookEmails, searchOutlook, readOutlookEmail, getOutlookStatus } from "@/lib/outlook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/outlook — status + list emails (?q=search) */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const readId = url.searchParams.get("read");

  if (readId) {
    const result = await readOutlookEmail(readId);
    return NextResponse.json(result);
  }
  if (q) {
    const result = await searchOutlook(q);
    return NextResponse.json(result);
  }
  const result = await listOutlookEmails();
  return NextResponse.json({ ...result, status: getOutlookStatus() });
}
