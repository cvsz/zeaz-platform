'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasPaymentsEIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Payment</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Payment Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Edit payment gateway configurations and provider settings.
        </p>
      </header>
      <div className="max-w-2xl space-y-4">
      <Card><CardHeader><CardTitle>Edit Payment Method</CardTitle><CardDescription>Configure payment provider settings.</CardDescription></CardHeader><div className="space-y-3"><div><label className="mb-1 block text-sm font-bold text-foreground">Provider Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" defaultValue="Stripe" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">API Key</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="password" defaultValue="sk_live_......" /></div><div><label className="mb-1 block text-sm font-bold text-foreground">Transaction Fee (%)</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" type="number" defaultValue="2.9" /></div><div className="flex gap-3 pt-2"><Button>Save Changes</Button><Button variant="secondary">Test Connection</Button></div></div></Card>
    </div>
    </div>
  );
}
