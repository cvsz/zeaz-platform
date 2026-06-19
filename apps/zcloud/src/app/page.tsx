// apps/zcloud/src/app/page.tsx
'use client';
import React, { useEffect, useState } from 'react';

const GlassCard = ({ children, title }: { children: React.ReactNode, title: string }) => (
  <div className="bg-slate-900/50 backdrop-blur-md border border-slate-700/50 p-6 rounded-2xl shadow-xl">
    <h2 className="text-sm font-medium text-slate-400 mb-4 tracking-wider uppercase">{title}</h2>
    {children}
  </div>
);

export default function DashboardPage() {
  const [health, setHealth] = useState({ status: 'loading', agents: [] });

  useEffect(() => {
    fetch('/api/swarm/health')
      .then(res => res.json())
      .then(data => setHealth(data))
      .catch(err => {
        console.error('Failed to fetch swarm health:', err);
        setHealth({ status: 'error', agents: [] });
      });
  }, []);

  return (
    <div className="max-w-7xl mx-auto">
      <header className="mb-10">
        <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
          ZeaZ Platform Cockpit
        </h1>
        <p className="text-slate-400 mt-2">Centralized infrastructure & swarm management</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <GlassCard title="Platform Health">
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-slate-200">System Status</span>
              <span className={`px-2 py-1 rounded-md text-xs font-bold ${
                health.status === 'operational' ? 'bg-green-500/20 text-green-400' :
                health.status === 'loading' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {health.status.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-200">Swarm Runtime</span>
              <span className="text-blue-400 text-sm">
                {health.agents.length > 0 ? `Active (${health.agents.length} agents)` : 'Disconnected'}
              </span>
            </div>
          </div>
        </GlassCard>

        <GlassCard title="Emergency Ops">
          <button className="w-full py-3 bg-red-900/30 hover:bg-red-900/50 border border-red-700/50 text-red-400 rounded-xl transition duration-200 font-bold tracking-widest uppercase text-sm">
            Global Kill Switch
          </button>
        </GlassCard>

        <GlassCard title="Swarm Topology">
           <div className="h-24 flex items-center justify-center border-2 border-dashed border-slate-700 rounded-xl text-slate-500">
             {health.agents.length > 0 ? (
               <div className="flex gap-2">
                 {health.agents.map((a: string) => <div key={a} className="w-8 h-8 rounded-full bg-blue-500/20 animate-pulse" />)}
               </div>
             ) : '[No Active Agents]'}
           </div>
        </GlassCard>
      </div>
    </div>
  );
}
