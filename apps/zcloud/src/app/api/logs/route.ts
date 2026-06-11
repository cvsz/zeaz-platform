import { NextResponse } from "next/server";
import { getChatLogs } from "@/data/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const limitParam = searchParams.get("limit");
  const limit = limitParam ? parseInt(limitParam, 10) : 50;

  try {
    const logs = await getChatLogs(limit);
    return NextResponse.json({ logs });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("GET /api/logs failed:", errorMessage);
    return NextResponse.json({ error: errorMessage || "Failed to retrieve logs" }, { status: 500 });
  }
}
