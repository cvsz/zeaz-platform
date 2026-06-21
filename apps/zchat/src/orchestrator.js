/**
 * @file orchestrator.js
 * @description Master Omega strategy orchestrator.
 *
 * Iterates through the enabled provider adapters in priority order.
 * Each provider is wrapped with:
 *   - Circuit breaker (skip OPEN circuits)
 *   - Timeout (Promise.race)
 *   - Verbose logging
 *
 * Returns: { content, source, latencyMs, success: true }
 * Throws:  Error if all providers fail
 */

import { CircuitBreaker } from './circuitBreaker.js';
import { log } from './logger.js';
import { ALL_ADAPTERS } from './providers.js';

function getCircuitBreakerThreshold() {
  return (
    parseInt(process.env.REACT_APP_FALLBACK_CIRCUIT_BREAKER_THRESHOLD, 10) || 3
  );
}

function getCircuitBreakerCooldownMs() {
  return (
    parseInt(process.env.REACT_APP_FALLBACK_CIRCUIT_BREAKER_COOLDOWN_MS, 10) ||
    60000
  );
}

/**
 * Module-level circuit breaker registry.
 * One CircuitBreaker instance per provider name, persisting across calls.
 * @type {Record<string, CircuitBreaker>}
 */
const breakerRegistry = {};

/**
 * Get (or create) the circuit breaker for a given provider name.
 * @param {string} name
 * @returns {CircuitBreaker}
 */
function getBreaker(name) {
  if (!breakerRegistry[name]) {
    breakerRegistry[name] = new CircuitBreaker(
      name,
      getCircuitBreakerThreshold(),
      getCircuitBreakerCooldownMs()
    );
    log.debug('ORCHESTRATOR', `Registered circuit breaker for provider="${name}"`, {
      threshold: getCircuitBreakerThreshold(),
      cooldownMs: getCircuitBreakerCooldownMs(),
    });
  }
  return breakerRegistry[name];
}

/**
 * Execute an AI request across the full provider fallback chain.
 *
 * @param {string} message - The user's current message
 * @param {Array<{role: string, content: string}>} [history=[]] - Previous conversation turns
 * @returns {Promise<{content: string, source: string, latencyMs: number, success: true}>}
 * @throws {Error} If all enabled providers fail
 */
export async function callAIWithFallback(message, history = []) {
  const enabledAdapters = ALL_ADAPTERS.filter((a) => a.enabled);

  log.info(
    'ORCHESTRATOR',
    `Starting fallback chain — ${enabledAdapters.length} providers enabled (${ALL_ADAPTERS.length} total)`,
    { providers: enabledAdapters.map((a) => a.name) }
  );
  log.debug('ORCHESTRATOR', 'Message preview', {
    charCount: message.length,
    historyTurns: history.length,
  });

  if (enabledAdapters.length === 0) {
    log.warn('ORCHESTRATOR', 'No providers enabled — will use smart offline adapter');
  }

  let lastError = null;

  for (const adapter of enabledAdapters) {
    const breaker = getBreaker(adapter.name);

    // --- Circuit breaker check ---
    if (breaker.isOpen()) {
      log.warn(
        'ORCHESTRATOR',
        `Skipping provider="${adapter.name}" — circuit breaker OPEN`,
        {
          openUntil: breaker.getOpenUntilISO(),
          consecutiveFailures: breaker.getFailureCount(),
        }
      );
      continue;
    }

    const startMs = Date.now();
    log.debug('ORCHESTRATOR', `Attempting provider="${adapter.name}"`, {
      timeoutMs: adapter.timeout,
    });

    try {
      const content = await Promise.race([
        adapter.call(message, history),
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error(`Timeout after ${adapter.timeout}ms`)),
            adapter.timeout
          )
        ),
      ]);

      const latencyMs = Date.now() - startMs;
      breaker.recordSuccess();

      log.info(
        'ORCHESTRATOR',
        `✅ SUCCESS provider="${adapter.name}" latency=${latencyMs}ms`
      );

      return {
        content,
        source: adapter.name,
        latencyMs,
        success: true,
      };
    } catch (err) {
      const latencyMs = Date.now() - startMs;
      breaker.recordFailure();
      lastError = err;

      log.error(
        'ORCHESTRATOR',
        `❌ FAILED provider="${adapter.name}" latency=${latencyMs}ms failures=${breaker.getFailureCount()}`,
        err
      );
    }
  }

  const failMessage = `All ${enabledAdapters.length} provider(s) failed. Last error: ${lastError?.message ?? 'unknown'}`;
  log.error('ORCHESTRATOR', failMessage);
  throw new Error(failMessage);
}

/**
 * Get current status of all providers (for UI status panel).
 * @returns {Array<{name: string, enabled: boolean, circuitOpen: boolean, failures: number, openUntil: string|null}>}
 */
export function getProviderStatuses() {
  return ALL_ADAPTERS.map((adapter) => {
    const breaker = breakerRegistry[adapter.name];
    return {
      name: adapter.name,
      enabled: adapter.enabled,
      circuitOpen: breaker ? breaker.isOpen() : false,
      failures: breaker ? breaker.getFailureCount() : 0,
      openUntil: breaker ? breaker.getOpenUntilISO() : null,
    };
  });
}

export default callAIWithFallback;
