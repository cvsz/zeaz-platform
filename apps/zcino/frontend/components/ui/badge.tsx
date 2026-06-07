import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "@/lib/utils";

const toneClass = {
  cyan: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  green: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  amber: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  red: "border-red-400/30 bg-red-400/10 text-red-200",
  slate: "border-border bg-muted/50 text-muted",
};

export function Badge({
  children,
  className,
  tone = "slate",
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode; tone?: keyof typeof toneClass }) {
  return (
    <span className={cn("inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-bold", toneClass[tone], className)} {...props}>
      {children}
    </span>
  );
}
