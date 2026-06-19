"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useTaskStream } from "@/hooks/use-task-stream";

export function TaskStreamPanel() {
  const { connected, source, tasks } = useTaskStream();

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle>Live task stream</CardTitle>
          <CardDescription>Kafka/NATS compatible event feed for agent execution and settlement tasks.</CardDescription>
        </div>
        <Badge tone={connected ? "green" : "amber"}>{source.toUpperCase()} · {connected ? "live" : "fallback"}</Badge>
      </CardHeader>
      <div className="space-y-3">
        {tasks.map((task) => (
          <div key={task.id} className="grid gap-3 rounded-2xl bg-muted/45 p-3 text-sm md:grid-cols-[1fr_8rem_6rem] md:items-center">
            <div>
              <p className="font-black">{task.id}</p>
              <p className="text-muted">{task.agent} · {task.payload}</p>
            </div>
            <p className="text-muted">{task.latencyMs}ms</p>
            <Badge tone={task.status === "complete" ? "green" : task.status === "failed" ? "red" : "amber"}>{task.status}</Badge>
          </div>
        ))}
      </div>
    </Card>
  );
}
