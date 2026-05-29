"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, Cpu, Zap, Activity } from "lucide-react";

export default function Agents() {
  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Bot className="w-8 h-8 text-primary" />
          AI AGENT OPERATIONS
        </h1>
        <p className="text-muted-foreground font-mono mt-1">SWARM_STATUS: COORDINATING | 3,492 ACTIVE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {['Analyzer', 'Crawler', 'Healer', 'Optimizer', 'Guard', 'Deployer'].map(agent => (
          <Card key={agent}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{agent} Swarm</CardTitle>
              <Activity className="h-4 w-4 text-primary animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">{Math.floor(Math.random() * 1000)} Agents</div>
              <p className="text-xs text-muted-foreground mt-1">
                CPU Usage: {Math.floor(Math.random() * 100)}%
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
