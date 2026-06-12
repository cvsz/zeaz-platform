"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

export default function Services() {
  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Server className="w-8 h-8 text-primary" />
          SERVICE MESH PANEL
        </h1>
        <p className="text-muted-foreground font-mono mt-1">MESH_ROUTING: ACTIVE | 42 MICROSERVICES</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1,2,3,4,5,6].map(i => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Service_{i}</CardTitle>
              {i % 3 === 0 ? <AlertTriangle className="h-4 w-4 text-yellow-500" /> : <ShieldCheck className="h-4 w-4 text-green-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold font-mono">99.{9 - i}%</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Uptime <ArrowRight className="w-3 h-3"/> {i * 120}ms latency
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
