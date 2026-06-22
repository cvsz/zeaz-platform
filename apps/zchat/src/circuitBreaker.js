/**
 * @file circuitBreaker.js
 * @description Per-provider circuit breaker for Master Omega fallback chain.
 *
 * States:
 *   CLOSED  — provider is healthy, requests flow normally
 *   OPEN    — provider failed too many times, skip it for cooldownMs
 *   HALF-OPEN — cooldown expired, next request is a probe (auto-reset)
 *
 * Usage:
 *   const cb = new CircuitBreaker('Gemini', 3, 60000);
 *   if (!cb.isOpen()) {
 *     try { ... cb.recordSuccess(); }
 *     catch (e) { cb.recordFailure(); }
 *   }
 */

export class CircuitBreaker {
  /**
   * @param {string} name - Provider name for logging
   * @param {number} [threshold=3] - Consecutive failures before opening
   * @param {number} [cooldownMs=60000] - Time to stay open before half-open probe
   */
  constructor(name, threshold = 3, cooldownMs = 60000) {
    this.name = name;
    this.threshold = threshold;
    this.cooldownMs = cooldownMs;
    /** @type {number} */
    this.failures = 0;
    /** @type {number|null} Unix timestamp (ms) until which the circuit is open */
    this.openUntil = null;
  }

  /**
   * Returns true if the circuit is currently open (provider should be skipped).
   * Automatically transitions OPEN → CLOSED (half-open reset) when cooldown expires.
   * @returns {boolean}
   */
  isOpen() {
    if (this.openUntil === null) {
      return false;
    }
    if (Date.now() < this.openUntil) {
      // Still in cooldown — circuit is open
      return true;
    }
    // Cooldown expired — half-open: reset and allow next request as a probe
    this.failures = 0;
    this.openUntil = null;
    return false;
  }

  /**
   * Record a successful response. Resets failure count and closes circuit.
   */
  recordSuccess() {
    this.failures = 0;
    this.openUntil = null;
  }

  /**
   * Record a failed response. Opens the circuit if threshold is reached.
   */
  recordFailure() {
    this.failures += 1;
    if (this.failures >= this.threshold) {
      this.openUntil = Date.now() + this.cooldownMs;
    }
  }

  /**
   * Returns the number of consecutive failures recorded.
   * @returns {number}
   */
  getFailureCount() {
    return this.failures;
  }

  /**
   * Returns the ISO timestamp until which the circuit is open, or null.
   * @returns {string|null}
   */
  getOpenUntilISO() {
    return this.openUntil ? new Date(this.openUntil).toISOString() : null;
  }
}

export default CircuitBreaker;
