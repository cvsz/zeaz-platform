"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock, InlineCode } from "./code-block";
import { cn } from "@/lib/utils";

interface MarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders assistant output as GitHub-flavored markdown.
 * Code fences become <CodeBlock> (with copy + syntax highlighting);
 * inline code becomes a styled <code> span.
 */
export function Markdown({ content, className }: MarkdownProps) {
  return (
    <div
      className={cn(
        "text-[13.5px] leading-relaxed text-zinc-200",
        "[&_p]:my-2 [&_p:first-child]:mt-0 [&_p:last-child]:mb-0",
        "[&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5",
        "[&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5",
        "[&_li]:my-1 [&_li_marker]:text-emerald-400/70",
        "[&_h1]:mt-3 [&_h1]:mb-2 [&_h1]:text-base [&_h1]:font-semibold [&_h1]:text-emerald-300",
        "[&_h2]:mt-3 [&_h2]:mb-2 [&_h2]:text-[15px] [&_h2]:font-semibold [&_h2]:text-emerald-300",
        "[&_h3]:mt-2 [&_h3]:mb-1 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-emerald-200/90",
        "[&_a]:text-sky-300 [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-sky-200",
        "[&_strong]:font-semibold [&_strong]:text-zinc-50",
        "[&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-emerald-500/40 [&_blockquote]:pl-3 [&_blockquote]:text-zinc-400",
        "[&_hr]:my-3 [&_hr]:border-emerald-500/15",
        "[&_table]:my-3 [&_table]:w-full [&_table]:border-collapse [&_table]:overflow-hidden [&_table]:rounded-md [&_table]:text-[13px]",
        "[&_th]:border [&_th]:border-emerald-500/15 [&_th]:bg-emerald-500/[0.06] [&_th]:px-2.5 [&_th]:py-1.5 [&_th]:text-left [&_th]:font-semibold [&_th]:text-emerald-200",
        "[&_td]:border [&_td]:border-emerald-500/10 [&_td]:px-2.5 [&_td]:py-1.5 [&_td]:text-zinc-300",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className: _cls, children, ...rest } = props;
            const text = String(children ?? "");
            // react-markdown v10: code inside <pre> is a block; otherwise inline.
            const isBlock = "pre" in rest && (rest as { pre?: unknown }).pre != null;
            // Heuristic: multi-line or starts with newline => block.
            const looksBlock = text.includes("\n");
            if (isBlock || looksBlock) {
              const match = /language-(\w+)/.exec(_cls || "");
              return (
                <CodeBlock
                  language={match ? match[1] : "text"}
                  value={text.replace(/\n$/, "")}
                />
              );
            }
            return <InlineCode>{children}</InlineCode>;
          },
          pre({ children }) {
            // Let the <code> renderer own the visual block; <pre> is just a passthrough.
            return <>{children}</>;
          },
          a({ href, children }) {
            return (
              <a href={href} target="_blank" rel="noopener noreferrer">
                {children}
              </a>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
