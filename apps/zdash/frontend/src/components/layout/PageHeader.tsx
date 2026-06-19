import type { ReactNode } from "react";
import { useT } from "../../hooks/useT";

type PageHeaderProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
};

export default function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  const { t } = useT();
  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="max-w-3xl">
        {eyebrow ? (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.35em] text-accent-cyan">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-2xl font-semibold tracking-tight text-text-primary md:text-[2rem]">
          {title}
        </h2>
        {subtitle ? <p className="mt-2 text-sm leading-6 text-text-dim">{subtitle}</p> : null}
      </div>
      {actions ? (
        <div className="flex flex-wrap items-center gap-2 rounded-card border border-border bg-panel/70 px-3 py-2">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
