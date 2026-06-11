'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function FnBonusEIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Edit</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Edit Bonus
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Modify an existing bonus offer configuration.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card><CardHeader><CardTitle>Edit Bonus</CardTitle><CardDescription>Update bonus configuration.</CardDescription></CardHeader><div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-bold text-foreground">Bonus Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" defaultValue="Welcome Bonus" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">Type</label><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>Deposit Match</option><option>Free Spins</option><option>Cashback</option><option>Free Chip</option></select></div></div>
        <div className="grid gap-4 sm:grid-cols-2"><div><label className="mb-1 block text-sm font-bold text-foreground">Bonus Amount ($)</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue="100" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">Match Percentage (%)</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue="100" /></div></div>
        <div className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 rounded border-border bg-card text-cyan-400" defaultChecked /><label className="text-sm font-bold text-foreground">Active</label></div>
        <div className="flex gap-3 pt-2"><Button>Update Bonus</Button><Button variant="secondary">Delete</Button></div>
      </div></Card>
    </div>
    </div>
  );
}
