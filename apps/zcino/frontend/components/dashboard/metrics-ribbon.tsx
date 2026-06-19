"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useMetricsStream } from "@/hooks/use-metrics-stream";
import { formatCompact, formatLatency } from "@/lib/utils";

export function MetricsRibbon() {
  const { connected, metrics, mode } = useMetricsStream();
  const items = [
    { label: "Throughput", value: `${formatCompact(metrics.tps)} TPS` },
    { label: "Finality", value: formatLatency(metrics.finalityMs) },
    { label: "Validators", value: metrics.activeValidators.toString() },
    { label: "Tasks/min", value: formatCompact(metrics.tasksPerMinute) },
    { label: "WS peers", value: metrics.wsPeers.toString() },
  ];

  return (
    <Card className="p-4">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">Live metrics</p>
          <p className="text-sm text-muted">WebSocket first, SSE fallback, no polling.</p>
        </div>
        <Badge tone={connected ? "green" : "amber"}>{connected ? "connected" : "reconnecting"} · {mode}</Badge>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <div key={item.label} className="rounded-2xl bg-muted/45 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-muted">{item.label}</p>
            <p className="mt-2 text-2xl font-black">{item.value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
