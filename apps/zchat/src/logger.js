/**
 * @file logger.js
 * @description Structured verbose logger for Master Omega AI Chat Fallback.
 * Format: [OMEGA-CHAT][PROVIDER][LEVEL] message
 *
 * Usage:
 *   import { log } from './logger';
 *   log.debug('GEMINI', 'Calling model', { model });
 *   log.error('ORCHESTRATOR', 'Provider failed', err);
 */

function isDebugEnabled() {
  return process.env.REACT_APP_DEBUG === 'true';
}

/**
 * Format a structured log prefix.
 * @param {string} provider - Provider or module name (e.g. 'GEMINI', 'ORCHESTRATOR')
 * @param {string} level - Log level label
 * @returns {string}
 */
function prefix(provider, level) {
  return `[OMEGA-CHAT][${provider.toUpperCase()}][${level}]`;
}

export const log = {
  /**
   * Debug-level log — only emitted when REACT_APP_DEBUG=true.
   * Use for verbose tracing: request payloads, timing, intermediate state.
   * @param {string} provider
   * @param {string} msg
   * @param {*} [data]
   */
  debug(provider, msg, data) {
    if (!isDebugEnabled()) return;
    if (data !== undefined) {
      console.debug(prefix(provider, 'DEBUG'), msg, data);
    } else {
      console.debug(prefix(provider, 'DEBUG'), msg);
    }
  },

  /**
   * Info-level log — emitted in all environments.
   * Use for provider success, strategy selection, key lifecycle events.
   * @param {string} provider
   * @param {string} msg
   * @param {*} [data]
   */
  info(provider, msg, data) {
    if (data !== undefined) {
      console.info(prefix(provider, 'INFO'), msg, data);
    } else {
      console.info(prefix(provider, 'INFO'), msg);
    }
  },

  /**
   * Warn-level log — emitted in all environments.
   * Use for circuit breaker open, rate limit approach, degraded mode.
   * @param {string} provider
   * @param {string} msg
   * @param {*} [data]
   */
  warn(provider, msg, data) {
    if (data !== undefined) {
      console.warn(prefix(provider, 'WARN'), msg, data);
    } else {
      console.warn(prefix(provider, 'WARN'), msg);
    }
  },

  /**
   * Error-level log — emitted in all environments.
   * IMPORTANT: Never log API key values. Only log error.message or status codes.
   * @param {string} provider
   * @param {string} msg
   * @param {Error|string|null} [err]
   */
  error(provider, msg, err) {
    const errDetail = err instanceof Error ? err.message : (err ?? '');
    if (errDetail) {
      console.error(prefix(provider, 'ERROR'), msg, errDetail);
    } else {
      console.error(prefix(provider, 'ERROR'), msg);
    }
  },
};

export default log;
