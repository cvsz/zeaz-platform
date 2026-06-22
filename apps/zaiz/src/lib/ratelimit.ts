// Simple in-memory rate limiter
// Note: In production, this should be replaced with a Redis-backed implementation 
// (e.g., Upstash) to persist across requests and instances.

const LIMIT = 60; // requests per minute
const WINDOW = 60 * 1000; // 1 minute

const requests = new Map<string, { count: number; reset: number }>();

export function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = requests.get(ip) || { count: 0, reset: now + WINDOW };

  if (now > entry.reset) {
    entry.count = 0;
    entry.reset = now + WINDOW;
  }

  entry.count++;
  requests.set(ip, entry);

  return entry.count > LIMIT;
}
