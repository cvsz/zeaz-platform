"use client";

import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/app/providers/auth-provider";

export function AuthPanel() {
  const { loginWithOAuth, loginWithWallet, logout, user } = useAuth();

  return (
    <Card className="min-h-[17rem]">
      <CardHeader>
        <div>
          <CardTitle>Enterprise access</CardTitle>
          <CardDescription>OAuth SSO and wallet login for operators, validators, and governance delegates.</CardDescription>
        </div>
      </CardHeader>
      {user ? (
        <div className="space-y-4">
          <div className="rounded-2xl bg-muted/50 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-muted">Signed in</p>
            <p className="mt-2 text-xl font-black">{user.name}</p>
            <p className="text-sm text-muted">Method: {user.method.toUpperCase()}</p>
          </div>
          <Button variant="secondary" onClick={logout}>Sign out</Button>
        </div>
      ) : (
        <div className="grid gap-3">
          <Button onClick={() => loginWithOAuth("Okta")}>Continue with Okta</Button>
          <Button variant="secondary" onClick={() => loginWithOAuth("GitHub")}>Continue with GitHub</Button>
          <Button variant="secondary" onClick={() => void loginWithWallet()}>Connect wallet</Button>
        </div>
      )}
    </Card>
  );
}
