import { NextRequest, NextResponse } from "next/server";
import { hashKey } from "@/lib/billing";
import { listTasks, createTask, updateTask, deleteTask, getTaskStats, type TaskStatus, type TaskPriority } from "@/lib/tasks";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** GET /api/tasks — list tasks + stats (requires X-API-Key) */
export async function GET(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const keyHash = hashKey(apiKey);
  const [tasks, stats] = await Promise.all([listTasks(keyHash), getTaskStats(keyHash)]);
  return NextResponse.json({ tasks, stats });
}

/** POST /api/tasks — create task { title, description?, priority?, tags?, dueAt? } */
export async function POST(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  try {
    const body = await req.json();
    const task = await createTask({
      keyHash: hashKey(apiKey),
      title: String(body.title ?? ""),
      description: body.description ? String(body.description) : "",
      priority: body.priority as TaskPriority | undefined,
      tags: Array.isArray(body.tags) ? body.tags : [],
      dueAt: body.dueAt ? new Date(body.dueAt) : null,
    });
    return NextResponse.json(task, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

/** PATCH /api/tasks — update task { id, ...patch } */
export async function PATCH(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  try {
    const body = await req.json();
    const task = await updateTask(hashKey(apiKey), String(body.id), {
      title: body.title,
      description: body.description,
      status: body.status as TaskStatus | undefined,
      priority: body.priority as TaskPriority | undefined,
      tags: body.tags,
      dueAt: body.dueAt ? new Date(body.dueAt) : undefined,
    });
    if (!task) return NextResponse.json({ error: "Task not found" }, { status: 404 });
    return NextResponse.json(task);
  } catch {
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

/** DELETE /api/tasks?id=<id> — delete task */
export async function DELETE(req: NextRequest) {
  const apiKey = req.headers.get("x-api-key");
  if (!apiKey) return NextResponse.json({ error: "API key required" }, { status: 401 });
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "`id` required" }, { status: 400 });
  const ok = await deleteTask(hashKey(apiKey), id);
  return NextResponse.json({ ok });
}
