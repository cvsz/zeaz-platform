"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, Lock, EyeOff } from "lucide-react";

export default function Vault() {
  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Key className="w-8 h-8 text-primary" />
          SECRETS VAULT
        </h1>
        <p className="text-muted-foreground font-mono mt-1">VAULT_STATUS: SEALED | KMS_ACTIVE</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Production Secrets</CardTitle>
            <Lock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent><div className="text-2xl font-bold">142</div><p className="text-xs text-muted-foreground mt-1">Encrypted at rest</p></CardContent>
        </Card>
      </div>
    </div>
  );
}
