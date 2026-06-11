'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasGeneralIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">General</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          General Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Configure general casino platform settings and preferences.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-4">
        <Card><CardHeader><CardTitle>Casino Name</CardTitle><CardDescription>Set the public-facing casino brand name.</CardDescription></CardHeader><div className="space-y-3"><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400" defaultValue="Zcino Casino" /><Button>Save</Button></div></Card>
        <Card><CardHeader><CardTitle>Currency Settings</CardTitle><CardDescription>Configure supported currencies and display format.</CardDescription></CardHeader><div className="space-y-3"><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>USD - US Dollar</option><option>EUR - Euro</option><option>BTC - Bitcoin</option></select><Button>Save</Button></div></Card>
        <Card><CardHeader><CardTitle>Maintenance Mode</CardTitle><CardDescription>Enable or disable maintenance mode for the casino.</CardDescription></CardHeader><div className="flex items-center gap-3"><div className="h-6 w-11 rounded-full bg-muted-surface cursor-pointer relative"><div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-muted transition-all"></div></div><span className="text-sm text-muted">Casino is currently <strong className="text-green-400">Live</strong></span></div></Card>
      </div>
      <Card><CardHeader><CardTitle>Current Config</CardTitle></CardHeader><dl className="space-y-2 text-sm"><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Version</dt><dd className="font-bold">2.4.1</dd></div><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Theme</dt><dd className="font-bold">Dark</dd></div><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Default Language</dt><dd className="font-bold">English</dd></div><div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Time Zone</dt><dd className="font-bold">UTC-5</dd></div></dl></Card>
    </div>
    </div>
  );
}
