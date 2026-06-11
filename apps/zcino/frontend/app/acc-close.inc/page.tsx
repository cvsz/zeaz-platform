'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccCloseIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Close</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Close Account
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Permanently close your account. This action cannot be undone.
        </p>
      </header>
      <div className="mx-auto max-w-2xl">
      <Card className="border-red-400/30">
        <CardHeader><CardTitle className="text-red-400">Danger Zone</CardTitle><CardDescription>Closing your account will permanently remove all your data, balances, and game history.</CardDescription></CardHeader>
        <div className="space-y-4">
          <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-200"><strong>What happens when you close your account:</strong><ul className="mt-2 list-disc pl-5 space-y-1"><li>All funds will be forfeited</li><li>Active bonuses will be cancelled</li><li>Game history will be archived</li><li>Username will become unavailable</li></ul></div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Type your password to confirm</label><input className="w-full rounded-xl border border-red-400/30 bg-card px-4 py-2.5 text-foreground focus:outline-none focus:ring-2 focus:ring-red-400" type="password" placeholder="••••••••" /></div>
          <div className="flex gap-3 pt-2"><Button variant="danger">Permanently Close Account</Button><Button variant="secondary">Keep Account Active</Button></div>
        </div>
      </Card>
    </div>
    </div>
  );
}
