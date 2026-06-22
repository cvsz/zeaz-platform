/**
 * @file rateLimiter.js
 * @description Client-side sliding window rate limiter.
 *
 * Prevents accidental API abuse on free-tier providers.
 * Uses a sliding window: only counts requests within the last windowMs.
 *
 * Usage:
 *   const limiter = createRateLimiter(20, 60000); // 20 requests per minute
 *   limiter.check(); // throws RateLimitError if over limit
 *   limiter.remaining(); // returns count of remaining requests in window
 */

/**
 * Create a sliding window rate limiter.
 * @param {number} maxRequests - Maximum allowed requests per window
 * @param {number} windowMs - Window duration in milliseconds
 * @returns {{ check: () => void, remaining: () => number, reset: () => void }}
 */
export function createRateLimiter(maxRequests, windowMs) {
  /** @type {number[]} */
  let timestamps = [];

  /**
   * Prune timestamps outside the sliding window.
   */
  function prune() {
    const cutoff = Date.now() - windowMs;
    timestamps = timestamps.filter((t) => t > cutoff);
  }

  return {
    /**
     * Check if the request is allowed. Throws if rate limit is exceeded.
     * @throws {Error} with a human-readable message including retry-after seconds
     */
    check() {
      prune();
      if (timestamps.length >= maxRequests) {
        const oldestInWindow = timestamps[0];
        const retryAfterMs = windowMs - (Date.now() - oldestInWindow);
        const retryAfterSec = Math.ceil(Math.max(retryAfterMs, 0) / 1000);
        throw new Error(
          `Rate limit reached (${maxRequests} requests / ${Math.round(windowMs / 1000)}s). ` +
            `Please wait ${retryAfterSec}s before sending another message.`
        );
      }
      timestamps.push(Date.now());
    },

    /**
     * Returns the number of remaining allowed requests in the current window.
     * @returns {number}
     */
    remaining() {
      prune();
      return Math.max(0, maxRequests - timestamps.length);
    },

    /**
     * Reset the rate limiter (e.g. when starting a new chat session).
     */
    reset() {
      timestamps = [];
    },
  };
}

export default createRateLimiter;
