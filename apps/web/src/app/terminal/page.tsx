"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TerminalSquare } from "lucide-react";

export default function Terminal() {
  return (
    <div className="p-8 space-y-8 pb-20 h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <TerminalSquare className="w-8 h-8 text-primary" />
          META TERMINAL
        </h1>
        <p className="text-muted-foreground font-mono mt-1">SHELL_ACCESS: ROOT | NODE_ID: alpha-prime</p>
      </div>

      <Card className="flex-1 bg-black border-primary/30 shadow-[0_0_30px_rgba(var(--primary),0.1)] flex flex-col min-h-[400px]">
        <CardHeader className="border-b border-primary/20 py-3">
          <CardTitle className="text-xs font-mono text-primary flex items-center gap-2">
            root@zeaz-os:~# 
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 p-4 font-mono text-sm text-green-500/90 focus-within:outline-none" contentEditable>
          <p>Welcome to ZEAZ META OS.</p>
          <p>Type 'help' to see a list of commands.</p>
          <p className="mt-4 flex items-center gap-2 text-white">root@zeaz-os:~# <span className="w-2 h-4 bg-white animate-pulse" /></p>
        </CardContent>
      </Card>
    </div>
  );
}
