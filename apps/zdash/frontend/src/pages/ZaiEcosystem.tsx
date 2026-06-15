import React from "react";
import PageHeader from "../components/layout/PageHeader";
import GlassCard from "../components/ui/GlassCard";
import StatusBadge from "../components/ui/StatusBadge";
import { useT } from "../hooks/useT";
import { Workflow, Code, Zap, Layers, Server, Search, Database, Shield, Layout, PenTool, BarChart } from "lucide-react";

export default function ZaiEcosystem() {
  const { t } = useT();

  const codingPhases = [
    { title: "Planning & Architecture", icon: <Layers className="w-5 h-5" />, skills: ["zai-aif", "zai-v3", "zai-agentdb", "zai-vector"], desc: "Design DDD boundaries and system architecture." },
    { title: "Backend & Infrastructure", icon: <Server className="w-5 h-5" />, skills: ["zai-aif", "zai-v3", "zai-cloudflare"], desc: "Implement core services, Workers, and containerization." },
    { title: "Frontend & UI", icon: <Layout className="w-5 h-5" />, skills: ["zai-ui-ux", "zai-v3"], desc: "Develop UI components with motion and styling." },
    { title: "QA & Security", icon: <Shield className="w-5 h-5" />, skills: ["zai-aif", "zai-v3"], desc: "Automated Code Review and Security Overhaul." },
    { title: "Deploy & Optimize", icon: <Zap className="w-5 h-5" />, skills: ["zai-aif", "zai-v3"], desc: "CI/CD, Build Automation, and Performance tuning." },
  ];

  const generalPhases = [
    { title: "Research & Strategy", icon: <Search className="w-5 h-5" />, skills: ["zai-research", "zai-analytics", "zai-content", "zai-seo"], desc: "Market research and strategic planning." },
    { title: "Architecture & Build", icon: <Database className="w-5 h-5" />, skills: ["zai-v3", "zai-agentdb", "zai-cloudflare", "zai-ui-ux"], desc: "Core architecture and UI foundation." },
    { title: "Content & Media", icon: <PenTool className="w-5 h-5" />, skills: ["zai-prompt", "zai-copy", "zai-canva", "zai-video"], desc: "Creative asset generation and prompt engineering." },
    { title: "Distribution & Automation", icon: <BarChart className="w-5 h-5" />, skills: ["zai-social", "zai-email", "zai-sales", "zai-automation"], desc: "Growth, funnels, and automated operations." },
  ];

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Ecosystem"
        title="ZAI Ecosystem"
        subtitle="Explore the Master AI Agent Matrix and SDLC Workflows."
      />

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
        <GlassCard hover className="flex flex-col p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
            <div className="p-3 bg-accent-cyan/10 text-accent-cyan rounded-xl">
              <Code className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">ZAI Coding Workflow</h2>
              <p className="text-sm text-text-secondary">Software Development Life Cycle (SDLC)</p>
            </div>
          </div>

          <div className="space-y-6">
            {codingPhases.map((phase, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-canvas border border-border text-text-dim group-hover:border-accent-cyan group-hover:text-accent-cyan transition-colors">
                    {i + 1}
                  </div>
                  {i !== codingPhases.length - 1 && <div className="w-px h-full bg-border mt-2 group-hover:bg-accent-cyan/30 transition-colors"></div>}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {phase.icon}
                    <h3 className="font-medium text-text-primary">{phase.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{phase.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map(skill => (
                      <StatusBadge key={skill} status={skill} variant="muted" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard hover className="flex flex-col p-6">
          <div className="mb-6 flex items-center gap-3 border-b border-border pb-4">
            <div className="rounded-xl bg-accent-violet/10 p-3 text-accent-violet">
              <Workflow className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-text-primary">ZAI General Ecosystem</h2>
              <p className="text-sm text-text-secondary">End-to-End Enterprise Operations</p>
            </div>
          </div>

          <div className="space-y-6">
            {generalPhases.map((phase, i) => (
              <div key={i} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-canvas border border-border text-text-dim group-hover:border-accent-purple group-hover:text-accent-purple transition-colors">
                    {i + 1}
                  </div>
                  {i !== generalPhases.length - 1 && <div className="w-px h-full bg-border mt-2 group-hover:bg-accent-purple/30 transition-colors"></div>}
                </div>
                <div className="pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    {phase.icon}
                    <h3 className="font-medium text-text-primary">{phase.title}</h3>
                  </div>
                  <p className="text-sm text-text-secondary mb-3">{phase.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {phase.skills.map(skill => (
                      <StatusBadge key={skill} status={skill} variant="muted" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
