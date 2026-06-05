import { createTaskEvent } from "@/lib/dashboard-data";

export const dynamic = "force-dynamic";

export function GET() {
  let sequence = 0;
  let timer: ReturnType<typeof setInterval> | undefined;
  const encoder = new TextEncoder();
  const source = process.env.TASK_STREAM_SOURCE === "kafka" ? "kafka" : "nats";

  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ ...createTaskEvent(sequence), source })}\n\n`));
        sequence += 1;
      };
      send();
      timer = setInterval(send, 2200);
    },
    cancel() {
      if (timer) clearInterval(timer);
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}
