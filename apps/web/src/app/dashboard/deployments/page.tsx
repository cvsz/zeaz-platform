"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, GitCommit, CheckCircle, AlertTriangle } from "lucide-react";

type DeploymentInfo = {
  id: string;
  version: string;
  commit: string;
  status: string;
  timestamp: string;
};

export default function Deployments() {
  const [deployments, setDeployments] = useState<DeploymentInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const apiUrl = window.location.hostname.includes("zcfdash") 
          ? `https://api-zcfdash.zeaz.dev/api/runtime/deployments` 
          : `/api/runtime/deployments`;
        const r = await fetch(apiUrl);
        if (r.ok) {
          const data = await r.json();
          setDeployments(Array.isArray(data) ? data : []);
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
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Rocket className="w-8 h-8 text-primary" />
          DEPLOYMENT OPS
        </h1>
        <p className="text-muted-foreground font-mono mt-1">
          CI_CD: {loading ? "LOADING" : "ACTIVE"} | RECENT DEPLOYS
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Releases</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {deployments.map((dep) => (
            <div key={dep.id} className="flex items-center justify-between p-4 border border-border/50 rounded-lg bg-white/5">
              <div className="flex items-center gap-4">
                <div className={`p-2 rounded-full ${dep.status === "success" ? "bg-green-500/20" : "bg-yellow-500/20"}`}>
                  {dep.status === "success" ? <CheckCircle className="w-4 h-4 text-green-500" /> : <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                </div>
                <div>
                  <h4 className="font-medium">{dep.version}</h4>
                  <p className="text-xs text-muted-foreground font-mono flex items-center gap-1">
                    <GitCommit className="w-3 h-3"/> {dep.commit}
                  </p>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">{dep.timestamp}</div>
            </div>
          ))}
          {!loading && deployments.length === 0 && (
            <p className="text-muted-foreground p-4 text-center">No deployments found or API unavailable.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
