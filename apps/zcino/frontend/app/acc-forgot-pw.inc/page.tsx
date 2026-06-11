'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccForgotPwIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Forgot</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Forgot Password
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Enter your email address and we'll send you a password reset link.
        </p>
      </header>
      <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader><CardTitle>Reset Password</CardTitle><CardDescription>We'll send a recovery link to your registered email.</CardDescription></CardHeader>
        <div className="space-y-4">
          <div><label className="mb-1 block text-sm font-bold text-foreground">Email Address</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="email" placeholder="you@example.com" /></div>
          <div className="flex gap-3 pt-2"><Button>Send Reset Link</Button><Button variant="secondary">Back to Login</Button></div>
        </div>
      </Card>
    </div>
    </div>
  );
}
