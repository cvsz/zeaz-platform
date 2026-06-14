import React from 'react';
import { Brain, Sparkles, Target, Palette, Video, PenTool, TrendingUp, BarChart3, Zap } from 'lucide-react';

const skills = [
  { icon: <Brain />, title: "AI Fundamentals", desc: "พื้นฐาน AI ที่ต้องรู้" },
  { icon: <Sparkles />, title: "Prompt Engineering", desc: "เขียน prompt ระดับมือโปร" },
  { icon: <Target />, title: "Content Strategy", desc: "วางแผน content ที่ขายได้" },
  { icon: <Palette />, title: "Canva + AI Design", desc: "ออกแบบกราฟิกด้วย AI" },
  { icon: <Video />, title: "Video Editing AI", desc: "ตัดต่อวิดีโอด้วย AI" },
  { icon: <PenTool />, title: "Copywriting AI", desc: "เขียน copy ที่ขายได้" },
  { icon: <TrendingUp />, title: "Social Media Growth", desc: "ปั้นเพจให้โต" },
  { icon: <BarChart3 />, title: "Analytics & Data", desc: "อ่านข้อมูลให้เป็น" },
  { icon: <Zap />, title: "AI Automation", desc: "ระบบอัตโนมัติด้วย AI" },
];

export function AiSkillsSection() {
  return (
    <div className="glass-card-static space-y-6">
      <h2 className="h2" style={{ fontFamily: 'var(--font-cinzel)' }}>AI Learning Roadmap</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {skills.map((skill) => (
          <div key={skill.title} className="rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 transition hover:bg-[var(--bg-surface-hover)]">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-[var(--radius-sm)] bg-[var(--color-primary-bg)] text-[var(--color-primary)]">
              {React.cloneElement(skill.icon as React.ReactElement, { size: 20 })}
            </div>
            <h4 className="font-bold text-[var(--text-primary)]">{skill.title}</h4>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">{skill.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
