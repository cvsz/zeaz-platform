import crypto from 'node:crypto'
import { calcCost } from '../billing/cost.js'
import { enforceQuota } from '../billing/guard.js'
import { recordUsage } from '../billing/meter.js'
import { buildPromptCacheKey, getCachedResponse, setCachedResponse } from './cache.js'
import { routeLLM, recordOutcome } from './router.js'
import { sanitizePrompt } from './safety.js'
import { optimizePrompt } from './token-optimizer.js'

export async function completeAndMeter(tenantId: string, input: string): Promise<string> {
  const maxTokens = Number(process.env.MAX_TOKENS_PER_REQUEST ?? 400)
  const safeInput = sanitizePrompt(input)
  const optimizedInput = optimizePrompt(safeInput, maxTokens)

  const cacheKey = buildPromptCacheKey(tenantId, optimizedInput)
  const cached = await getCachedResponse(cacheKey)
  if (cached) {
    return cached
  }

  const estimatedInputTokens = Math.ceil(optimizedInput.length / 4)
  const estimatedRequestCost = calcCost(estimatedInputTokens + maxTokens)
  enforceQuota(tenantId, estimatedRequestCost)

  const { output, arm } = await routeLLM(optimizedInput)
  recordOutcome(arm, output.length > 0)

  const estimatedTokens = Math.ceil((optimizedInput.length + output.length) / 4)
  const cost = calcCost(estimatedTokens)
  await recordUsage({
    id: `${Date.now()}-${crypto.randomUUID()}`,
    tenant_id: tenantId,
    tokens: estimatedTokens,
    cost,
    type: `llm_${arm}`,
    reference: `llm:${arm}`
  })

  await setCachedResponse(cacheKey, output)

  return output
}
