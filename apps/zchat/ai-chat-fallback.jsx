import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Send,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Plus,
  Download,
  Trash2,
  Wifi,
  WifiOff,
  ChevronDown,
  Activity,
  Settings,
  X,
  Zap,
  Clock,
} from 'lucide-react';

import { callAIWithFallback, getProviderStatuses } from './src/orchestrator';
import { persistChat } from './src/chatPersistence';
import { createRateLimiter } from './src/rateLimiter';
import {
  exportAsMarkdown,
  exportAsJSON,
  triggerDownload,
  generateExportFilename,
} from './src/exportChat';
import { log } from './src/logger';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_HISTORY_TURNS =
  parseInt(process.env.REACT_APP_MAX_HISTORY_TURNS, 10) || 10;
const ENABLE_RATE_LIMIT = process.env.REACT_APP_ENABLE_RATE_LIMIT !== 'false';
const RATE_LIMIT_REQUESTS =
  parseInt(process.env.REACT_APP_RATE_LIMIT_REQUESTS, 10) || 20;
const RATE_LIMIT_WINDOW_MS =
  parseInt(process.env.REACT_APP_RATE_LIMIT_WINDOW_MS, 10) || 60000;
const SHOW_PROVIDER_BADGE = process.env.REACT_APP_SHOW_PROVIDER_BADGE !== 'false';
const SHOW_LATENCY = process.env.REACT_APP_SHOW_LATENCY !== 'false';
const ENABLE_EXPORT = process.env.REACT_APP_ENABLE_EXPORT !== 'false';

// Rate limiter singleton
const rateLimiter = ENABLE_RATE_LIMIT
  ? createRateLimiter(RATE_LIMIT_REQUESTS, RATE_LIMIT_WINDOW_MS)
  : null;

// Initial welcome message
const WELCOME_MESSAGE = {
  id: 'welcome',
  role: 'assistant',
  content:
    '**Welcome to ZeaZ Omega Chat** 🔱\n\n' +
    "I'm your AI assistant with a **9-provider free fallback chain**. If one service fails, I automatically try the next.\n\n" +
    'Providers (in priority order): Google Gemini → Groq → Cohere → HuggingFace → OpenRouter → Mistral → Together AI → Ollama → Smart Offline\n\n' +
    'Ask me anything!',
  timestamp: new Date(),
  isWelcome: true,
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Provider status indicator dot.
 */
function ProviderDot({ status }) {
  let color = 'var(--color-text-muted)';
  let title = 'Disabled';
  if (status.enabled && !status.circuitOpen) {
    color = 'var(--color-success)';
    title = `Active (${RATE_LIMIT_REQUESTS - (rateLimiter?.remaining() ?? RATE_LIMIT_REQUESTS)} used)`;
  } else if (status.circuitOpen) {
    color = 'var(--color-warning)';
    title = `Circuit Open until ${status.openUntil ? new Date(status.openUntil).toLocaleTimeString() : '?'}`;
  }
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        backgroundColor: color,
        flexShrink: 0,
        transition: 'background-color 0.3s ease',
      }}
      title={title}
    />
  );
}

/**
 * Single provider row in the status panel.
 */
function ProviderStatusRow({ status }) {
  return (
    <div className="provider-status-row">
      <ProviderDot status={status} />
      <span className="provider-status-name">{status.name}</span>
      {status.circuitOpen && (
        <span className="provider-status-badge badge-warning">Circuit Open</span>
      )}
      {!status.enabled && (
        <span className="provider-status-badge badge-disabled">Disabled</span>
      )}
    </div>
  );
}

/**
 * Provider badge shown on assistant messages.
 */
function ProviderBadge({ source, latencyMs }) {
  if (!SHOW_PROVIDER_BADGE || !source) return null;
  return (
    <div className="provider-badge">
      <Zap size={10} />
      <span>{source}</span>
      {SHOW_LATENCY && latencyMs && (
        <>
          <span className="badge-separator">·</span>
          <Clock size={10} />
          <span>{latencyMs}ms</span>
        </>
      )}
    </div>
  );
}

