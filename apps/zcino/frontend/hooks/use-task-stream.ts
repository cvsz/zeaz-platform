"use client";

import { useEffect, useRef, useState } from "react";

import { createTaskEvent, seedTasks, type TaskEvent } from "@/lib/dashboard-data";

export function useTaskStream() {
  const [tasks, setTasks] = useState<TaskEvent[]>(seedTasks.slice(0, 8));
  const [connected, setConnected] = useState(false);
  const [source, setSource] = useState<"nats" | "kafka" | "sse">("sse");
  const fallbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/tasks/stream");
    eventSource.addEventListener("open", () => setConnected(true));
    eventSource.addEventListener("message", (event) => {
      const nextTask = JSON.parse(event.data) as TaskEvent & { source?: "nats" | "kafka" };
      setSource(nextTask.source ?? "sse");
      setTasks((current) => [nextTask, ...current].slice(0, 12));
    });
    eventSource.addEventListener("error", () => {
      setConnected(false);
      if (fallbackTimerRef.current) return;
      fallbackTimerRef.current = window.setInterval(() => {
        setTasks((current) => [createTaskEvent(Date.now()), ...current].slice(0, 12));
      }, 2500);
      eventSource.close();
    });

    return () => {
      eventSource.close();
      if (fallbackTimerRef.current) window.clearInterval(fallbackTimerRef.current);
    };
  }, []);

  return { connected, source, tasks };
}
