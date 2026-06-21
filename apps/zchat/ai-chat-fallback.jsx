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
  DEFAULT_HUGGINGFACE_FREE_MODELS,
  getHuggingFaceModelCandidatesSource,
  getResolvedHuggingFaceModelCandidates,
  resetHuggingFaceModelCandidates,
  saveHuggingFaceModelCandidates,
} from './src/huggingFaceModels';
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

const QUICK_PROMPTS = [
  'Draft a concise project update for the team',
  'Compare the free model options I can use here',
  'Summarize the last reply into action items',
  'Help me debug a React UI issue step by step',
];

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
 * Hugging Face model order manager shown in settings.
 */
function HuggingFaceModelManager({
  candidates,
  source,
  selectedModel,
  onSelectedModelChange,
  onAddModel,
  onMoveModel,
  onRemoveModel,
  onResetModels,
}) {
  const availableModels = DEFAULT_HUGGINGFACE_FREE_MODELS.filter(
    (model) => !candidates.includes(model)
  );

  return (
    <div className="hf-model-manager">
      <div className="hf-model-manager-header">
        <div>
          <div className="hf-model-manager-title">Hugging Face model order</div>
          <div className="hf-model-manager-note">
            Top to bottom. The provider tries the first model, then continues down the list.
          </div>
        </div>
        <span className="provider-status-badge badge-info">
          {source === 'saved' ? 'Saved in browser' : source === 'env' ? 'From env' : 'Default chain'}
        </span>
      </div>

      <div className="hf-model-picker">
        <select
          className="hf-model-select"
          value={selectedModel}
          onChange={(e) => onSelectedModelChange(e.target.value)}
        >
          <option value="">Add a free/open model</option>
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => onAddModel(selectedModel)}
          disabled={!selectedModel}
        >
          <Plus size={12} />
          Add
        </button>
        <button className="btn btn-ghost btn-sm" onClick={onResetModels}>
          Reset
        </button>
      </div>

      <div className="hf-model-list">
        {candidates.map((model, index) => (
          <div key={model} className="hf-model-row">
            <div className="hf-model-row-label">
              <span className="hf-model-index">{index + 1}</span>
              <span className="hf-model-name">{model}</span>
            </div>
            <div className="hf-model-row-actions">
              <button
                className="btn btn-icon hf-model-icon-btn"
                onClick={() => onMoveModel(index, -1)}
                disabled={index === 0}
                aria-label={`Move ${model} up`}
                title="Move up"
              >
                ↑
              </button>
              <button
                className="btn btn-icon hf-model-icon-btn"
                onClick={() => onMoveModel(index, 1)}
                disabled={index === candidates.length - 1}
                aria-label={`Move ${model} down`}
                title="Move down"
              >
                ↓
              </button>
              <button
                className="btn btn-icon hf-model-icon-btn hf-model-remove"
                onClick={() => onRemoveModel(model)}
                aria-label={`Remove ${model}`}
                title="Remove"
              >
                ×
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="hf-model-footer">
        <span>
          You can also save a custom order in your browser. The provider uses this before env defaults.
        </span>
        <span>{availableModels.length} models available to add</span>
      </div>
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
  const isWelcome = Boolean(message.isWelcome);

  return (
    <div
      className={`message-wrapper ${
        isUser ? 'message-user' : 'message-assistant'
      } ${isWelcome ? 'message-welcome' : ''}`}
    >
      <div
        className={`message-bubble ${
          isUser
            ? 'bubble-user'
            : isError
            ? 'bubble-error'
            : isWelcome
            ? 'bubble-welcome'
            : 'bubble-assistant'
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
  const [hfModelCandidates, setHfModelCandidates] = useState(() =>
    getResolvedHuggingFaceModelCandidates()
  );
  const [hfModelSource, setHfModelSource] = useState(() =>
    getHuggingFaceModelCandidatesSource()
  );
  const [hfModelPicker, setHfModelPicker] = useState('');
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

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    el.style.height = 'auto';
    const nextHeight = Math.min(el.scrollHeight, 160);
    el.style.height = `${nextHeight}px`;
  }, [input]);

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

  useEffect(() => {
    if (!showSettings) return;

    const resolvedCandidates = getResolvedHuggingFaceModelCandidates();
    setHfModelCandidates(resolvedCandidates);
    setHfModelSource(getHuggingFaceModelCandidatesSource());
    setHfModelPicker((current) =>
      resolvedCandidates.includes(current) ? current : ''
    );
  }, [showSettings]);

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

  const handlePromptPick = useCallback((prompt) => {
    setInput(prompt);
    setError(null);
    inputRef.current?.focus();
  }, []);

  const handleNewChat = useCallback(() => {
    setMessages([WELCOME_MESSAGE]);
    setInput('');
    persistChat.clear();
    setError(null);
    rateLimiter?.reset();
    setRateLimitRemaining(rateLimiter ? rateLimiter.remaining() : null);
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
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

  const commitHuggingFaceModelCandidates = useCallback((nextCandidates) => {
    const normalized = saveHuggingFaceModelCandidates(nextCandidates);
    setHfModelCandidates(normalized);
    setHfModelSource(normalized.length > 0 ? 'saved' : getHuggingFaceModelCandidatesSource());
    setHfModelPicker((current) => (normalized.includes(current) ? current : ''));
  }, []);

  const handleAddHuggingFaceModel = useCallback((model) => {
    if (!model) return;
    commitHuggingFaceModelCandidates([...hfModelCandidates, model]);
    setHfModelPicker('');
  }, [commitHuggingFaceModelCandidates, hfModelCandidates]);

  const handleMoveHuggingFaceModel = useCallback((index, delta) => {
    const targetIndex = index + delta;
    if (targetIndex < 0 || targetIndex >= hfModelCandidates.length) return;

    const next = [...hfModelCandidates];
    const [moved] = next.splice(index, 1);
    next.splice(targetIndex, 0, moved);
    commitHuggingFaceModelCandidates(next);
  }, [commitHuggingFaceModelCandidates, hfModelCandidates]);

  const handleRemoveHuggingFaceModel = useCallback((model) => {
    commitHuggingFaceModelCandidates(hfModelCandidates.filter((item) => item !== model));
  }, [commitHuggingFaceModelCandidates, hfModelCandidates]);

  const handleResetHuggingFaceModels = useCallback(() => {
    resetHuggingFaceModelCandidates();
    const resolvedCandidates = getResolvedHuggingFaceModelCandidates();
    setHfModelCandidates(resolvedCandidates);
    setHfModelSource(getHuggingFaceModelCandidatesSource());
    setHfModelPicker('');
  }, []);

  // --- Derived values ---
  const enabledProviderCount = providerStatuses.filter(
    (p) => p.enabled && !p.circuitOpen
  ).length;

  const connectionStatus =
    enabledProviderCount > 0
      ? { label: `${enabledProviderCount} provider${enabledProviderCount > 1 ? 's' : ''} active`, ok: true }
      : { label: 'Offline fallback', ok: false };

  const visibleProviders = providerStatuses.filter((provider) => provider.enabled);
  const favoritePromptCount = QUICK_PROMPTS.length;

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
          background:
            radial-gradient(circle at top left, rgba(139, 92, 246, 0.16), transparent 32%),
            radial-gradient(circle at top right, rgba(6, 182, 212, 0.12), transparent 28%),
            linear-gradient(180deg, #05070c 0%, #07090f 50%, #04050a 100%);
          color: var(--color-text);
          overflow: hidden;
          position: relative;
        }

        .omega-root::before,
        .omega-root::after {
          content: '';
          position: absolute;
          inset: auto;
          pointer-events: none;
          border-radius: 999px;
          filter: blur(36px);
          opacity: 0.45;
        }

        .omega-root::before {
          width: 320px;
          height: 320px;
          left: -120px;
          bottom: -120px;
          background: rgba(139, 92, 246, 0.18);
        }

        .omega-root::after {
          width: 280px;
          height: 280px;
          right: -100px;
          top: 72px;
          background: rgba(6, 182, 212, 0.12);
        }

        .omega-aura {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 50% 10%, rgba(139, 92, 246, 0.08), transparent 28%),
            radial-gradient(circle at 80% 80%, rgba(6, 182, 212, 0.06), transparent 24%);
          pointer-events: none;
          z-index: 0;
        }

        /* ---- Sidebar ---- */
        .sidebar {
          width: var(--sidebar-width);
          background: linear-gradient(180deg, rgba(13, 17, 23, 0.94), rgba(9, 12, 18, 0.82));
          border-right: 1px solid rgba(139, 92, 246, 0.12);
          display: flex;
          flex-direction: column;
          flex-shrink: 0;
          backdrop-filter: blur(24px);
          position: relative;
          z-index: 1;
          box-shadow: inset -1px 0 0 rgba(255,255,255,0.02);
        }

        .sidebar-header {
          padding: 20px 16px 16px;
          border-bottom: 1px solid rgba(255,255,255,0.04);
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 4px;
        }

        .sidebar-logo-icon {
          width: 38px;
          height: 38px;
          background:
            radial-gradient(circle at 30% 30%, rgba(255,255,255,0.2), transparent 34%),
            linear-gradient(135deg, #8b5cf6 0%, #6366f1 50%, #06b6d4 100%);
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          box-shadow: 0 12px 28px rgba(99, 102, 241, 0.28);
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

        .sidebar-summary {
          margin: 0 12px 12px;
          padding: 14px;
          border-radius: 18px;
          background:
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02)),
            rgba(13, 17, 23, 0.7);
          border: 1px solid rgba(255,255,255,0.06);
          box-shadow: 0 12px 40px rgba(0,0,0,0.24);
        }

        .sidebar-summary-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 12px;
        }

        .sidebar-summary-label {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
        }

        .sidebar-summary-value {
          margin-top: 4px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: -0.02em;
        }

        .sidebar-summary-subvalue {
          margin-top: 4px;
          font-size: 12px;
          line-height: 1.5;
          color: var(--color-text-muted);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
        }

        .summary-grid-spaced {
          margin-top: 12px;
        }

        .summary-card {
          padding: 10px 12px;
          border-radius: 14px;
          background: rgba(7, 9, 15, 0.5);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .summary-card-label {
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          color: var(--color-text-muted);
        }

        .summary-card-value {
          margin-top: 4px;
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
          line-height: 1.35;
        }

        .sidebar-body {
          flex: 1;
          overflow-y: auto;
          padding: 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .sidebar-provider-toggle-wrap {
          margin-top: 8px;
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
          min-height: 40px;
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
          border-radius: 14px;
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

        .provider-panel-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }

        .provider-chevron {
          transition: transform var(--transition);
        }

        .provider-chevron.open {
          transform: rotate(180deg);
        }

        .provider-panel {
          background: rgba(255,255,255,0.03);
          border-radius: 16px;
          padding: 10px;
          display: flex;
          flex-direction: column;
          gap: 4px;
          margin-top: 8px;
          border: 1px solid rgba(255,255,255,0.04);
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
        .badge-info { background: rgba(6, 182, 212, 0.12); color: var(--color-secondary); }

        .sidebar-footer {
          padding: 12px;
          border-top: 1px solid rgba(255,255,255,0.04);
          display: flex;
          flex-direction: column;
          gap: 6px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.01));
        }

        /* ---- Main area ---- */
        .main-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          background:
            linear-gradient(180deg, rgba(8, 11, 18, 0.82), rgba(8, 10, 16, 0.96));
          min-width: 0;
          position: relative;
          z-index: 1;
        }

        /* ---- Chat header ---- */
        .chat-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: rgba(10, 13, 19, 0.82);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
          box-shadow: inset 0 -1px 0 rgba(255,255,255,0.02);
        }

        .chat-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .header-copy {
          min-width: 0;
        }

        .chat-title {
          font-size: 15px;
          font-weight: 700;
          color: var(--color-text);
        }

        .chat-subtitle {
          margin-top: 2px;
          font-size: 11px;
          color: var(--color-text-muted);
          line-height: 1.45;
        }

        .chat-header-badges {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-top: 8px;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 5px 10px;
          border-radius: 999px;
          font-size: 11px;
          color: var(--color-text-muted);
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
        }

        .status-pill.ok {
          border-color: rgba(16, 185, 129, 0.18);
          background: rgba(16, 185, 129, 0.08);
        }

        .status-pill.offline {
          border-color: rgba(245, 158, 11, 0.18);
          background: rgba(245, 158, 11, 0.08);
        }

        .status-pill strong {
          color: var(--color-text);
          font-weight: 600;
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

        .header-action {
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.03);
          color: var(--color-text);
        }
        .header-action:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(139, 92, 246, 0.2);
        }

        /* ---- Messages ---- */
        .messages-container {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px 20px;
          display: flex;
          flex-direction: column;
          gap: 14px;
          scroll-behavior: smooth;
        }

        .messages-container::-webkit-scrollbar { width: 4px; }
        .messages-container::-webkit-scrollbar-track { background: transparent; }
        .messages-container::-webkit-scrollbar-thumb { background: var(--color-border); border-radius: 2px; }

        .message-wrapper {
          display: flex;
          animation: msgFadeIn 0.28s ease-out;
        }
        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .message-user { justify-content: flex-end; }
        .message-assistant { justify-content: flex-start; }

        .message-bubble {
          max-width: min(560px, 85%);
          padding: 13px 16px;
          border-radius: var(--radius-lg);
          position: relative;
        }

        .bubble-user {
          background:
            radial-gradient(circle at top right, rgba(255,255,255,0.16), transparent 30%),
            linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
          color: white;
          border-bottom-right-radius: 10px;
          box-shadow: 0 14px 40px rgba(99, 102, 241, 0.24);
        }

        .bubble-assistant {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
            rgba(16, 21, 31, 0.88);
          border: 1px solid rgba(139, 92, 246, 0.12);
          color: var(--color-text);
          border-bottom-left-radius: 10px;
          backdrop-filter: blur(18px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.22);
        }

        .bubble-error {
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.3);
          color: #fca5a5;
          border-bottom-left-radius: 10px;
        }

        .bubble-welcome {
          max-width: min(700px, 92%);
          padding: 18px 18px 16px;
          background:
            radial-gradient(circle at top left, rgba(139, 92, 246, 0.22), transparent 40%),
            linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03)),
            rgba(16, 21, 31, 0.92);
          border: 1px solid rgba(139, 92, 246, 0.2);
          box-shadow: 0 18px 60px rgba(99, 102, 241, 0.18);
        }

        .message-content {
          font-size: 14px;
          line-height: 1.6;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-welcome .message-content {
          font-size: 15px;
          line-height: 1.65;
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

        .message-welcome .message-meta {
          opacity: 1;
        }

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
          margin: 0 20px 12px;
          animation: msgFadeIn 0.2s ease-out;
        }
        .error-icon { color: var(--color-error); flex-shrink: 0; margin-top: 1px; }
        .error-content { flex: 1; }
        .error-title { font-size: 13px; font-weight: 600; color: var(--color-error); }
        .error-message { font-size: 12px; color: #fca5a5; margin-top: 2px; }

        /* ---- Input area ---- */
        .input-area {
          padding: 16px 20px 18px;
          border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(10, 13, 19, 0.82);
          backdrop-filter: blur(20px);
          flex-shrink: 0;
        }

        .composer-shell {
          background:
            linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02)),
            rgba(16, 21, 31, 0.74);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 24px;
          padding: 14px;
          box-shadow: 0 18px 50px rgba(0,0,0,0.24);
        }

        .input-row {
          display: flex;
          gap: 10px;
          align-items: flex-end;
        }

        .chat-input {
          flex: 1;
          background: rgba(7, 9, 15, 0.72);
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-radius: 18px;
          padding: 14px 16px;
          font-family: var(--font-family);
          font-size: 14px;
          color: var(--color-text);
          outline: none;
          resize: none;
          min-height: 44px;
          max-height: 160px;
          overflow-y: hidden;
          scrollbar-width: none;
          transition: border-color var(--transition), box-shadow var(--transition), background var(--transition);
          line-height: 1.5;
        }
        .chat-input::-webkit-scrollbar {
          display: none;
        }
        .chat-input::placeholder { color: var(--color-text-muted); }
        .chat-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15);
          background: rgba(10, 13, 19, 0.9);
        }
        .chat-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .send-btn {
          width: 50px;
          height: 50px;
          border-radius: 18px;
          background:
            radial-gradient(circle at 30% 20%, rgba(255,255,255,0.18), transparent 26%),
            linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%);
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          flex-shrink: 0;
          transition: all var(--transition);
          box-shadow: 0 14px 32px rgba(99, 102, 241, 0.28);
        }
        .send-btn:hover:not(:disabled) {
          box-shadow: 0 16px 40px rgba(99, 102, 241, 0.35);
          transform: translateY(-1px);
        }
        .send-btn:disabled { opacity: 0.4; cursor: not-allowed; transform: none; }

        .input-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-top: 10px;
          gap: 12px;
          flex-wrap: wrap;
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

        .prompt-rail {
          padding: 18px 20px 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .prompt-rail-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .prompt-rail-title {
          font-size: 12px;
          text-transform: uppercase;
          letter-spacing: 0.14em;
          color: var(--color-text-muted);
        }

        .prompt-rail-note {
          font-size: 11px;
          color: var(--color-text-muted);
        }

        .prompt-chips {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .prompt-chip {
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          color: var(--color-text);
          border-radius: 999px;
          padding: 9px 12px;
          font-size: 12px;
          transition: all var(--transition);
        }

        .prompt-chip:hover {
          background: rgba(139, 92, 246, 0.11);
          border-color: rgba(139, 92, 246, 0.18);
          transform: translateY(-1px);
        }

        /* Settings drawer (simple overlay) */
        .settings-overlay {
          position: fixed;
          inset: 0;
          background: rgba(2, 4, 10, 0.68);
          backdrop-filter: blur(14px);
          z-index: 100;
          display: flex;
          align-items: stretch;
          justify-content: flex-end;
          animation: fadeIn 0.15s ease-out;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        .settings-drawer {
          background:
            linear-gradient(180deg, rgba(16, 21, 31, 0.97), rgba(11, 14, 21, 0.96));
          border-left: 1px solid rgba(139, 92, 246, 0.12);
          padding: 22px;
          width: min(720px, 100vw);
          max-height: 100vh;
          overflow-y: auto;
          box-shadow: -24px 0 60px rgba(0,0,0,0.4);
          backdrop-filter: blur(24px);
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
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 16px;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .settings-provider-status { flex: 1; }
        .settings-provider-note { font-size: 11px; color: var(--color-text-muted); }

        .hf-model-manager {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 14px;
          border-radius: 20px;
          background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05);
        }

        .hf-model-manager-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .hf-model-manager-title {
          font-size: 13px;
          font-weight: 600;
          color: var(--color-text);
        }

        .hf-model-manager-note,
        .hf-model-footer {
          font-size: 11px;
          color: var(--color-text-muted);
          line-height: 1.5;
        }

        .hf-model-picker {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 8px;
          align-items: center;
        }

        .hf-model-select {
          width: 100%;
          min-width: 0;
          background: rgba(7, 9, 15, 0.72);
          border: 1px solid rgba(139, 92, 246, 0.12);
          border-radius: 14px;
          padding: 10px 12px;
          color: var(--color-text);
          font-family: var(--font-family);
          font-size: 13px;
          outline: none;
        }

        .hf-model-select:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px var(--color-primary-glow);
        }

        .hf-model-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          max-height: 340px;
          overflow: auto;
          padding-right: 2px;
        }

        .hf-model-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          padding: 10px 12px;
          background: rgba(7, 9, 15, 0.55);
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.04);
        }

        .hf-model-row:hover {
          border-color: var(--color-border);
        }

        .hf-model-row-label {
          display: flex;
          align-items: center;
          gap: 8px;
          min-width: 0;
          flex: 1;
        }

        .hf-model-index {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: rgba(139, 92, 246, 0.15);
          color: var(--color-primary);
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .hf-model-name {
          font-size: 12px;
          color: var(--color-text);
          word-break: break-word;
        }

        .hf-model-row-actions {
          display: flex;
          align-items: center;
          gap: 4px;
          flex-shrink: 0;
        }

        .hf-model-icon-btn {
          width: 28px;
          height: 28px;
          padding: 0;
          justify-content: center;
          border-radius: 8px;
          font-size: 14px;
        }

        .hf-model-icon-btn:disabled {
          opacity: 0.35;
          cursor: not-allowed;
          transform: none;
        }

        .hf-model-remove {
          color: var(--color-warning);
        }

        .hf-model-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }

        .settings-footer-note {
          margin-top: 16px;
          padding: 14px;
          border-radius: 16px;
          border: 1px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.03);
          font-size: 12px;
          color: var(--color-text-muted);
          line-height: 1.6;
        }

        .settings-export-row {
          display: flex;
          gap: 8px;
        }

        .settings-export-btn {
          flex: 1;
        }

        .divider {
          height: 1px;
          background: rgba(255,255,255,0.06);
          margin: 12px 0;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        /* Responsive */
        @media (max-width: 1080px) {
          .sidebar {
            width: 236px;
          }
        }

        @media (max-width: 640px) {
          .sidebar { display: none; }
          .messages-container { padding: 16px 12px 16px; }
          .input-area { padding: 12px; }
          .chat-header { padding: 12px; align-items: flex-start; }
          .chat-header-left { flex-direction: column; align-items: flex-start; gap: 8px; }
          .chat-header-right { gap: 6px; }
          .header-action { padding: 8px; }
          .prompt-rail { padding: 14px 12px 0; }
          .message-bubble { max-width: 94%; }
          .composer-shell { padding: 12px; border-radius: 18px; }
          .input-row { align-items: stretch; }
          .send-btn { width: 46px; height: 46px; border-radius: 16px; }
          .settings-drawer {
            width: 100vw;
            border-left: none;
            padding: 18px 14px;
          }
          .hf-model-picker {
            grid-template-columns: 1fr;
          }
          .hf-model-footer {
            flex-direction: column;
            align-items: flex-start;
          }
        }
      `}</style>

      {/* ------------------------------------------------------------------ */}
      {/* Layout                                                               */}
      {/* ------------------------------------------------------------------ */}
      <div className="omega-root">
        <div className="omega-aura" aria-hidden="true" />
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

          <div className="sidebar-summary">
            <div className="sidebar-summary-top">
              <div>
                <div className="sidebar-summary-label">Session</div>
                <div className="sidebar-summary-value">
                  {messages.length} turns
                </div>
              </div>
              <span className={`connection-badge ${connectionStatus.ok ? 'ok' : 'offline'}`}>
                {connectionStatus.ok ? <Wifi size={10} /> : <WifiOff size={10} />}
                {connectionStatus.ok ? 'Online' : 'Offline'}
              </span>
            </div>
            <div className="sidebar-summary-subvalue">
              Premium fallback keeps the conversation alive across provider failures.
            </div>
            <div className="summary-grid summary-grid-spaced">
              <div className="summary-card">
                <div className="summary-card-label">Providers</div>
                <div className="summary-card-value">{enabledProviderCount}/{providerStatuses.length || 0} active</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">HF Chain</div>
                <div className="summary-card-value">{hfModelSource}</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Prompt Deck</div>
                <div className="summary-card-value">{favoritePromptCount} quick starts</div>
              </div>
              <div className="summary-card">
                <div className="summary-card-label">Rate Limit</div>
                <div className="summary-card-value">
                  {rateLimitRemaining !== null ? `${rateLimitRemaining} left` : 'Off'}
                </div>
              </div>
            </div>
          </div>

          <div className="sidebar-body">
            <button className="btn btn-primary btn-full" onClick={handleNewChat}>
              <Plus size={16} />
              New Chat
            </button>

            <div className="sidebar-provider-toggle-wrap">
              <button
                className="provider-panel-toggle"
                onClick={() => setShowProviderPanel((v) => !v)}
              >
                <span className="provider-panel-label">
                  <Activity size={13} />
                  Providers
                </span>
                <ChevronDown
                  size={13}
                  className={`provider-chevron ${showProviderPanel ? 'open' : ''}`}
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
              <div className="header-copy">
                <div className="chat-title">Omega Chat</div>
                <div className="chat-subtitle">
                  Premium fallback messaging with tuned provider order and browser-saved Hugging Face preferences.
                </div>
                <div className="chat-header-badges">
                  <span className={`status-pill ${connectionStatus.ok ? 'ok' : 'offline'}`}>
                    {connectionStatus.ok ? <Wifi size={10} /> : <WifiOff size={10} />}
                    <strong>{connectionStatus.label}</strong>
                  </span>
                  <span className="status-pill">
                    <Activity size={10} />
                    <strong>{visibleProviders.length}</strong> enabled providers
                  </span>
                  <span className="status-pill">
                    <Clock size={10} />
                    HF source: <strong>{hfModelSource}</strong>
                  </span>
                </div>
              </div>
            </div>
            <div className="chat-header-right">
              <button
                className="btn btn-icon header-action"
                onClick={handleNewChat}
                title="New chat"
                aria-label="New chat"
              >
                <Plus size={16} />
              </button>
              <button
                className="btn btn-icon header-action"
                onClick={() => setShowSettings(true)}
                title="Settings"
                aria-label="Settings"
              >
                <Settings size={16} />
              </button>
              <button
                className="btn btn-icon header-action"
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

          <div className="prompt-rail">
            <div className="prompt-rail-header">
              <div className="prompt-rail-title">Quick prompts</div>
              <div className="prompt-rail-note">
                Tap a prompt to preload the composer, then edit before sending.
              </div>
            </div>
            <div className="prompt-chips">
              {QUICK_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className="prompt-chip"
                  onClick={() => handlePromptPick(prompt)}
                >
                  {prompt}
                </button>
              ))}
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
            <div className="composer-shell">
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
                    <RefreshCw size={18} className="spin" />
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
              <div className="settings-section-title">Hugging Face Models</div>
              <HuggingFaceModelManager
                candidates={hfModelCandidates}
                source={hfModelSource}
                selectedModel={hfModelPicker}
                onSelectedModelChange={setHfModelPicker}
                onAddModel={handleAddHuggingFaceModel}
                onMoveModel={handleMoveHuggingFaceModel}
                onRemoveModel={handleRemoveHuggingFaceModel}
                onResetModels={handleResetHuggingFaceModels}
              />
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
                  <div className="settings-export-row">
                    <button className="btn btn-ghost settings-export-btn" onClick={handleExportMarkdown}>
                      <Download size={14} />
                      Markdown
                    </button>
                    <button className="btn btn-ghost settings-export-btn" onClick={handleExportJSON}>
                      <Download size={14} />
                      JSON
                    </button>
                  </div>
                </div>
              </>
            )}

            <div className="divider" />

            <div className="settings-footer-note">
              <strong>Setup:</strong> Add API keys to <code>.env.local</code>.<br />
              See <code>PROVIDER_SETUP.md</code> for step-by-step instructions.<br />
              Recommended: Gemini + Groq for the fastest free fallback coverage.
            </div>
          </div>
        </div>
      )}

      {/* Spin keyframe */}
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
}
