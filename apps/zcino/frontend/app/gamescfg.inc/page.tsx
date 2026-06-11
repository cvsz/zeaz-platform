'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GamescfgIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Games</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Games Configuration
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Game provider API settings.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Provider Configurations</CardTitle><CardDescription>Manage game provider API settings.</CardDescription></CardHeader>
      <div className="space-y-3">{["NetEnt","Play'n GO","Evolution Gaming","Pragmatic Play","Microgaming"].map((p,i)=>(<div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><div><span className="font-bold">{p}</span><p className="text-xs text-muted">{["api.netent.com","api.playngo.com","api.evolution.com","api.pragmaticplay.com","api.microgaming.com"][i]}</p></div><Badge tone={i<4?"green":"amber"}>{i<4?"Connected":"Maintenance"}</Badge></div>))}</div></Card>
      </div>
    </div>
  );
}
