"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Terminal } from "lucide-react";

export default function Observability() {
  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Activity className="w-8 h-8 text-primary" />
          OBSERVABILITY COMMAND
        </h1>
        <p className="text-muted-foreground font-mono mt-1">TELEMETRY_STREAM: CONNECTED</p>
      </div>
      
      <Card className="bg-black border-border font-mono">
        <CardHeader>
          <CardTitle className="text-xs text-muted-foreground flex items-center gap-2"><Terminal className="w-4 h-4"/> Live Logs</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] overflow-y-auto text-xs text-green-500/80 space-y-1">
          <p>[SYS] 2026-05-29 08:50:12 - Info: Telemetry ingestion rate stable at 45k/s</p>
          <p>[SYS] 2026-05-29 08:50:13 - Warn: Minor latency spike in cluster-us-east</p>
          <p>[SYS] 2026-05-29 08:50:14 - Info: Auto-scaler scaling up node group alpha</p>
          <p className="animate-pulse">_</p>
        </CardContent>
      </Card>
    </div>
  );
}
