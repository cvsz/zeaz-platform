'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function CmsListIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">CMS</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          CMS Content List
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Browse, search, and manage all published CMS content.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Content Manager</CardTitle><div className="flex gap-2"><Button>+ New</Button></div></CardHeader><div className="flex gap-2"><input className="flex-1 rounded-xl border border-border bg-card px-4 py-2 text-sm text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Search content..." /></div></Card>
      <Card><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Title</th><th className="pb-3 font-bold">Slug</th><th className="pb-3 font-bold">Status</th><th className="pb-3 font-bold">Updated</th><th className="pb-3 font-bold"></th></tr></thead><tbody>{[{title:"Welcome to Zcino",slug:"welcome",status:"Published",updated:"Jun 10"},{title:"Terms of Service",slug:"terms",status:"Published",updated:"Jun 08"},{title:"Privacy Policy",slug:"privacy",status:"Published",updated:"Jun 05"},{title:"Bonus Terms",slug:"bonus-terms",status:"Draft",updated:"Jun 01"},{title:"FAQ",slug:"faq",status:"Published",updated:"May 28"}].map((c,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3 font-medium">{c.title}</td><td className="py-3 text-muted">/{c.slug}</td><td className="py-3"><Badge tone={c.status==="Published"?"green":"amber"}>{c.status}</Badge></td><td className="py-3 text-muted">{c.updated}</td><td className="py-3"><Button variant="ghost">Edit</Button></td></tr>))}</tbody></table></Card>
    </div>
    </div>
  );
}
