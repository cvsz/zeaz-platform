'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CasPermissionsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Permissions</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Permissions Management
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Manage role-based permissions and access controls for the casino backend.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Role Permissions</CardTitle><CardDescription>Configure what each role can access.</CardDescription></CardHeader><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Module</th><th className="pb-3 font-bold">Admin</th><th className="pb-3 font-bold">Manager</th><th className="pb-3 font-bold">Agent</th><th className="pb-3 font-bold">Support</th></tr></thead><tbody>{["Dashboard", "Users", "Games", "Bonuses", "Finance", "Reports", "Settings", "Backups"].map((mod, i) => (<tr key={i} className="border-b border-border/50"><td className="py-3 font-medium">{mod}</td><td className="py-3"><Badge tone="green">Full</Badge></td><td className="py-3"><Badge tone={(["green","green","green","green","green","amber","amber","amber"] as const)[i]}>{["Full","Full","Full","Full","Full","Read","Read","Read"][i]}</Badge></td><td className="py-3"><Badge tone={(["green","amber","amber","red","green","red","red","red"] as const)[i]}>{["Full","Read","Read","None","Read","None","None","None"][i]}</Badge></td><td className="py-3"><Badge tone={(["green","amber","red","red","red","red","red","red"] as const)[i]}>{["Read","Read","None","None","None","None","None","None"][i]}</Badge></td></tr>))}</tbody></table></div></Card>
    </div>
    </div>
  );
}
