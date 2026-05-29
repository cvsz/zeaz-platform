'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Zap, Activity } from 'lucide-react';

export default function SwarmRuntimePage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [topology, setTopology] = useState<any>({ nodes: [], edges: [] });

  useEffect(() => {
    const fetchStatus = async () => {
      const res = await fetch('http://localhost:8000/api/runtime/swarm/agents');
      const data = await res.getJson();
      setAgents(data);
    };

    const ws = new WebSocket('ws://localhost:8000/api/runtime/swarm/ws/swarm');
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'SWARM_UPDATE') {
        setTopology(data.data);
      }
    };

    fetchStatus();
    return () => ws.close();
  }, []);

  return (
    <div className="p-8 space-y-8 bg-slate-950 min-h-screen text-slate-100">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Autonomous Agent Swarm</h1>
          <p className="text-slate-400 mt-2">Distributed cooperative AI orchestration mesh.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center gap-3">
            <Users className="text-blue-500" />
            <div>
              <div className="text-xs text-slate-500 uppercase font-bold">Active Agents</div>
              <div className="text-sm font-mono text-blue-400">{agents.length}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800 h-[600px] relative">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Zap className="text-yellow-500" size={20} />
              Swarm Topology
            </h2>
            <div className="absolute inset-0 flex items-center justify-center opacity-20 pointer-events-none">
                <Users size={300} />
            </div>
            {/* Swarm Graph Visualization would go here */}
            <div className="grid grid-cols-4 gap-4">
                {topology.nodes.map((node: any) => (
                    <motion.div 
                        key={node.id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className={`p-4 rounded-xl border ${node.type === 'ORCHESTRATOR' ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 bg-slate-800'}`}
                    >
                        <div className="text-xs font-mono text-slate-500">{node.type}</div>
                        <div className="text-sm font-bold truncate">{node.id}</div>
                        <div className="mt-2 text-[10px] uppercase font-bold text-green-500">Active</div>
                    </motion.div>
                ))}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Shield className="text-green-500" size={20} />
              Capability Mesh
            </h2>
            <div className="space-y-2">
                <div className="text-xs bg-slate-800 p-2 rounded border border-slate-700 font-mono">MONITOR_HEALTH</div>
                <div className="text-xs bg-slate-800 p-2 rounded border border-slate-700 font-mono">AUDIT_ACTION</div>
                <div className="text-xs bg-slate-800 p-2 rounded border border-slate-700 font-mono">HEAL_RUNTIME</div>
                <div className="text-xs bg-slate-800 p-2 rounded border border-slate-700 font-mono">REASONING</div>
            </div>
          </section>

          <section className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Activity className="text-purple-500" size={20} />
              Task Marketplace
            </h2>
            <div className="text-center py-8 text-slate-500 italic">
                Scanning marketplace for open tasks...
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
