import { NextRequest, NextResponse } from "next/server";
import { listEmails, searchEmails, readEmail, getGmailStatus } from "@/lib/gmail";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/gmail — status + list emails (?q=search) */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const readId = url.searchParams.get("read");

  if (readId) {
    const result = await readEmail(readId);
    return NextResponse.json(result);
  }
  if (q) {
    const result = await searchEmails(q);
    return NextResponse.json(result);
  }
  const result = await listEmails();
  return NextResponse.json({ ...result, status: getGmailStatus() });
}
