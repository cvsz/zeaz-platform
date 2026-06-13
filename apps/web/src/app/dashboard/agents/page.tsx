"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Activity, AlertTriangle } from "lucide-react";

type AgentInfo = {
  id: string;
  status: string;
  tasks_completed: number;
};

export default function Agents() {
  const [agents, setAgents] = useState<AgentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = window.location.hostname.includes("zcfdash") 
          ? `https://api-zcfdash.zeaz.dev/api/runtime/agents` 
          : `/api/runtime/agents`;
        const r = await fetch(apiUrl);
        if (r.ok) {
          const data = await r.json();
          setAgents(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          AI AGENT OPERATIONS
        </h1>
        <p className="text-muted-foreground font-mono mt-1">
          SWARM_STATUS: {loading ? "LOADING" : "COORDINATING"} | {agents.length} ACTIVE
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{agent.id}</CardTitle>
              {agent.status === "idle" ? <Activity className="h-4 w-4 text-primary animate-pulse" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono capitalize">{agent.status}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Tasks Completed: {agent.tasks_completed}
              </p>
            </CardContent>
          </Card>
        ))}
        {!loading && agents.length === 0 && (
          <p className="text-muted-foreground col-span-3">No agents active or API unavailable.</p>
        )}
      </div>
    </div>
  );
}
