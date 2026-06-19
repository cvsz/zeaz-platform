'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function GameplaysSicboIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Sic</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Sic Bo Game Plays
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Sic Bo dice game sessions.
        </p>
      </header>
      <div className="space-y-4">
      <Card><CardHeader><CardTitle>Sic Bo Sessions</CardTitle><CardDescription>Sic Bo dice game play history.</CardDescription></CardHeader></Card>
      <Card><CardHeader><CardTitle>Play History</CardTitle></CardHeader><table className="w-full text-sm"><thead><tr className="border-b border-border text-left text-muted"><th className="pb-3 font-bold">Player</th><th className="pb-3 font-bold">Bet Type</th><th className="pb-3 font-bold">Bet</th><th className="pb-3 font-bold">Dice</th><th className="pb-3 font-bold">Payout</th></tr></thead><tbody>{[{p:"john***",t:"Big",b:10,d:"4-5-6",pay:"+$10"},{p:"alice***",t:"Triple",b:5,d:"2-2-2",pay:"+$75"},{p:"bob***",t:"Small",b:20,d:"1-2-3",pay:"+$20"},{p:"eve***",t:"Double",b:15,d:"4-4-5",pay:"+$25"}].map((s,i)=>(<tr key={i} className="border-b border-border/50"><td className="py-3">{s.p}</td><td className="py-3">{s.t}</td><td className="py-3">{"$"}{s.b}</td><td className="py-3 font-mono text-xs">{s.d}</td><td className={cn("py-3 font-bold",s.pay.startsWith("+")?"text-green-400":"text-red-400")}>{s.pay}</td></tr>))}</tbody></table></Card>
      </div>
    </div>
  );
}
