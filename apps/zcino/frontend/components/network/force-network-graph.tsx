"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { NetworkEdge, NetworkNode } from "@/lib/dashboard-data";

type SimNode = NetworkNode & { x: number; y: number; vx: number; vy: number };

const roleColor: Record<NetworkNode["role"], string> = {
  agent: "#22d3ee",
  gateway: "#f59e0b",
  oracle: "#a78bfa",
  validator: "#34d399",
};

const laneColor: Record<NetworkEdge["lane"], string> = {
  consensus: "rgba(52, 211, 153, 0.72)",
  interop: "rgba(167, 139, 250, 0.62)",
  task: "rgba(34, 211, 238, 0.62)",
};

export function ForceNetworkGraph({ edges, nodes }: { edges: NetworkEdge[]; nodes: NetworkNode[] }) {
  const [selected, setSelected] = useState<NetworkNode | null>(nodes[0] ?? null);
  const [positions, setPositions] = useState<SimNode[]>([]);
  const frameRef = useRef<number | null>(null);

  const edgePairs = useMemo(() => edges.map((edge) => ({ ...edge })), [edges]);

  useEffect(() => {
    const width = 760;
    const height = 440;
    const seeded = nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / nodes.length;
      return { ...node, x: width / 2 + Math.cos(angle) * 170, y: height / 2 + Math.sin(angle) * 140, vx: 0, vy: 0 };
    });

    const tick = () => {
      const byId = new Map(seeded.map((node) => [node.id, node]));

      for (const a of seeded) {
        for (const b of seeded) {
          if (a.id === b.id) continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const distance = Math.max(24, Math.hypot(dx, dy));
          const force = 980 / (distance * distance);
          a.vx += (dx / distance) * force;
          a.vy += (dy / distance) * force;
        }
      }

      for (const edge of edgePairs) {
        const source = byId.get(edge.source);
        const target = byId.get(edge.target);
        if (!source || !target) continue;
        const dx = target.x - source.x;
        const dy = target.y - source.y;
        const distance = Math.max(1, Math.hypot(dx, dy));
        const desired = 132 - edge.weight * 4;
        const force = (distance - desired) * 0.0038;
        source.vx += dx * force;
        source.vy += dy * force;
        target.vx -= dx * force;
        target.vy -= dy * force;
      }

      for (const node of seeded) {
        node.vx += (width / 2 - node.x) * 0.002;
        node.vy += (height / 2 - node.y) * 0.002;
        node.vx *= 0.84;
        node.vy *= 0.84;
        node.x = Math.min(width - 44, Math.max(44, node.x + node.vx));
        node.y = Math.min(height - 44, Math.max(44, node.y + node.vy));
      }

      setPositions(seeded.map((node) => ({ ...node })));
      frameRef.current = window.requestAnimationFrame(tick);
    };

    tick();
    return () => {
      if (frameRef.current) window.cancelAnimationFrame(frameRef.current);
    };
  }, [edgePairs, nodes]);

  const byId = useMemo(() => new Map(positions.map((node) => [node.id, node])), [positions]);

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <div>
          <CardTitle>Force-directed network graph</CardTitle>
          <CardDescription>Live topology with weighted consensus, task, and interop edges.</CardDescription>
        </div>
        <div className="flex gap-2">
          <Badge tone="green">validators</Badge>
          <Badge tone="cyan">agents</Badge>
        </div>
      </CardHeader>
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <svg viewBox="0 0 760 440" className="min-h-[26rem] w-full rounded-3xl bg-slate-950/80">
          <defs>
            <filter id="nodeGlow"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
          </defs>
          {edgePairs.map((edge) => {
            const source = byId.get(edge.source);
            const target = byId.get(edge.target);
            if (!source || !target) return null;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x}
                x2={target.x}
                y1={source.y}
                y2={target.y}
                stroke={laneColor[edge.lane]}
                strokeLinecap="round"
                strokeWidth={Math.max(1.5, edge.weight / 2)}
              />
            );
          })}
          {positions.map((node) => (
            <g key={node.id} role="button" tabIndex={0} onClick={() => setSelected(node)}>
              <circle cx={node.x} cy={node.y} r={18 + node.stake / 65000} fill={roleColor[node.role]} opacity="0.92" filter="url(#nodeGlow)" />
              <text x={node.x} y={node.y + 38} textAnchor="middle" fill="#e2e8f0" fontSize="12" fontWeight="700">
                {node.label}
              </text>
            </g>
          ))}
        </svg>
        <aside className="rounded-3xl bg-muted/45 p-5">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">Selected node</p>
          <h3 className="mt-3 text-2xl font-black">{selected?.label}</h3>
          <div className="mt-5 grid gap-3 text-sm">
            <p><span className="text-muted">Role:</span> {selected?.role}</p>
            <p><span className="text-muted">Region:</span> {selected?.region}</p>
            <p><span className="text-muted">Stake:</span> {selected?.stake.toLocaleString()} ZAZ</p>
            <p><span className="text-muted">Health:</span> {selected?.health}%</p>
          </div>
        </aside>
      </div>
    </Card>
  );
}
