import Redis from 'ioredis'
import crypto from 'crypto'

const redis = new Redis(process.env.REDIS_URL ?? 'redis://redis:6379')

export function buildPromptCacheKey(tenantId: string, prompt: string): string {
  return crypto.createHash('sha256').update(`${tenantId}:${prompt}`).digest('hex')
}

export async function getCachedResponse(key: string): Promise<string | null> {
  return redis.get(key)
}

export async function setCachedResponse(key: string, response: string): Promise<void> {
  await redis.set(key, response, 'EX', 3600)
}
