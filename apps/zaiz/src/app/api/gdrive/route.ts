import { NextRequest, NextResponse } from "next/server";
import { listDriveFiles, searchDriveFiles, readDriveFile, getDriveStatus } from "@/lib/gdrive";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/gdrive — status + list files (?q=search) */
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");
  const readId = url.searchParams.get("read");

  if (readId) {
    const result = await readDriveFile(readId);
    return NextResponse.json(result);
  }
  if (q) {
    const result = await searchDriveFiles(q);
    return NextResponse.json(result);
  }
  const result = await listDriveFiles();
  return NextResponse.json({ ...result, status: getDriveStatus() });
}
