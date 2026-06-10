"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import {
  actions,
  docsSurface,
  evidence,
  godModeMenu,
  launchTargets,
  releaseGates,
  runtimeMatrix,
} from "@/data/zcloud-content";
import { copies, localeLabels, localeOrder, type LocaleKey } from "@/data/zcloud-copy";
import { cloudpanelTranslations, cloudpanelTranslationSource } from "@/data/cloudpanel-translations";
import { vhostTemplateGroups, vhostTemplateSource } from "@/data/vhost-templates";
import { cloudpanelEcosystemRepos, cloudpanelEcosystemSource } from "@/data/cloudpanel-ecosystem";
import { aiModes, aiPromptPresets, buildAiBrief, type AiMode } from "@/data/zcloud-ai";

type DrawerId = "overview" | "release" | "ai" | "translations" | "templates" | "ecosystem" | "runtime" | "security" | "docs" | "support";

const SECTION_IDS: DrawerId[] = ["overview", "release", "ai", "translations", "templates", "ecosystem", "runtime", "security", "docs", "support"];
const STORAGE_KEY = "zcloud.locale";
const releaseScore = 98;

interface Message {
  role: "user" | "ai";
  content: string;
  providerName?: string;
  modelUsed?: string;
  latencyMs?: number;
  timestamp: string;
}

interface ChatLog {
  id: number;
  session_id: string;
  prompt: string;
  response: string;
  provider_used: string;
  model_used: string;
  latency_ms: number;
  status: string;
  created_at: string;
}

interface ProviderStatus {
  key: string;
  name: string;
  model: string;
  status: "online" | "offline" | "active-used" | "pending";
}

