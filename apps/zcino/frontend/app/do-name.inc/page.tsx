'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function DoNameIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Name</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Name Change
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Change your display name.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card><CardHeader><CardTitle>Change Display Name</CardTitle><CardDescription>Update your display name.</CardDescription></CardHeader><div className="space-y-4">
      <div><label className="mb-1 block text-sm font-bold text-foreground">Current Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground bg-muted-surface/50" defaultValue="Player_8472" disabled /></div>
      <div><label className="mb-1 block text-sm font-bold text-foreground">New Display Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Enter new display name" /></div>
      <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4 text-sm text-amber-200">Name changes are limited to once every 30 days.</div>
      <div className="flex gap-3 pt-2"><Button>Update Name</Button><Button variant="secondary">Cancel</Button></div>
      </div></Card>
      </div>
    </div>
  );
}
