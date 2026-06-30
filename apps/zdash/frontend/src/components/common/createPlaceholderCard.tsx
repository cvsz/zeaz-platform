import type { ComponentType, PropsWithChildren } from "react";

import SectionCard from "./SectionCard";

type PlaceholderCardProps = PropsWithChildren<{
  className?: string;
}>;

export function createPlaceholderCard(title: string): ComponentType<PlaceholderCardProps> {
  function PlaceholderCard({ children, className = "" }: PlaceholderCardProps) {
    return (
      <SectionCard title={title} className={className}>
        {children ?? <p className="text-sm text-slate-400">{title}</p>}
      </SectionCard>
    );
  }

  PlaceholderCard.displayName = title;
  return PlaceholderCard;
}
