"use client";

import {
  ShieldCheck,
  Wrench,
  FlaskConical,
  BookOpen,
  Lock,
  Gauge,
  GitCommitHorizontal,
  Network,
  ArrowLeftRight,
  AlignLeft,
  FolderTree,
  GitBranch,
  Package,
  Regex,
  Globe,
  Braces,
  Database,
  Container,
  DraftingCompass,
  Bug,
  Layers,
  type LucideIcon,
} from "lucide-react";

/**
 * Resolves a lucide icon by name. Used by the skills/modules/agents registries
 * so their metadata (client-safe data files) can stay icon-agnostic.
 */
const ICONS: Record<string, LucideIcon> = {
  ShieldCheck,
  Wrench,
  FlaskConical,
  BookOpen,
  Lock,
  Gauge,
  GitCommitHorizontal,
  Network,
  ArrowLeftRight,
  AlignLeft,
  FolderTree,
  GitBranch,
  Package,
  Regex,
  Globe,
  Braces,
  Database,
  Container,
  DraftingCompass,
  Bug,
  Layers,
};

export function Icon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Cmp = ICONS[name] ?? ShieldCheck;
  return <Cmp className={className} />;
}
