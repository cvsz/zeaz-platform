import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const agents = [
  { name: "Commander", role: "Orchestration", status: "online", load: 72, color: "#22d3ee" },
  { name: "Builder", role: "Code generation", status: "online", load: 64, color: "#a78bfa" },
  { name: "Guardian", role: "Security review", status: "watch", load: 48, color: "#34d399" },
  { name: "Trader", role: "XAU strategy lab", status: "sim", load: 81, color: "#fbbf24" },
  { name: "Scheduler", role: "Task automation", status: "ready", load: 37, color: "#fb7185" },
  { name: "Analyst", role: "Backtest metrics", status: "online", load: 55, color: "#60a5fa" },
];

const metrics = [
  ["Active agents", "38", "+12%"],
  ["Queued runs", "156", "stable"],
  ["Deploy targets", "7", "Cloudflare"],
  ["Risk score", "Low", "guarded"],
];

const sessions = [
  "Cloudflare Pages production deploy",
  "ZeaZ Studio loading shell",
  "XAU dashboard backtest sync",
  "Agent routing and status monitor",
];

function App() {
  return (
    <main className="shell">
      <section className="hero card">
        <div>
          <p className="eyebrow">ZeaZ Studio AI Agent System</p>
          <h1>Command dashboard for Cloudflare edge operations.</h1>
          <p className="lead">React/Vite control surface for agents, schedules, XAU strategy telemetry, backtest snapshots, and deployment status.</p>
        </div>
        <div className="orb" aria-hidden="true" />
      </section>

      <section className="grid metrics">
        {metrics.map(([label, value, hint]) => (
          <article className="card metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
            <small>{hint}</small>
          </article>
        ))}
      </section>

      <section className="layout">
        <div className="card">
          <div className="section-head">
            <h2>Agent roster</h2>
            <span>live-ready UI</span>
          </div>
          <div className="agents">
            {agents.map((agent) => (
              <article className="agent" key={agent.name} style={{ "--accent": agent.color }}>
                <div>
                  <h3>{agent.name}</h3>
                  <p>{agent.role}</p>
                </div>
                <span>{agent.status}</span>
                <div className="bar"><i style={{ width: `${agent.load}%` }} /></div>
              </article>
            ))}
          </div>
        </div>

        <aside className="card stack">
          <div className="section-head">
            <h2>Sessions</h2>
            <span>queue</span>
          </div>
          {sessions.map((item, index) => (
            <div className="session" key={item}>
              <b>{String(index + 1).padStart(2, "0")}</b>
              <span>{item}</span>
            </div>
          ))}
        </aside>
      </section>

      <section className="grid panels">
        <article className="card panel"><h2>XAU Dashboard</h2><p>Tracks strategy readiness, execution windows, and risk posture for simulation views.</p></article>
        <article className="card panel"><h2>Scheduler</h2><p>Daily execution queue for build, validate, deploy, monitor, and rotate workflows.</p></article>
        <article className="card panel"><h2>Backtest</h2><p>Snapshot cards for expectancy, drawdown, win rate, and execution discipline.</p></article>
      </section>
    </main>
  );
}

createRoot(document.getElementById("root")).render(<App />);
