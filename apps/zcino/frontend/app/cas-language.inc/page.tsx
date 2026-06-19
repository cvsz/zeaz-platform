'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasLanguageIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Language</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Language Settings
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Manage supported languages and localization.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader><CardTitle>Active Languages</CardTitle><CardDescription>Languages currently available.</CardDescription></CardHeader>
        <div className="space-y-2">{["English", "Spanish", "French", "German", "Portuguese", "Japanese"].map((lang, i) => (<div key={i} className="flex items-center justify-between rounded-xl border border-border bg-card/60 px-4 py-3"><span className="font-bold">{lang}</span><Badge tone="green">Active</Badge></div>))}</div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Add Language</CardTitle><CardDescription>Install a new language pack.</CardDescription></CardHeader>
        <div className="space-y-3"><select className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-cyan-400"><option>Italian</option><option>Dutch</option><option>Russian</option><option>Korean</option><option>Chinese</option></select><Button>Install Language</Button></div>
      </Card>
    </div>
    </div>
  );
}