/**
 * Individual message bubble.
 */
function MessageBubble({ message, copiedId, onCopy }) {
  const isUser = message.role === 'user';
  const isError = Boolean(message.isError);

  return (
    <div className={`message-wrapper ${isUser ? 'message-user' : 'message-assistant'}`}>
      <div
        className={`message-bubble ${
          isUser ? 'bubble-user' : isError ? 'bubble-error' : 'bubble-assistant'
        }`}
      >
        {/* Simple markdown-ish rendering: bold **text** */}
        <p
          className="message-content"
          dangerouslySetInnerHTML={{
            __html: message.content
              .replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              .replace(/\n/g, '<br/>'),
          }}
        />

        {!isUser && <ProviderBadge source={message.source} latencyMs={message.latencyMs} />}

        <div className="message-meta">
          <button
            className="copy-btn"
            onClick={() => onCopy(message.id, message.content)}
            title="Copy to clipboard"
            aria-label="Copy message"
          >
            {copiedId === message.id ? <Check size={12} /> : <Copy size={12} />}
          </button>
          <span className="message-time">
            {new Date(message.timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

/**
 * Typing indicator animation.
 */
function TypingIndicator() {
  return (
    <div className="message-wrapper message-assistant">
      <div className="message-bubble bubble-assistant">
        <div className="typing-dots">
          <span />
          <span />
          <span />
        </div>
      </div>
    </div>
  );
}

/**
 * Error banner with retry button.
 */
function ErrorBanner({ error, onRetry }) {
  if (!error) return null;
  return (
    <div className="error-banner">
      <AlertCircle size={16} className="error-icon" />
      <div className="error-content">
        <p className="error-title">Connection issue</p>
        <p className="error-message">{error.message}</p>
      </div>
      <button className="btn btn-sm btn-warning" onClick={onRetry}>
        <RefreshCw size={14} />
        Retry
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function AIChatFallback() {
  // --- State ---
  const [messages, setMessages] = useState(() => {
    const saved = persistChat.load();
    return saved.length > 0 ? saved : [WELCOME_MESSAGE];
  });
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [showProviderPanel, setShowProviderPanel] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [providerStatuses, setProviderStatuses] = useState([]);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(
    rateLimiter ? rateLimiter.remaining() : null
  );

  // --- Refs ---
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // --- Effects ---
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Persist messages whenever they change
  useEffect(() => {
    if (process.env.REACT_APP_ENABLE_CHAT_HISTORY !== 'false') {
      persistChat.save(messages);
    }
  }, [messages]);

  // Refresh provider statuses periodically
  useEffect(() => {
    const refresh = () => setProviderStatuses(getProviderStatuses());
    refresh();
    const interval = setInterval(refresh, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update rate limit display
  useEffect(() => {
    if (rateLimiter) {
      setRateLimitRemaining(rateLimiter.remaining());
    }
  }, [messages]);

  // --- Handlers ---
  const copyToClipboard = useCallback((id, content) => {
    navigator.clipboard.writeText(content).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }, []);

  const buildHistory = useCallback(
    (messageList) => {
      return messageList
        .filter((m) => !m.isWelcome && !m.isError)
        .slice(-MAX_HISTORY_TURNS * 2)
        .map((m) => ({ role: m.role, content: m.content }));
    },
    []
  );

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || loading) return;

    // Rate limit check
    if (rateLimiter) {
      try {
        rateLimiter.check();
        setRateLimitRemaining(rateLimiter.remaining());
      } catch (rateLimitErr) {
        log.warn('UI', 'Rate limit exceeded', rateLimitErr.message);
        setError({ message: rateLimitErr.message });
        return;
      }
    }

    setInput('');
    setError(null);

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => {
      const next = [...prev, userMsg];
      return next;
    });
    setLoading(true);

    log.info('UI', 'Sending message', { chars: text.length });

    try {
      setMessages((prev) => {
        const history = buildHistory(prev);
        // Kick off async call (we capture prev for history)
        callAIWithFallback(text, history).then((result) => {
          const assistantMsg = {
            id: `assistant-${Date.now()}`,
            role: 'assistant',
            content: result.content,
            timestamp: new Date(),
            source: result.source,
            latencyMs: result.latencyMs,
          };
          setMessages((current) => [...current, assistantMsg]);
          setLoading(false);
          setProviderStatuses(getProviderStatuses());
          log.info('UI', `Response received from provider="${result.source}"`, {
            latencyMs: result.latencyMs,
          });
        }).catch((err) => {
          log.error('UI', 'All providers failed', err);
          setError({ message: err.message });
          const errorMsg = {
            id: `error-${Date.now()}`,
            role: 'assistant',
            content: `❌ All AI providers failed.\n\n${err.message}\n\nPlease check your API keys in \`.env.local\` or try again later.`,
            timestamp: new Date(),
            isError: true,
          };
          setMessages((current) => [...current, errorMsg]);
          setLoading(false);
        });
        return prev;
      });
    } catch (err) {
      log.error('UI', 'Unexpected error in handleSend', err);
      setLoading(false);
    }
  }, [input, loading, buildHistory]);

  const handleRetry = useCallback(() => {
    const lastUserMsg = [...messages].reverse().find((m) => m.role === 'user');
    if (!lastUserMsg) return;
    setInput(lastUserMsg.content);
    setError(null);
    inputRef.current?.focus();
  }, [messages]);

  const handleNewChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    persistChat.clear();
    setError(null);
    rateLimiter?.reset();
    setRateLimitRemaining(rateLimiter ? rateLimiter.remaining() : null);
    inputRef.current?.focus();
    log.info('UI', 'New chat session started');
  }, []);

  const handleExportMarkdown = useCallback(() => {
    const md = exportAsMarkdown(messages);
    triggerDownload(md, generateExportFilename('md'), 'text/markdown');
    log.info('UI', 'Exported chat as Markdown');
  }, [messages]);

  const handleExportJSON = useCallback(() => {
    const json = exportAsJSON(messages);
    triggerDownload(json, generateExportFilename('json'), 'application/json');
    log.info('UI', 'Exported chat as JSON');
  }, [messages]);

  const handleKeyPress = useCallback(
    (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  // --- Derived values ---
  const enabledProviderCount = providerStatuses.filter(
    (p) => p.enabled && !p.circuitOpen
  ).length;

  const connectionStatus =
    enabledProviderCount > 0
      ? { label: `${enabledProviderCount} provider${enabledProviderCount > 1 ? 's' : ''} active`, ok: true }
      : { label: 'Offline fallback', ok: false };

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <>
      {/* ------------------------------------------------------------------ */}
      {/* Inline Styles (ZEAZ Omega Design System)                           */}
      {/* ------------------------------------------------------------------ */}
      <style>{`
        :root {
          --color-bg-base: #07090f;
          --color-bg-surface: #0d1117;
          --color-bg-elevated: #161b24;
          --color-bg-glass: rgba(22, 27, 36, 0.85);
          --color-bg-hover: rgba(139, 92, 246, 0.08);
          --color-border: rgba(139, 92, 246, 0.15);
          --color-border-subtle: rgba(255, 255, 255, 0.06);
          --color-primary: #8b5cf6;
          --color-primary-hover: #7c3aed;
          --color-primary-glow: rgba(139, 92, 246, 0.3);
          --color-secondary: #06b6d4;
          --color-success: #10b981;
          --color-warning: #f59e0b;
          --color-error: #ef4444;
          --color-text: #e2e8f0;
          --color-text-muted: #64748b;
          --color-text-faint: #334155;
          --color-user-bubble: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          --color-assistant-bubble: rgba(22, 27, 36, 0.9);
          --font-family: 'Outfit', 'Inter', system-ui, sans-serif;
          --radius-sm: 8px;
          --radius-md: 12px;
          --radius-lg: 16px;
          --radius-xl: 24px;
          --shadow-glow: 0 0 20px var(--color-primary-glow);
          --transition: 200ms cubic-bezier(0.4, 0, 0.2, 1);
          --sidebar-width: 260px;
        }

        * { box-sizing: border-box; margin: 0; padding: 0; }

        body, html { height: 100%; background: var(--color-bg-base); }

        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .omega-root {
          display: flex;
          height: 100vh;
          font-family: var(--font-family);
          background: var(--color-bg-base);
          color: var(--color-text);
          overflow: hidden;
        }

        /* ---- Sidebar ---- */
        .sidebar {
          width: var(--sidebar-width);
          background: var(--color-bg-surface);
          border-right: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          backdrop-filter: blur(20px);
        }

        .sidebar-header {
          padding: 20px 16px 16px;
          border-bottom: 1px solid var(--color-border-subtle);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .sidebar-logo-icon {
          width: 32px;
          height: 32px;
          background: var(--color-user-bubble);
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          box-shadow: var(--shadow-glow);
        }

        .sidebar-title {
          font-size: 16px;
          font-weight: 700;
          color: var(--color-text);
          letter-spacing: -0.3px;
        }

        .sidebar-subtitle {
          font-size: 11px;
          color: var(--color-text-muted);
          margin-top: 2px;
        }

        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          border: none;
          cursor: pointer;
          font-family: var(--font-family);
          font-size: 13px;
          font-weight: 500;
          transition: all var(--transition);
          text-decoration: none;
          white-space: nowrap;
        }

        .btn-primary {
          background: var(--color-primary);
          color: white;
        }
        .btn-primary:hover { background: var(--color-primary-hover); box-shadow: var(--shadow-glow); transform: translateY(-1px); }

        .btn-ghost {
          background: transparent;
          color: var(--color-text-muted);
          border: 1px solid var(--color-border);
        }
        .btn-ghost:hover { background: var(--color-bg-hover); color: var(--color-text); }

        .btn-icon {
          background: transparent;
          color: var(--color-text-muted);
          padding: 6px;
          border-radius: var(--radius-sm);
        }
        .btn-icon:hover { background: var(--color-bg-hover); color: var(--color-text); }

        .btn-sm { padding: 6px 12px; font-size: 12px; }
        .btn-warning { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); border: 1px solid rgba(245, 158, 11, 0.3); }
        .btn-warning:hover { background: rgba(245, 158, 11, 0.25); }

        .btn-full { width: 100%; justify-content: center; }

        /* Provider status panel */
        .provider-panel-toggle {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          color: var(--color-text-muted);
          font-size: 12px;
          font-weight: 500;
          letter-spacing: 0.5px;
          text-transform: uppercase;
          transition: all var(--transition);
          background: transparent;
          border: none;
          width: 100%;
        }
        .provider-panel-toggle:hover { background: var(--color-bg-hover); color: var(--color-text); }

        .provider-panel {
          background: rgba(255,255,255,0.03);
          border-radius: var(--radius-sm);
          padding: 8px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .provider-status-row {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 6px;
          border-radius: var(--radius-sm);
          font-size: 12px;
          color: var(--color-text-muted);
          transition: background var(--transition);
        }
        .provider-status-row:hover { background: var(--color-bg-hover); }

        .provider-status-name { flex: 1; }

        .provider-status-badge {
          font-size: 10px;
          padding: 1px 6px;
          border-radius: 10px;
          font-weight: 500;
        }
        .badge-warning { background: rgba(245, 158, 11, 0.15); color: var(--color-warning); }
        .badge-disabled { background: rgba(100, 116, 139, 0.15); color: var(--color-text-muted); }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid var(--color-border-subtle);
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        /* ---- Main area ---- */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background: var(--color-bg-base);
          min-width: 0;
        }

        /* ---- Chat header ---- */
        .chat-header {
          padding: 14px 20px;
          border-bottom: 1px solid var(--color-border-subtle);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(13, 17, 23, 0.8);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }

        .chat-header-left { display: flex; align-items: center; gap: 12px; }

        .chat-title {
          font-size: 15px;
          font-weight: 600;
          color: var(--color-text);
        }

        .connection-badge {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          padding: 3px 8px;
          border-radius: 10px;
          font-weight: 500;
        }
        .connection-badge.ok {
          background: rgba(16, 185, 129, 0.1);
          color: var(--color-success);
          border: 1px solid rgba(16, 185, 129, 0.2);
        }
        .connection-badge.offline {
          background: rgba(245, 158, 11, 0.1);
          color: var(--color-warning);
          border: 1px solid rgba(245, 158, 11, 0.2);
        }

        .chat-header-right { display: flex; align-items: center; gap: 8px; }

        /* ---- Messages ---- */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          scroll-behavior: smooth;
        }

        .messages-container::-webkit-scrollbar { width: 4px; }
        .messages-container::-webkit-scrollbar-track { background: transparent; }
        .messages-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .message-wrapper {
          display: flex;
          animation: msgFadeIn 0.2s ease-out;
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .message-user { justify-content: flex-end; }
        .message-assistant { justify-content: flex-start; }

        .message-bubble {
          max-width: min(560px, 85%);
          padding: 12px 16px;
          border-radius: var(--radius-lg);
          position: relative;
        }

        .bubble-user {
          background: var(--color-user-bubble);
          color: white;
          border-bottom-right-radius: var(--radius-sm);
          box-shadow: 0 4px 16px rgba(139, 92, 246, 0.25);
        }

        .bubble-assistant {
          background: var(--color-bg-glass);
          border: 1px solid var(--color-border);
          color: var(--color-text);
          border-bottom-left-radius: var(--radius-sm);
          backdrop-filter: blur(12px);
        }

        .bubble-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-bottom-left-radius: var(--radius-sm);
        }

        .message-content {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        /* Provider badge */
        .provider-badge {
          display: flex;
          align-items: center;
          gap: 4px;
          margin-top: 8px;
          font-size: 10px;
          color: var(--color-primary);
          opacity: 0.7;
          transition: opacity var(--transition);
        }
        .provider-badge:hover { opacity: 1; }
        .badge-separator { color: var(--color-text-faint); }

        .message-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-top: 8px;
          opacity: 0;
          transition: opacity var(--transition);
        }
        .message-bubble:hover .message-meta { opacity: 1; }

        .copy-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: none;
          cursor: pointer;
          color: inherit;
          opacity: 0.5;
          padding: 2px;
          border-radius: 4px;
          transition: all var(--transition);
        }
        .copy-btn:hover { opacity: 1; background: rgba(255,255,255,0.1); }

        .message-time {
          font-size: 10px;
          opacity: 0.4;
        }

        /* Typing indicator */
        .typing-dots {
          display: flex;
          gap: 4px;
          padding: 4px 0;
          align-items: center;
        }
        .typing-dots span {
          width: 7px;
          height: 7px;
          background: var(--color-primary);
          border-radius: 50%;
          animation: typingBounce 1.4s infinite;
          opacity: 0.6;
        }
        .typing-dots span:nth-child(2) { animation-delay: 0.2s; }
        .typing-dots span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.6; }
          30% { transform: translateY(-6px); opacity: 1; }
        }

        /* Error banner */
        .error-banner {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          background: rgba(239, 68, 68, 0.08);
          border: 1px solid rgba(239, 68, 68, 0.2);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          margin: 0 20px;
          animation: msgFadeIn 0.2s ease-out;
        }
        .error-icon { color: var(--color-error); flex-shrink: 0; margin-top: 1px; }
        .error-content { flex: 1; }
        .error-title { font-size: 13px; font-weight: 600; color: var(--color-error); }
        .error-message { font-size: 12px; color: #fca5a5; margin-top: 2px; }

        /* ---- Input area ---- */
        .input-area {
          padding: 16px 20px;
          border-top: 1px solid var(--color-border-subtle);
          background: rgba(13, 17, 23, 0.8);
          backdrop-filter: blur(12px);
          flex-shrink: 0;
        }

        .input-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          background: var(--color-bg-elevated);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          padding: 12px 16px;
          font-family: var(--font-family);
          font-size: 14px;
          color: var(--color-text);
          outline: none;
          resize: none;
          min-height: 44px;
          max-height: 120px;
          transition: border-color var(--transition), box-shadow var(--transition);
          line-height: 1.5;
        }
        .chat-input::placeholder { color: var(--color-text-muted); }
        .chat-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }
        .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .send-btn {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--color-primary);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          transition: all var(--transition);
        }
        .send-btn:hover:not(:disabled) {
          background: var(--color-primary-hover);
          box-shadow: var(--shadow-glow);
          transform: translateY(-1px);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 8px;
        }

        .input-hint {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .rate-limit-indicator {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: var(--color-text-muted);
        }
        .rate-limit-low { color: var(--color-warning); }

        /* Settings drawer (simple overlay) */
        .settings-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .settings-drawer {
          background: var(--color-bg-surface);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: 24px;
          width: min(480px, 90vw);
          max-height: 80vh;
          overflow-y: auto;
        }

        .settings-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .settings-title {
          font-size: 17px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .settings-section { margin-bottom: 20px; }
        .settings-section-title {
          font-size: 11px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--color-text-muted);
          margin-bottom: 10px;
        }

        .settings-provider-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px 12px;
          background: var(--color-bg-elevated);
          border-radius: var(--radius-sm);
          margin-bottom: 4px;
          font-size: 13px;
        }
        .settings-provider-status { flex: 1; }
        .settings-provider-note { font-size: 11px; color: var(--color-text-muted); }

        .divider {
          height: 1px;
          background: var(--color-border-subtle);
          margin: 12px 0;
        }

        /* Responsive */
        @media (max-width: 640px) {
          .sidebar { display: none; }
          .messages-container { padding: 16px 12px; }
          .input-area { padding: 12px; }
          .chat-header { padding: 10px 12px; }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* Layout                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="omega-root">
        {/* ---- Sidebar ---- */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-logo">
              <div className="sidebar-logo-icon">🔱</div>
              <div>
                <div className="sidebar-title">Omega Chat</div>
                <div className="sidebar-subtitle">ZeaZ Platform · 9 providers</div>
              </div>
            </div>
          </div>

          <div className="sidebar-body">
            <button className="btn btn-primary btn-full" onClick={handleNewChat}>
              <Plus size={16} />
              New Chat
            </button>

            <div style={{ marginTop: '8px' }}>
              <button
                className="provider-panel-toggle"
                onClick={() => setShowProviderPanel((v) => !v)}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Activity size={13} />
                  Providers
                </span>
                <ChevronDown
                  size={13}
                  style={{
                    transform: showProviderPanel ? 'rotate(180deg)' : 'none',
                    transition: 'transform var(--transition)',
                  }}
                />
              </button>

              {showProviderPanel && (
                <div className="provider-panel">
                  {providerStatuses.map((s) => (
                    <ProviderStatusRow key={s.name} status={s} />
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="sidebar-footer">
            {ENABLE_EXPORT && (
              <>
                <button className="btn btn-ghost btn-full btn-sm" onClick={handleExportMarkdown}>
                  <Download size={13} />
                  Export Markdown
                </button>
                <button className="btn btn-ghost btn-full btn-sm" onClick={handleExportJSON}>
                  <Download size={13} />
                  Export JSON
                </button>
              </>
            )}
            <button className="btn btn-ghost btn-full btn-sm" onClick={() => setShowSettings(true)}>
              <Settings size={13} />
              Settings
            </button>
          </div>
        </aside>

        {/* ---- Main Chat Area ---- */}
        <div className="main-area">
          {/* Header */}
          <div className="chat-header">
            <div className="chat-header-left">
              <span className="chat-title">Chat</span>
              <div
                className={`connection-badge ${connectionStatus.ok ? 'ok' : 'offline'}`}
              >
                {connectionStatus.ok ? <Wifi size={10} /> : <WifiOff size={10} />}
                {connectionStatus.label}
              </div>
            </div>
            <div className="chat-header-right">
              <button
                className="btn btn-icon"
                onClick={handleNewChat}
                title="New chat"
                aria-label="New chat"
              >
                <Plus size={16} />
              </button>
              <button
                className="btn btn-icon"
                onClick={() => setShowSettings(true)}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                className="btn btn-icon"
                onClick={() => {
                  setMessages([WELCOME_MESSAGE]);
                  persistChat.clear();
                }}
                title="Clear chat"
                aria-label="Clear chat"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="messages-container">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                copiedId={copiedId}
                onCopy={copyToClipboard}
              />
            ))}

            {loading && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Error banner */}
          {error && <ErrorBanner error={error} onRetry={handleRetry} />}

          {/* Input area */}
          <div className="input-area">
            <div className="input-row">
              <textarea
                ref={inputRef}
                className="chat-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Ask anything… Shift+Enter for newline"
                disabled={loading}
                rows={1}
                id="omega-chat-input"
                aria-label="Message input"
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                title="Send message"
                aria-label="Send message"
                id="omega-chat-send"
              >
                {loading ? (
                  <RefreshCw size={18} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                ) : (
                  <Send size={18} />
                )}
              </button>
            </div>

            <div className="input-footer">
              <span className="input-hint">
                Fallback: Gemini → Groq → Cohere → HuggingFace → OpenRouter → Mistral → Together → Ollama → Offline
              </span>
              {rateLimiter && rateLimitRemaining !== null && (
                <span className={`rate-limit-indicator ${rateLimitRemaining <= 3 ? 'rate-limit-low' : ''}`}>
                  <Activity size={10} />
                  {rateLimitRemaining} req left
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ---- Settings Modal ---- */}
      {showSettings && (
        <div className="settings-overlay" onClick={() => setShowSettings(false)}>
          <div className="settings-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="settings-header">
              <div className="settings-title">
                <Settings size={18} />
                Settings
              </div>
              <button className="btn btn-icon" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="settings-section">
              <div className="settings-section-title">Provider Status</div>
              {providerStatuses.map((s) => (
                <div key={s.name} className="settings-provider-row">
                  <ProviderDot status={s} />
                  <div className="settings-provider-status">
                    <div>{s.name}</div>
                    <div className="settings-provider-note">
                      {s.circuitOpen
                        ? `Circuit open until ${s.openUntil ? new Date(s.openUntil).toLocaleTimeString() : '?'}`
                        : s.enabled
                        ? 'Active'
                        : 'No API key / disabled'}
                    </div>
                  </div>
                  {s.failures > 0 && (
                    <span className="provider-status-badge badge-warning">
                      {s.failures} fail{s.failures > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <div className="divider" />

            <div className="settings-section">
              <div className="settings-section-title">Session</div>
              <button className="btn btn-ghost btn-full" onClick={() => { handleNewChat(); setShowSettings(false); }}>
                <Plus size={14} />
                New Chat
              </button>
            </div>

            {ENABLE_EXPORT && (
              <>
                <div className="divider" />
                <div className="settings-section">
                  <div className="settings-section-title">Export</div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-ghost" onClick={handleExportMarkdown} style={{ flex: 1 }}>
                      <Download size={14} />
                      Markdown
                    </button>
                    <button className="btn btn-ghost" onClick={handleExportJSON} style={{ flex: 1 }}>
                      <Download size={14} />
                      JSON
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="divider" />

            <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', lineHeight: 1.6 }}>
              <strong>Setup:</strong> Add API keys to <code>.env.local</code>.<br />
              See <code>PROVIDER_SETUP.md</code> for step-by-step instructions.<br />
              Recommended: Gemini + Groq (both free, no credit card).
            </div>
          </div>
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
