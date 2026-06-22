import { db } from "./db";

/**
 * Task manager — server-only.
 *
 * Persistent task tracking per user (keyed by API key hash).
 * Tasks have: title, description, status (todo/in-progress/done/blocked),
 * priority (low/medium/high/urgent), tags, and due dates.
 */

export type TaskStatus = "todo" | "in-progress" | "done" | "blocked";
export type TaskPriority = "low" | "medium" | "high" | "urgent";

export interface Task {
  id: string;
  keyHash: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string;
  dueAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface TaskPublic {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  tags: string[];
  dueAt: string | null;
  createdAt: string;
  updatedAt: string;
}

function toPublic(row: Task): TaskPublic {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    status: row.status as TaskStatus,
    priority: row.priority as TaskPriority,
    tags: row.tags ? row.tags.split(",").filter(Boolean) : [],
    dueAt: row.dueAt ? row.dueAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

// We'll use a simple JSON file-based store for tasks since we don't want to
// add another Prisma model mid-session. Store in .dev/tasks.json keyed by keyHash.
import { readFile, writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomBytes } from "crypto";

const TASKS_PATH = path.join(process.cwd(), ".dev", "tasks.json");

interface TaskStore {
  [keyHash: string]: Task[];
}

async function loadStore(): Promise<TaskStore> {
  try {
    const raw = await readFile(TASKS_PATH, "utf-8");
    return JSON.parse(raw) as TaskStore;
  } catch {
    return {};
  }
}

async function saveStore(store: TaskStore): Promise<void> {
  await mkdir(path.dirname(TASKS_PATH), { recursive: true });
  await writeFile(TASKS_PATH, JSON.stringify(store, null, 2), "utf-8");
}

function genId(): string {
  return `task-${randomBytes(6).toString("hex")}`;
}

/** List all tasks for a user. */
export async function listTasks(keyHash: string): Promise<TaskPublic[]> {
  const store = await loadStore();
  const tasks = store[keyHash] ?? [];
  return tasks
    .sort((a, b) => {
      const order: Record<TaskStatus, number> = { "in-progress": 0, "todo": 1, "blocked": 2, "done": 3 };
      return order[a.status as TaskStatus] - order[b.status as TaskStatus];
    })
    .map(toPublic);
}

/** Create a new task. */
export async function createTask(opts: {
  keyHash: string;
  title: string;
  description?: string;
  priority?: TaskPriority;
  tags?: string[];
  dueAt?: Date | null;
}): Promise<TaskPublic> {
  const store = await loadStore();
  if (!store[opts.keyHash]) store[opts.keyHash] = [];

  const now = new Date();
  const task: Task = {
    id: genId(),
    keyHash: opts.keyHash,
    title: opts.title.slice(0, 200),
    description: (opts.description ?? "").slice(0, 2000),
    status: "todo",
    priority: opts.priority ?? "medium",
    tags: (opts.tags ?? []).join(","),
    dueAt: opts.dueAt ?? null,
    createdAt: now,
    updatedAt: now,
  };

  store[opts.keyHash].push(task);
  await saveStore(store);
  return toPublic(task);
}

/** Update a task. */
export async function updateTask(
  keyHash: string,
  taskId: string,
  patch: { title?: string; description?: string; status?: TaskStatus; priority?: TaskPriority; tags?: string[]; dueAt?: Date | null },
): Promise<TaskPublic | null> {
  const store = await loadStore();
  const tasks = store[keyHash];
  if (!tasks) return null;

  const task = tasks.find((t) => t.id === taskId);
  if (!task) return null;

  if (patch.title !== undefined) task.title = patch.title.slice(0, 200);
  if (patch.description !== undefined) task.description = patch.description.slice(0, 2000);
  if (patch.status !== undefined) task.status = patch.status;
  if (patch.priority !== undefined) task.priority = patch.priority;
  if (patch.tags !== undefined) task.tags = patch.tags.join(",");
  if (patch.dueAt !== undefined) task.dueAt = patch.dueAt;
  task.updatedAt = new Date();

  await saveStore(store);
  return toPublic(task);
}

/** Delete a task. */
export async function deleteTask(keyHash: string, taskId: string): Promise<boolean> {
  const store = await loadStore();
  const tasks = store[keyHash];
  if (!tasks) return false;

  const idx = tasks.findIndex((t) => t.id === taskId);
  if (idx === -1) return false;

  tasks.splice(idx, 1);
  await saveStore(store);
  return true;
}

/** Get task stats for a user. */
export async function getTaskStats(keyHash: string): Promise<{
  total: number;
  todo: number;
  inProgress: number;
  done: number;
  blocked: number;
}> {
  const store = await loadStore();
  const tasks = store[keyHash] ?? [];
  return {
    total: tasks.length,
    todo: tasks.filter((t) => t.status === "todo").length,
    inProgress: tasks.filter((t) => t.status === "in-progress").length,
    done: tasks.filter((t) => t.status === "done").length,
    blocked: tasks.filter((t) => t.status === "blocked").length,
  };
}
