"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, Activity, HeartPulse } from "lucide-react";

export default function Healing() {
  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Stethoscope className="w-8 h-8 text-primary" />
          SELF-HEALING CENTER
        </h1>
        <p className="text-muted-foreground font-mono mt-1">AUTO_RECOVERY: ENABLED | 0 INCIDENTS</p>
      </div>

      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><HeartPulse className="text-primary animate-pulse" /> System Vitals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary w-[98%]" />
            </div>
            <p className="text-xs text-muted-foreground font-mono">Infrastructure Health Score: 98%</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
