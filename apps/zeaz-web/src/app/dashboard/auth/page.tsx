"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, User, LogOut, LogIn } from "lucide-react";

export default function AuthPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="p-4 md:p-8 space-y-8 pb-20">
        <h1 className="text-3xl font-bold tracking-tight text-white">Loading...</h1>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <ShieldCheck className="w-8 h-8 text-primary" />
          AUTH CONTROL CENTER
        </h1>
        <p className="text-muted-foreground font-mono mt-1">
          IAM_STATUS: {session ? "AUTHENTICATED" : "UNAUTHENTICATED"}
        </p>
      </div>

      {session ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Signed In As</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold">{session.user?.name}</div>
                <div className="text-sm text-muted-foreground">{session.user?.email}</div>
              </CardContent>
            </Card>
          </div>

          <button
            onClick={() => signOut()}
            className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Sign in to access authenticated features and manage your account.
              </p>
              <button
                onClick={() => signIn("google")}
                className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-2 text-sm text-white hover:bg-zinc-800"
              >
                <LogIn className="h-4 w-4" />
                Sign In with Google
              </button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
