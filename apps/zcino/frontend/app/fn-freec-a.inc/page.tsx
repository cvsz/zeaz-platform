'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnFreecAIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Add</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Add Free Chips
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Create a new free chips promotion for players.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card><CardHeader><CardTitle>New Free Chips</CardTitle><CardDescription>Configure a free chips promotion.</CardDescription></CardHeader><div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-bold text-foreground">Chip Value ($)</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="10" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">Quantity</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="100" /></div></div>
        <div><label className="mb-1 block text-sm font-bold text-foreground">Eligible Games</label><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>All Slots</option><option>All Games</option><option>Specific Games</option></select></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-bold text-foreground">Wagering Requirement</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="35" defaultValue="35" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">Expires (days)</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" placeholder="7" defaultValue="7" /></div></div>
        <div className="flex gap-3 pt-2"><Button>Create Free Chips</Button></div>
      </div></Card>
    </div>
    </div>
  );
}