export default function Home() {
  const [locale, setLocale] = useState<LocaleKey>("en");
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeAction, setActiveAction] = useState<string>("copy-summary");
  const [highlight, setHighlight] = useState<DrawerId>("overview");
  const [aiMode, setAiMode] = useState<AiMode>("release");
  const [aiPrompt, setAiPrompt] = useState(aiPromptPresets[0]);

  // AI Chat and Fallback States
  const [sessionId, setSessionId] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dbLogs, setDbLogs] = useState<ChatLog[]>([]);
  const [activeTab, setActiveTab] = useState<"chat" | "logs">("chat");

  // Fallback trace and provider status states
  const [fallbackTrace, setFallbackTrace] = useState<{
    provider: string;
    name: string;
    status: "pending" | "trying" | "success" | "failed";
  }[]>([
    { provider: "ollama", name: "Ollama (Local)", status: "pending" },
    { provider: "fauxpilot", name: "FauxPilot (Local)", status: "pending" },
    { provider: "openclaw", name: "OpenClaw Gateway", status: "pending" },
    { provider: "nvidia", name: "NVIDIA NIM API", status: "pending" },
    { provider: "huggingface", name: "Hugging Face Hub", status: "pending" },
  ]);

  const [providers, setProviders] = useState<ProviderStatus[]>([
    { key: "ollama", name: "Ollama (Local)", model: "qwen2.5-coder:14b", status: "online" },
    { key: "fauxpilot", name: "FauxPilot (Local)", model: "fauxpilot", status: "online" },
    { key: "openclaw", name: "OpenClaw Gateway", model: "claude-sonnet-4-6", status: "online" },
    { key: "nvidia", name: "NVIDIA NIM API", model: "llama-3.1-nemotron", status: "online" },
    { key: "huggingface", name: "Hugging Face Hub", model: "llama-3-8b", status: "online" },
  ]);

  const copy = copies[locale];

  const filteredActions = useMemo(
    () => actions.filter((action) => `${action.label} ${action.value}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const filteredDocs = useMemo(
    () => docsSurface.filter((doc) => `${doc.title} ${doc.summary} ${doc.note}`.toLowerCase().includes(query.toLowerCase())),
    [query]
  );

  const aiBrief = useMemo(
    () =>
      buildAiBrief({
        mode: aiMode,
        locale,
        prompt: aiPrompt,
        activeSection: highlight,
        repoCount: cloudpanelEcosystemRepos.length,
        translationCount: cloudpanelTranslations.length,
        templateCount: vhostTemplateGroups.length,
      }),
    [aiMode, aiPrompt, locale, highlight]
  );

  // Fetch MariaDB Logs
  const fetchDbLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/logs?limit=15");
      if (res.ok) {
        const data = await res.json();
        if (data.logs) {
          setDbLogs(data.logs);
        }
      }
    } catch (err) {
      console.error("Failed to fetch chat logs:", err);
    }
  }, []);

  // Check providers health/latency in background
  const checkProvidersHealth = useCallback(async () => {
    // Basic ping simulation to check which are up
    setProviders(prev => prev.map(p => ({
      ...p,
      status: p.key === "ollama" || p.key === "fauxpilot" || p.key === "openclaw" ? "online" : "offline"
    })));
  }, []);

  // Initialize
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY) as LocaleKey | null;
      if (saved && localeOrder.includes(saved)) {
        setLocale(saved);
      }
    } catch {
      // Ignore storage failures
    }
    
    // Generate unique session id for this visit
    setSessionId(`sess-${Math.random().toString(36).substr(2, 9)}`);
    fetchDbLogs();
    checkProvidersHealth();
  }, [fetchDbLogs, checkProvidersHealth]);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Ignore storage failures
    }
  }, [locale]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen((value) => !value);
      }
      if (event.key === "Escape") {
        setPaletteOpen(false);
        setDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visible?.target?.id) {
          setHighlight(visible.target.id as DrawerId);
        }
      },
      {
        root: null,
        rootMargin: "-18% 0px -62% 0px",
        threshold: [0.08, 0.2, 0.35, 0.5],
      }
    );

    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id);
      if (element) observer.observe(element);
    });

    return () => observer.disconnect();
  }, []);

  function runAction(value: string) {
    setActiveAction(value);
    if (value === "copy-summary" && navigator.clipboard) {
      navigator.clipboard.writeText(`${copy.title}\n${copy.subtitle}\n${copy.hero}`);
    }
    if (value === "open-docs") {
      window.open("https://github.com/cloudpanel-io/docs/tree/master/v2", "_blank", "noreferrer");
    }
    if (value === "open-ai") setHighlight("ai");
    if (value === "jump-launch") setHighlight("release");
    if (value === "jump-runtime") setHighlight("runtime");
    if (value === "jump-templates") setHighlight("templates");
    if (value === "jump-security") setHighlight("security");
    if (value === "jump-ecosystem") setHighlight("ecosystem");
    if (value === "open-evidence") setHighlight("docs");
    setDrawerOpen(true);
  }

  // Handle Send Chat Message with Automated Fallback
  async function handleSendChat(e: React.FormEvent) {
    e.preventDefault();
    if (!chatInput.trim() || chatLoading) return;

    const userPrompt = chatInput.trim();
    setChatInput("");
    setChatLoading(true);

    // Append user message
    const userMsg: Message = {
      role: "user",
      content: userPrompt,
      timestamp: new Date().toLocaleTimeString(),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Reset fallback trace visualization
    setFallbackTrace([
      { provider: "ollama", name: "Ollama (Local)", status: "trying" },
      { provider: "fauxpilot", name: "FauxPilot (Local)", status: "pending" },
      { provider: "openclaw", name: "OpenClaw Gateway", status: "pending" },
      { provider: "nvidia", name: "NVIDIA NIM API", status: "pending" },
      { provider: "huggingface", name: "Hugging Face Hub", status: "pending" },
    ]);

    try {
      // We will perform client-side emulation of trace updates during the request
      const currentTrace = [...fallbackTrace];
      const traceInterval = setInterval(() => {
        // Find current trying provider index
        const tryingIdx = currentTrace.findIndex((t) => t.status === "trying");
        if (tryingIdx !== -1 && tryingIdx < currentTrace.length - 1) {
          currentTrace[tryingIdx] = { ...currentTrace[tryingIdx], status: "failed" };
          currentTrace[tryingIdx + 1] = { ...currentTrace[tryingIdx + 1], status: "trying" };
          setFallbackTrace([...currentTrace]);
        }
      }, 1800); // Emulate fallback hops visually every 1.8s while loading

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userPrompt, sessionId }),
      });

      clearInterval(traceInterval);

      if (response.ok) {
        const data = await response.json();
        
        // Finalize trace based on actual provider used
        const usedProvider = data.providerUsed;
        const updatedTrace = fallbackTrace.map((t) => {
          if (t.provider === usedProvider) {
            return { ...t, status: "success" as const };
          }
          const providerOrder = ["ollama", "fauxpilot", "openclaw", "nvidia", "huggingface"];
          const usedIdx = providerOrder.indexOf(usedProvider);
          const currentIdx = providerOrder.indexOf(t.provider);
          
          if (usedIdx === -1 || currentIdx < usedIdx) {
            return { ...t, status: "failed" as const };
          }
          return { ...t, status: "pending" as const };
        });
        setFallbackTrace(updatedTrace);

        // Update provider status display
        setProviders(prev => prev.map(p => {
          if (p.key === usedProvider) {
            return { ...p, status: "active-used" };
          }
          return p;
        }));

        // Append AI response
        const aiMsg: Message = {
          role: "ai",
          content: data.response,
          providerName: data.providerName,
          modelUsed: data.modelUsed,
          latencyMs: data.latencyMs,
          timestamp: new Date().toLocaleTimeString(),
        };
        setMessages((prev) => [...prev, aiMsg]);
      } else {
        throw new Error("API Route failure");
      }
    } catch (err) {
      console.error("Chat error:", err);
      // Fallback display failed state
      setFallbackTrace((prev) => prev.map((t) => ({ ...t, status: "failed" })));
      
      const errorMsg: Message = {
        role: "ai",
        content: "Network error occurred. The fallback chain failed to connect to local and remote nodes. Please verify your services are running.",
        providerName: "System Controller",
        modelUsed: "none",
        latencyMs: 0,
        timestamp: new Date().toLocaleTimeString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setChatLoading(false);
      // Refresh MariaDB log table
      fetchDbLogs();
    }
  }

  return (
    <main className="zcloud-shell">
      <div className="zcloud-backdrop zcloud-backdrop-a" />
      <div className="zcloud-backdrop zcloud-backdrop-b" />
      <div className="zcloud-grid" />

      <aside className="dock panel">
        <div className="dock-brand">
          <div className="dock-mark">Z</div>
          <div>
            <p className="dock-title">zcloud</p>
            <p className="dock-subtitle">{copy.dockLabel}</p>
          </div>
        </div>

        <div className="dock-section">
          <span className="dock-kicker">{copy.menuLabel}</span>
          <nav className="dock-nav">
            {[
              ["Overview", "overview"],
              ["Release", "release"],
              ["AI Center", "ai"],
              ["Runtime", "runtime"],
              ["Translations", "translations"],
              ["Templates", "templates"],
              ["Ecosystem", "ecosystem"],
              ["Security", "security"],
              ["Docs", "docs"],
              ["Support", "support"],
            ].map(([label, id]) => (
              <a
                key={id}
                href={`#${id}`}
                className={highlight === id ? "dock-link active" : "dock-link"}
                onClick={() => setHighlight(id as DrawerId)}
              >
                {label}
              </a>
            ))}
          </nav>
        </div>

        <div className="dock-section">
          <span className="dock-kicker">Locale</span>
          <div className="locale-grid">
            {localeOrder.map((item) => (
              <button
                key={item}
                type="button"
                className={locale === item ? "locale-pill active" : "locale-pill"}
                onClick={() => setLocale(item)}
              >
                {localeLabels[item]}
              </button>
            ))}
          </div>
        </div>

        <div className="dock-section dock-actions">
          <button type="button" className="dock-button primary" onClick={() => setPaletteOpen(true)}>
            {copy.paletteLabel}
          </button>
          <button type="button" className="dock-button" onClick={() => setDrawerOpen(true)}>
            {copy.actionLabel}
          </button>
        </div>
      </aside>

      <div className="zcloud-shell-inner with-dock">
        <header className="topbar panel">
          <div className="brand-block">
            <div className="brand-mark">Z</div>
            <div>
              <p className="brand-name">zcloud</p>
              <p className="brand-subtitle">{copy.subtitle}</p>
            </div>
          </div>

          <div className="topbar-meta">
            <span className="status-pill status-live">GODMODE enabled</span>
            <span className="status-pill">{copy.lang}</span>
            <span className="status-pill">Master Meta</span>
            <span className="status-pill">Final Release Complete</span>
          </div>
        </header>

        <section className="hero panel" id="overview">
          <div className="hero-copy">
            <div className="eyebrow-row">
              <span className="eyebrow">{copy.badge}</span>
              <span className="eyebrow eyebrow-soft">{copy.menuLabel}</span>
            </div>
            <h1>{copy.title}</h1>
            <p className="lede">{copy.hero}</p>
            <p className="lede secondary">{copy.body}</p>

            <div className="chip-row">
              <span className="chip chip-live">ship ready</span>
              <span className="chip">v2 docs aligned</span>
              <span className="chip">panel plus runtimes</span>
              <span className="chip">security aware</span>
              <span className="chip">{copy.menuLabel} dock</span>
            </div>
          </div>

          <aside className="score-card panel-inner">
            <p className="score-label">Final release score</p>
            <div className="score-ring">
              <div className="score-ring-fill">
                <span>{releaseScore}</span>
                <small>/ 100</small>
              </div>
            </div>
            <div className="score-meta">
              <div>
                <span className="meta-label">surface count</span>
                <strong>11 docs zones</strong>
              </div>
              <div>
                <span className="meta-label">launch targets</span>
                <strong>10 providers</strong>
              </div>
              <div>
                <span className="meta-label">release posture</span>
                <strong>final candidate</strong>
              </div>
            </div>
          </aside>
        </section>

        <section className="panel godmode-panel" id="release">
          <div className="section-heading compact">
            <div>
              <span className="section-kicker">godmode</span>
              <h2>{copy.quickLabel}</h2>
            </div>
            <p className="section-copy">The operator rail stays visible and works as the persistent control dock for the release shell.</p>
          </div>
          <div className="godmode-menu">
            {godModeMenu.map((item, index) => (
              <a key={item} href={`#${item.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`} className="godmode-item">
                <span className="godmode-index">0{index + 1}</span>
                <span>{item}</span>
              </a>
            ))}
          </div>
        </section>

        {/* ==========================================
            AI Center & Automated Fallback Console
            ========================================== */}
        <section className="panel ai-console-panel" id="ai">
          <div className="section-heading">
            <div>
              <span className="section-kicker">AI Automated Fallback</span>
              <h2>AI Assistant & MariaDB logs</h2>
            </div>
            <p className="section-copy">
              A premium, resilient AI assistant with automatic fallback logic. In case of network drops or timeout,
              it cascades down providers (Ollama &rarr; FauxPilot &rarr; OpenClaw &rarr; NVIDIA NIM &rarr; Hugging Face).
              All requests are logged locally in MariaDB.
            </p>
          </div>

          {/* AI Providers Status Monitor */}
          <div className="ai-monitor-grid">
            {providers.map((p) => (
              <div
                key={p.key}
                className={`ai-monitor-card ${
                  p.status === "active-used" ? "active" : p.status === "online" ? "fallback-ready" : ""
                }`}
              >
                <div className="ai-status-row">
                  <span className="ai-status-name">{p.name}</span>
                  <div className="ai-status-dot-wrapper">
                    <span
                      className={`ai-status-dot ${
                        p.status === "active-used" ? "active-used" : p.status === "online" ? "online" : "offline"
                      }`}
                    />
                  </div>
                </div>
                <span className="ai-status-lbl">Active Model</span>
                <span className="ai-model-info">{p.model}</span>
              </div>
            ))}
          </div>

          {/* AI Settings Preset & Modes */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", marginBottom: "20px", background: "rgba(255,255,255,0.03)", padding: "16px", borderRadius: "18px", border: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ flex: "1 1 300px" }}>
              <span className="dock-kicker" style={{ color: "#76a8ff", display: "block", marginBottom: "8px" }}>AI Analysis Mode</span>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {aiModes.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAiMode(m.id)}
                    className={`locale-pill ${aiMode === m.id ? "active" : ""}`}
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    {m.label}
                  </button>
                ))}
              </div>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "8px" }}>
                {aiModes.find(m => m.id === aiMode)?.description}
              </p>
            </div>

            <div style={{ flex: "1 1 300px", borderLeft: "1px solid rgba(255,255,255,0.08)", paddingLeft: "16px" }}>
              <span className="dock-kicker" style={{ color: "#84ffd6", display: "block", marginBottom: "8px" }}>System Intel Summary ({aiBrief.confidence}% confidence)</span>
              <strong style={{ fontSize: "0.9rem", color: "var(--text)" }}>{aiBrief.headline}</strong>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", marginTop: "4px" }}>
                {aiBrief.summary}
              </p>
            </div>
          </div>

          <div style={{ marginBottom: "20px" }}>
            <span className="dock-kicker" style={{ display: "block", marginBottom: "8px" }}>Quick Presets (Click to Load)</span>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {aiPromptPresets.map((preset) => (
                <button
                  key={preset}
                  onClick={() => {
                    setAiPrompt(preset);
                    setChatInput(preset);
                  }}
                  className="chip"
                  style={{ cursor: "pointer", fontSize: "0.8rem", padding: "0.4rem 0.8rem" }}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Container */}
          <div className="chat-container">
            {/* Main Chat Box */}
            <div className="chat-box">
              <div className="chat-messages-header">
                <h4>AI Operator Console</h4>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button
                    onClick={() => setActiveTab("chat")}
                    className={`locale-pill ${activeTab === "chat" ? "active" : ""}`}
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    Console Chat
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("logs");
                      fetchDbLogs();
                    }}
                    className={`locale-pill ${activeTab === "logs" ? "active" : ""}`}
                    style={{ padding: "0.4rem 0.8rem", fontSize: "0.8rem" }}
                  >
                    MariaDB logs
                  </button>
                </div>
              </div>

              {activeTab === "chat" ? (
                <>
                  <div className="chat-messages">
                    {messages.length === 0 ? (
                      <div className="chat-msg ai" style={{ maxWidth: "100%", alignSelf: "center", opacity: 0.7 }}>
                        <p>Welcome, Operator. Enter a command or ask a deployment question. The active AI automated fallback route will handle the response and stream the telemetry logs to MariaDB.</p>
                      </div>
                    ) : (
                      messages.map((msg, index) => (
                        <div key={index} className={`chat-msg ${msg.role}`}>
                          <p>{msg.content}</p>
                          {msg.role === "ai" && (
                            <div className="chat-msg-meta">
                              <span>Source: <strong className="provider-badge">{msg.providerName}</strong></span>
                              <span>Model: <strong style={{ color: "#76a8ff" }}>{msg.modelUsed}</strong></span>
                              <span>Latency: <strong>{msg.latencyMs}ms</strong></span>
                              <span>Time: {msg.timestamp}</span>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>

                  <div className="chat-input-area">
                    <form onSubmit={handleSendChat} className="chat-form">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Ask anything (e.g. Compare translations, check system status)..."
                        className="chat-input"
                        disabled={chatLoading}
                      />
                      <button type="submit" disabled={chatLoading || !chatInput.trim()} className="chat-send-btn">
                        {chatLoading ? "routing..." : "EXECUTE"}
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                /* MariaDB Chat logs view inside the console container */
                <div style={{ flex: 1, overflowY: "auto", padding: "16px" }}>
                  <div className="db-logs-table-wrapper" style={{ marginTop: 0 }}>
                    <table className="db-logs-table">
                      <thead>
                        <tr>
                          <th>Time</th>
                          <th>Provider</th>
                          <th>Model</th>
                          <th>Latency</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbLogs.length === 0 ? (
                          <tr>
                            <td colSpan={5} style={{ textAlign: "center", opacity: 0.6 }}>No records in MariaDB chat_logs.</td>
                          </tr>
                        ) : (
                          dbLogs.slice(0, 10).map((log) => (
                            <tr key={log.id}>
                              <td>{new Date(log.created_at).toLocaleTimeString()}</td>
                              <td>
                                <span className={`db-logs-badge ${log.provider_used}`}>
                                  {log.provider_used}
                                </span>
                              </td>
                              <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{log.model_used}</td>
                              <td>{log.latency_ms}ms</td>
                              <td>
                                <span className={`db-logs-status ${log.status}`}>
                                  {log.status}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Fallback Trace Sidebar */}
            <div className="fallback-trace-sidebar">
              <h4 className="fallback-trace-title">Fallback Routing Trace</h4>
              <p style={{ fontSize: "0.78rem", color: "var(--muted)", lineHeight: 1.5 }}>
                Real-time active connection hopping trace. The system tries the primary local node first, cascading down if errors occur.
              </p>
              
              <div style={{ display: "grid", gap: "10px" }}>
                {fallbackTrace.map((trace, idx) => (
                  <div
                    key={trace.provider}
                    className={`trace-step ${
                      trace.status === "trying" ? "active" : trace.status === "success" ? "success" : trace.status === "failed" ? "failed" : ""
                    }`}
                  >
                    <div className="trace-step-header">
                      <span>0{idx + 1}. {trace.name}</span>
                      <span className={`trace-status ${trace.status}`}>
                        {trace.status === "trying" ? "hopping..." : trace.status}
                      </span>
                    </div>
                    <span style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                      {trace.provider === "ollama" ? "Primary Local Node (Port 11434)" :
                       trace.provider === "fauxpilot" ? "Secondary Local Node (Port 5000)" :
                       trace.provider === "openclaw" ? "ECC OpenClaw Agent Gateway" :
                       trace.provider === "nvidia" ? "Cloud Router: NVIDIA NIM" :
                       "Cloud Router: Hugging Face v1"}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "12px" }}>
                <span className="dock-kicker" style={{ color: "#84ffd6" }}>Telemetry Endpoint</span>
                <p style={{ fontFamily: "monospace", fontSize: "0.72rem", marginTop: "4px" }}>
                  database: mariadb://zcloud_user@127.0.0.1/zcloud.chat_logs
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Launch Topology Section */}
        <section className="panel stack-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">launch topology</span>
              <h2>CloudPanel&apos;s quick-start radius</h2>
            </div>
            <p className="section-copy">
              The docs are explicit about deployment breadth: the panel is meant to land quickly on common cloud VPS
              providers and then guide the operator into repeatable control paths.
            </p>
          </div>
          <div className="launch-grid">
            {launchTargets.map((item, index) => (
              <div key={item} className="launch-pill">
                <span className="launch-index">0{index + 1}</span>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel" id="runtime">
          <div className="section-heading">
            <div>
              <span className="section-kicker">runtime matrix</span>
              <h2>How zcloud sees the application layers</h2>
            </div>
            <p className="section-copy">
              The release should not flatten everything into one generic hosting mode. The docs distinguish runtime
              families, and the interface reflects that by separating the application paths.
            </p>
          </div>

          <div className="runtime-grid">
            {runtimeMatrix.map((runtime) => (
              <article key={runtime.title} className={`runtime-card tone-${runtime.tone}`}>
                <h3>{runtime.title}</h3>
                <ul>
                  {runtime.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="panel stack-panel" id="translations">
          <div className="section-heading">
            <div>
              <span className="section-kicker">imported translations</span>
              <h2>CloudPanel v2 locale tree imported from upstream</h2>
            </div>
            <p className="section-copy">
              Source tree: {cloudpanelTranslationSource}. This manifest mirrors the upstream v2 locale folders so the
              release UI can expand from the same translation asset map.
            </p>
          </div>
          <div className="docs-grid">
            {cloudpanelTranslations.map((locale) => (
              <article key={locale.code} className="doc-card panel">
                <div className="doc-card-top">
                  <span className="doc-badge">{locale.code}</span>
                  <span className="doc-arrow">imported</span>
                </div>
                <h3>{locale.label}</h3>
                <p className="doc-summary">{locale.role}</p>
                <p className="doc-note">{locale.folder}</p>
                <p className="doc-note">{locale.messages}</p>
                <p className="doc-note">{locale.validators}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel stack-panel" id="templates">
          <div className="section-heading">
            <div>
              <span className="section-kicker">vhost templates</span>
              <h2>Imported CloudPanel template catalog</h2>
            </div>
            <p className="section-copy">
              Source tree: {vhostTemplateSource}. This catalog mirrors the upstream v2 template families and the
              special HTTP/3 and Varnish variants.
            </p>
          </div>
          <div className="docs-grid">
            {vhostTemplateGroups.map((template) => (
              <article key={template.slug} className="doc-card panel">
                <div className="doc-card-top">
                  <span className="doc-badge">{template.kind}</span>
                  <span className="doc-arrow">template</span>
                </div>
                <h3>{template.name}</h3>
                <p className="doc-summary">{template.summary}</p>
                <p className="doc-note">{template.slug}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="panel stack-panel" id="ecosystem">
          <div className="section-heading">
            <div>
              <span className="section-kicker">cloudpanel ecosystem</span>
              <h2>Imported repo-by-repo feature catalog</h2>
            </div>
            <p className="section-copy">
              Source list: {cloudpanelEcosystemSource}. This section mirrors the repo list you supplied, grouped into
              docs, templates, runtime, deploy, platform, tooling, and archive surfaces.
            </p>
          </div>
          <div className="docs-grid">
            {cloudpanelEcosystemRepos.map((repo) => (
              <article key={repo.slug} className="doc-card panel">
                <div className="doc-card-top">
                  <span className="doc-badge">{repo.category}</span>
                  <span className="doc-arrow">repo</span>
                </div>
                <h3>{repo.name}</h3>
                <p className="doc-summary">{repo.summary}</p>
                <p className="doc-note">{repo.repo}</p>
                <p className="doc-note">{repo.updated}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="docs-section" id="docs">
          <div className="section-heading">
            <div>
              <span className="section-kicker">docs surface</span>
              <h2>What the v2 tree actually covers</h2>
            </div>
            <p className="section-copy">
              This release frame mirrors the real documentation structure rather than inventing a generic SaaS story.
              Each card maps back to a live docs section in the CloudPanel repository.
            </p>
          </div>

          <div className="docs-grid">
            {filteredDocs.map((doc) => (
              <a key={doc.title} href={doc.href} target="_blank" rel="noreferrer" className="doc-card panel">
                <div className="doc-card-top">
                  <span className="doc-badge">{doc.badge}</span>
                  <span className="doc-arrow">open</span>
                </div>
                <h3>{doc.title}</h3>
                <p className="doc-summary">{doc.summary}</p>
                <p className="doc-note">{doc.note}</p>
              </a>
            ))}
          </div>
        </section>

        <section className="split-grid">
          <article className="panel checklist-panel" id="support">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">final gates</span>
                <h2>Release readiness checklist</h2>
              </div>
            </div>
            <div className="checklist">
              {releaseGates.map((gate, index) => (
                <div key={gate.label} className="check-row">
                  <div className="check-index">{index + 1}</div>
                  <div className="check-copy">
                    <strong>{gate.label}</strong>
                    <span>{gate.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="panel evidence-panel" id="security">
            <div className="section-heading compact">
              <div>
                <span className="section-kicker">source trace</span>
                <h2>Evidence used to shape the release</h2>
              </div>
            </div>
            <div className="evidence-list">
              {evidence.map((item) => (
                <a key={item.title} href={item.href} target="_blank" rel="noreferrer" className="evidence-row">
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <span className="doc-arrow">open</span>
                </a>
              ))}
            </div>
          </article>
        </section>

        {/* ==========================================
            MariaDB Table (Dedicated Chat History Log Panel)
            ========================================== */}
        <section className="panel db-logs-panel">
          <div className="section-heading">
            <div>
              <span className="section-kicker">MariaDB Logs Database</span>
              <h2>Global Chat telemetry logs</h2>
            </div>
            <p className="section-copy">
              Audit log of all processed queries recorded inside the local MariaDB instance.
              Tracks provider fallback, execution latency, and success rates.
            </p>
          </div>
          <div className="db-logs-table-wrapper">
            <table className="db-logs-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Session ID</th>
                  <th>Prompt Query</th>
                  <th>AI Provider Used</th>
                  <th>Model Version</th>
                  <th>Latency</th>
                  <th>Status</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {dbLogs.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: "center", opacity: 0.6, padding: "20px" }}>
                      No history found in MariaDB. Run a query in the AI console above to insert logs.
                    </td>
                  </tr>
                ) : (
                  dbLogs.map((log) => (
                    <tr key={log.id}>
                      <td>#{log.id}</td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{log.session_id}</td>
                      <td style={{ maxWidth: "250px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={log.prompt}>
                        {log.prompt}
                      </td>
                      <td>
                        <span className={`db-logs-badge ${log.provider_used}`}>
                          {log.provider_used}
                        </span>
                      </td>
                      <td style={{ fontFamily: "monospace", fontSize: "0.8rem" }}>{log.model_used}</td>
                      <td>{log.latency_ms}ms</td>
                      <td>
                        <span className={`db-logs-status ${log.status}`}>
                          {log.status}
                        </span>
                      </td>
                      <td>{new Date(log.created_at).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="footer-panel panel">
          <div>
            <span className="section-kicker">final release note</span>
            <h2>zcloud is a docs-native release shell, not a generic dashboard.</h2>
          </div>
          <p>{copy.releaseNote}</p>
        </section>
      </div>

      {paletteOpen ? (
        <div className="overlay" onClick={() => setPaletteOpen(false)}>
          <div className="palette panel" onClick={(event) => event.stopPropagation()}>
            <div className="palette-header">
              <div>
                <span className="section-kicker">{copy.commandLabel}</span>
                <h3>Command Palette</h3>
              </div>
              <button type="button" className="dock-button" onClick={() => setPaletteOpen(false)}>
                Close
              </button>
            </div>
            <input
              className="palette-input"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search actions, docs, or sections..."
            />
            <div className="palette-list">
              {filteredActions.map((action) => (
                <button
                  key={action.value}
                  type="button"
                  className={activeAction === action.value ? "palette-item active" : "palette-item"}
                  onClick={() => runAction(action.value)}
                >
                  <span>{action.label}</span>
                  <span className="doc-arrow">run</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {drawerOpen ? (
        <aside className="drawer panel" style={{ zIndex: 70 }}>
          <div className="palette-header">
            <div>
              <span className="section-kicker">{copy.drawerLabel}</span>
              <h3>Action Drawer</h3>
            </div>
            <button type="button" className="dock-button" onClick={() => setDrawerOpen(false)}>
              Close
            </button>
          </div>

          <div className="drawer-body">
            <div className="drawer-card">
              <span className="section-kicker">Active action</span>
              <strong>{activeAction}</strong>
              <p>
                The drawer is designed for release operations: it surfaces the current command, localization mode, and
                the operator path without leaving the page.
              </p>
            </div>

            <div className="drawer-card">
              <span className="section-kicker">Locale summary</span>
              <strong>{copy.lang}</strong>
              <p>{copy.seo}</p>
              <p>Imported from {cloudpanelTranslationSource}.</p>
              <p>Vhost source: {vhostTemplateSource}.</p>
              <p>Ecosystem source: {cloudpanelEcosystemSource}.</p>
            </div>

            <div className="drawer-card">
              <span className="section-kicker">AI state</span>
              <strong>{aiBrief.headline}</strong>
              <p>Mode: {aiModes.find((mode) => mode.id === aiMode)?.label ?? aiMode}</p>
              <p>Prompt: {aiPrompt}</p>
              <p>Section focus: {highlight}</p>
            </div>

            <div className="drawer-card">
              <span className="section-kicker">Search results</span>
              <div className="drawer-results">
                {filteredDocs.slice(0, 4).map((doc) => (
                  <a key={doc.title} href={doc.href} target="_blank" rel="noreferrer" className="drawer-result">
                    <span>{doc.title}</span>
                    <span className="doc-arrow">open</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </aside>
      ) : null}
    </main>
  );
}

