"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Server, Activity, ArrowRight, ShieldCheck, AlertTriangle } from "lucide-react";

type ServiceInfo = {
  id: string;
  name: string;
  status: string;
  image: string;
  state: any;
};

export default function Services() {
  const [services, setServices] = useState<ServiceInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/runtime/cloudflare/health"); // Need the right API gateway prefix or relative route. Wait, API is mapped to /api/runtime/cloudflare. But runtime is /api/runtime. We might need absolute URL or mapped proxy.
        // Let's assume we can fetch /api/runtime/services if the UI proxy is setup or the API gateway is used.
        // Wait, the Next.js app doesn't have a proxy setup to 8088 except for /api/runtime/cloudflare possibly, or we just fetch from api.zeaz.dev.
        // I will write this cautiously.
        const apiUrl = window.location.hostname.includes("zcfdash") 
          ? `https://api-zcfdash.zeaz.dev/api/runtime/services` 
          : `/api/runtime/services`;
        const r = await fetch(apiUrl);
        if (r.ok) {
          const data = await r.json();
          setServices(Array.isArray(data) ? data : []);
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
          <Server className="w-8 h-8 text-primary" />
          SERVICE MESH PANEL
        </h1>
        <p className="text-muted-foreground font-mono mt-1">
          MESH_ROUTING: {loading ? "LOADING" : "ACTIVE"} | {services.length} MICROSERVICES
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((svc) => (
          <Card key={svc.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{svc.name}</CardTitle>
              {svc.status.includes("Up") ? <ShieldCheck className="h-4 w-4 text-green-500" /> : <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-xl font-bold font-mono truncate">{svc.image}</div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                Status <ArrowRight className="w-3 h-3"/> {svc.status}
              </p>
            </CardContent>
          </Card>
        ))}
        {!loading && services.length === 0 && (
          <p className="text-muted-foreground col-span-3">No services running or API unavailable.</p>
        )}
      </div>
    </div>
  );
}
