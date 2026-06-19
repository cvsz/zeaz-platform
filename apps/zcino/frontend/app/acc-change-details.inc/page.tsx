'use client';

import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function AccChangeDetailsIncPage() {
  return (
    <div className="mx-auto min-h-screen max-w-[90rem] px-4 py-8 sm:px-6 lg:px-8">
      <header className="mb-8 overflow-hidden rounded-[2rem] border border-border bg-card/80 p-6 shadow-card backdrop-blur-xl sm:p-8 lg:p-10">
        <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">Account</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-foreground sm:text-4xl lg:text-5xl">
          Account Details
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted sm:text-lg">
          Update your personal account information and contact preferences.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1fr_24rem]">
      <Card>
        <CardHeader><CardTitle>Personal Information</CardTitle><CardDescription>Update your name, email, and contact details.</CardDescription></CardHeader>
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="mb-1 block text-sm font-bold text-foreground">First Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="John" /></div>
            <div><label className="mb-1 block text-sm font-bold text-foreground">Last Name</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" placeholder="Doe" /></div>
          </div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Email Address</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="email" placeholder="john@example.com" /></div>
          <div><label className="mb-1 block text-sm font-bold text-foreground">Phone Number</label><input className="w-full rounded-xl border border-border bg-card px-4 py-2.5 text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-cyan-400" type="tel" placeholder="+1 (555) 000-0000" /></div>
          <div className="flex gap-3 pt-2"><Button>Save Changes</Button><Button variant="secondary">Cancel</Button></div>
        </div>
      </Card>
      <Card>
        <CardHeader><CardTitle>Current Details</CardTitle><CardDescription>Your account on file.</CardDescription></CardHeader>
        <dl className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Username</dt><dd className="font-bold">zcino_player</dd></div>
          <div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Email</dt><dd className="font-bold">player@zcino.io</dd></div>
          <div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Member Since</dt><dd className="font-bold">Jan 2024</dd></div>
          <div className="flex justify-between border-b border-border pb-2"><dt className="text-muted">Status</dt><dd><Badge tone="green">Verified</Badge></dd></div>
        </dl>
      </Card>
    </div>
    </div>
  );
}
