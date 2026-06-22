"use client";

import { useState, type ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  language: string;
  value: string;
  className?: string;
}

/**
 * A fenced code block with a language label + copy button.
 * Professional dark code surface with gradient border and refined chrome.
 */
export function CodeBlock({ language, value, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable */
    }
  };

  const lang = (language || "text").toLowerCase();

  return (
    <div
      className={cn(
        "group grad-border relative my-3 overflow-hidden rounded-xl bg-[#080b0a] shadow-lg shadow-black/30",
        className,
      )}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-emerald-500/[0.08] bg-gradient-to-r from-emerald-500/[0.06] to-transparent px-3.5 py-2">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400/40" />
          <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.12em] text-emerald-400/80">
            {lang}
          </span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10.5px] transition-all duration-200",
            copied
              ? "bg-emerald-500/15 text-emerald-300"
              : "text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-300",
          )}
          aria-label="Copy code"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3" /> copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" /> copy
            </>
          )}
        </button>
      </div>
      {/* Code surface */}
      <div className="overflow-x-auto terminal-scroll">
        <SyntaxHighlighter
          language={lang}
          style={oneDark}
          customStyle={{
            margin: 0,
            background: "transparent",
            padding: "16px 18px",
            fontSize: "12.5px",
            lineHeight: "1.65",
          }}
          codeTagProps={{
            style: {
              fontFamily:
                "var(--font-geist-mono), ui-monospace, SFMono-Regular, Menlo, monospace",
            },
          }}
          wrapLongLines={false}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

/** Inline code span. */
export function InlineCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-md border border-emerald-500/15 bg-emerald-500/[0.08] px-1.5 py-0.5 font-mono text-[0.82em] text-emerald-300">
      {children}
    </code>
  );
}
