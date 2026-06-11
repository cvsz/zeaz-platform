'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasBackupIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Database</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Database Backup
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Manage and download database backups for the casino platform.
        </p>
      </header>
      <div className="space-y-4">
      <Card>
        <CardHeader><CardTitle>Backup Management</CardTitle><CardDescription>Create and manage database backups.</CardDescription></CardHeader>
        <div className="flex flex-wrap gap-3"><Button>Create New Backup</Button><Button variant="secondary">Download Latest</Button><Button variant="secondary">Backup Schedule</Button></div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Recent Backups</CardTitle></CardHeader>
        <table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Size</th><th className="pb-3 font-bold">Type</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold"></th></tr></thead><tbody><tr className="border-b border-border/50"><td className="py-3">Jun 11, 02:00</td><td>2.4 GB</td><td>Full</td><td><Badge tone="green">Completed</Badge></td><td><Button variant="ghost">Download</Button></td></tr><tr className="border-b border-border/50"><td className="py-3">Jun 10, 02:00</td><td>2.3 GB</td><td>Full</td><td><Badge tone="green">Completed</Badge></td><td><Button variant="ghost">Download</Button></td></tr><tr className="border-b border-border/50"><td className="py-3">Jun 09, 02:00</td><td>2.3 GB</td><td>Full</td><td><Badge tone="green">Completed</Badge></td><td><Button variant="ghost">Download</Button></td></tr></tbody></table>
      </Card>
    </div>
    </div>
  );
}
