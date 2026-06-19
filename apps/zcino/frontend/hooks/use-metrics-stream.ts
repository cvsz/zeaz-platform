"use client";

import { useEffect, useState } from "react";

import { createMetricSnapshot } from "@/lib/dashboard-data";

export type MetricSnapshot = ReturnType<typeof createMetricSnapshot>;

type ConnectionMode = "websocket" | "sse" | "local";

export function useMetricsStream() {
  const [metrics, setMetrics] = useState<MetricSnapshot>(() => createMetricSnapshot(0));
  const [mode, setMode] = useState<ConnectionMode>("local");
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const wsUrl = process.env.NEXT_PUBLIC_METRICS_WS_URL;
    let cleanup: () => void = () => undefined;

    if (wsUrl) {
      const socket = new WebSocket(wsUrl);
      socket.addEventListener("open", () => {
        setMode("websocket");
        setConnected(true);
      });
      socket.addEventListener("message", (event) => {
        setMetrics(JSON.parse(event.data) as MetricSnapshot);
      });
      socket.addEventListener("close", () => setConnected(false));
      socket.addEventListener("error", () => setConnected(false));
      cleanup = () => socket.close();
    } else if (typeof EventSource !== "undefined") {
      const source = new EventSource("/api/metrics/stream");
      source.addEventListener("open", () => {
        setMode("sse");
        setConnected(true);
      });
      source.addEventListener("message", (event) => {
        setMetrics(JSON.parse(event.data) as MetricSnapshot);
      });
      source.addEventListener("error", () => setConnected(false));
      cleanup = () => source.close();
    }

    return cleanup;
  }, []);

  return { connected, metrics, mode };
}
