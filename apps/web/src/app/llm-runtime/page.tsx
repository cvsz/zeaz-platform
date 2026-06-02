'use client';

function safePct(used?: number, quota?: number): number {
  if (!quota || quota <= 0) return 0;
  return Math.min(100, Math.max(0, ((used ?? 0) / quota) * 100));
}


import React, { useEffect, useState } from 'react';
import { TopologyGraph } from '@/components/TopologyGraph';
import { motion } from 'framer-motion';
import { Activity, Zap, Shield, Database } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

type ProviderStatus = {
  state: string;
};

type RuntimeMetrics = {
  global_usage?: number;
  global_quota?: number;
  provider_usage?: Record<string, number>;
};

export default function LLMRuntimePage() {
  const [topology, setTopology] = useState<Record<string, ProviderStatus>>({});
  const [metrics, setMetrics] = useState<RuntimeMetrics | null>(null);

  useEffect(() => {
    const apiUrl = new URL(getApiUrl('/api/runtime/llm/ws/topology'));
    apiUrl.protocol = apiUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(apiUrl.toString());
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'FULL') {
        setTopology(data.data.topology);
        setMetrics(data.data.metrics);
      } else if (data.type === 'DELTA') {
        setTopology(prev => ({ ...prev, ...data.data.topology }));
        if (data.data.metrics) {
          setMetrics((prev) => ({ ...(prev ?? {}), ...data.data.metrics }));
        }
      }
    };

  return () => ws.close();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Cognitive Fabric Runtime</h1>
          <p className="text-slate-400 mt-2">AI-native distributed control plane monitoring.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Activity className="text-blue-500" />
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold">System Status</div>
              <div className="text-sm font-mono text-green-400">OPERATIONAL</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Zap className="text-yellow-500" size={20} />
                Routing Topology
              </h2>
              <span className="text-xs font-mono bg-slate-800 px-2 py-1 rounded text-slate-400">REALTIME</span>
            </div>
            <TopologyGraph topology={topology} />
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Database className="text-purple-500" size={20} />
              Token Burn Metrics
            </h2>
            <div className="space-y-4">
              <div className="bg-slate-800 p-4 rounded-xl">
                <div className="text-xs text-slate-400 mb-1 uppercase">Global Usage</div>
                <div className="text-2xl font-mono font-bold text-blue-400">
                  {metrics?.global_usage?.toLocaleString() || 0}
                  <span className="text-slate-600 text-sm ml-2">/ {metrics?.global_quota?.toLocaleString()}</span>
                </div>
                <div className="w-full bg-slate-700 h-1.5 mt-3 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${safePct(metrics?.global_usage, metrics?.global_quota)}%` }}
                    className="h-full bg-blue-500"
                  />
                </div>
              </div>

              {metrics?.provider_usage && Object.entries(metrics.provider_usage).map(([id, usage]) => (
                <div key={id} className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-slate-300">{id}</span>
                    <span className="text-xs font-mono text-slate-500">{usage.toLocaleString()} tokens</span>
                  </div>
                  <div className="w-full bg-slate-700 h-1 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-500" style={{ width: '45%' }} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="text-green-500" size={20} />
              Provider Health Quorum
            </h2>
            <div className="space-y-3">
              {Object.entries(topology).map(([id, status]) => (
                <div key={id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${status.state === 'HEALTHY' ? 'bg-green-500 shadow-[0_0_8px_#22c55e]' : 'bg-red-500 shadow-[0_0_8px_#ef4444]'}`} />
                    <span className="text-sm font-mono">{id}</span>
                  </div>
                  <span className="text-[10px] font-bold bg-slate-700 px-2 py-0.5 rounded text-slate-300 uppercase">
                    {status.state}
                  </span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
