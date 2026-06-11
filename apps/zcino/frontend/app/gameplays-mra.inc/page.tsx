'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GameplaysMraIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">MRA</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          MRA Game Plays
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Multi-Round Arena auto sessions.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>MRA Auto Sessions</CardTitle><CardDescription>Automated Multi-Round Arena game plays.</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle>Session History</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Session</th><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Rounds</th><th className="pb-3 font-bold">Total Bet</th><th className="pb-3 font-bold">Total Win</th><th className="pb-3 font-bold">Status</th></tr></thead><tbody>{[{s:"#MRA-001",p:"john***",r:12,b:60,w:85,st:"Completed"},{s:"#MRA-002",p:"alice***",r:8,b:40,w:0,st:"Completed"},{s:"#MRA-003",p:"bob***",r:20,b:200,w:350,st:"Completed"},{s:"#MRA-004",p:"eve***",r:5,b:25,w:25,st:"Active"}].map((s,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 font-mono text-xs">{s.s}</td><td className="py-3">{s.p}</td><td className="py-3">{s.r}</td><td className="py-3">{"$"}{s.b}</td><td className="py-3">{"$"}{s.w}</td><td className="py-3"><Badge tone={s.st==="Completed"?"green":"amber"}>{s.st}</Badge></td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
