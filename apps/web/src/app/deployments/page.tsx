"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, GitCommit, CheckCircle } from "lucide-react";

export default function Deployments() {
  return (
    <div className="p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Rocket className="w-8 h-8 text-primary" />
          DEPLOYMENT OPS
        </h1>
        <p className="text-muted-foreground font-mono mt-1">CI_CD: IDLE | LAST DEPLOY: 2m AGO</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1,2,3].map(i => (
            <div key={i} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-white/5">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-green-500/20 rounded-full"><CheckCircle className="w-4 h-4 text-green-500" /></div>
                <div>
                  <h4 className="font-medium">v1.0.{14-i}</h4>
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1"><GitCommit className="w-3 h-3"/> a{i}b{i*2}c{i*3}</p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{i * 15}m ago</div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
