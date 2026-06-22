import { NextRequest, NextResponse } from "next/server";
import { readPage, summarizeText } from "@/lib/web-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

/**
 * Research tools.
 *
 * POST /api/research { action: "read" | "summarize", url?, text?, query? }
 *
 * - "read"    → fetch + extract page content
 * - "summarize" → stream a GLM summary of the given text (or URL content)
 */
export async function POST(req: NextRequest) {
  let body: { action?: string; url?: string; text?: string; query?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const action = body.action;

  if (action === "read") {
    const url = typeof body.url === "string" ? body.url.trim() : "";
    if (!url) return NextResponse.json({ error: "`url` is required." }, { status: 400 });
    const result = await readPage(url);
    return NextResponse.json(result);
  }

  if (action === "summarize") {
    let text = typeof body.text === "string" ? body.text : "";
    const query = typeof body.query === "string" ? body.query : undefined;

    // If a URL is provided, read it first.
    if (!text && typeof body.url === "string" && body.url.trim()) {
      const page = await readPage(body.url.trim());
      if (page.ok) {
        text = page.text;
      } else {
        return NextResponse.json({ error: page.error ?? "Failed to read page." }, { status: 500 });
      }
    }

    if (!text.trim()) {
      return NextResponse.json({ error: "`text` or `url` is required." }, { status: 400 });
    }

    // Stream the summary as NDJSON.
    const encoder = new TextEncoder();
    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          for await (const delta of summarizeText(text, query)) {
            controller.enqueue(encoder.encode(JSON.stringify({ type: "delta", content: delta }) + "\n"));
          }
          controller.enqueue(encoder.encode(JSON.stringify({ type: "done" }) + "\n"));
        } catch (err) {
          controller.enqueue(
            encoder.encode(
              JSON.stringify({ type: "error", content: err instanceof Error ? err.message : "error" }) + "\n",
            ),
          );
        } finally {
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "application/x-ndjson; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  }

  return NextResponse.json({ error: "Unknown action. Use 'read' or 'summarize'." }, { status: 400 });
}
