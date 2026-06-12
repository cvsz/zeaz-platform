import { describe, it, expect } from 'vitest'
import { LLMRouter } from '../../providers/router'

describe('LLMRouter', () => {
  it('should initialize with default providers', () => {
    const router = new LLMRouter()
    const status = router.getStatus()
    expect(status.length).toBeGreaterThanOrEqual(6)
  })

  it('should route to a provider', async () => {
    const router = new LLMRouter()
    const route = await router.route({
      messages: [{ role: 'user', content: 'Hello' }],
    })
    expect(route.provider).toBeDefined()
    expect(route.model).toBeDefined()
    expect(route.score).toBeGreaterThanOrEqual(0)
  })

  it('should respect preferred provider', async () => {
    const router = new LLMRouter()
    const route = await router.route({
      messages: [{ role: 'user', content: 'Hello' }],
      preferredProvider: 'gemini',
    })
    expect(route.provider).toBe('gemini')
  })

  it('should handle cost optimization', async () => {
    const router = new LLMRouter({ costOptimization: true })
    const route = await router.route({
      messages: [{ role: 'user', content: 'Hello' }],
      maxCost: 0.000001,
    })
    expect(route.provider).toBeDefined()
  })

  it('should provide provider health status', () => {
    const router = new LLMRouter()
    const status = router.getStatus()
    for (const s of status) {
      expect(s.status).toBe('healthy')
      expect(s.latencyMs).toBeGreaterThan(0)
    }
  })

  it('should retry on failure', async () => {
    const router = new LLMRouter({ maxRetries: 2 })
    const result = await router.routeWithRetry({
      messages: [{ role: 'user', content: 'test' }],
    })
    expect(result.content).toBeDefined()
    expect(result.provider).toBeDefined()
  })

  it('should register custom providers', () => {
    const router = new LLMRouter()
    router.registerProvider({
      id: 'custom' as any,
      name: 'Custom',
      baseUrl: 'http://localhost',
      models: ['custom-model'],
      capabilities: ['chat'],
      costPerToken: { input: 0, output: 0 },
      latencyP50: 100,
      apiKeyEnv: 'CUSTOM_KEY',
    })
    const status = router.getStatus()
    expect(status.find(s => s.providerId === 'custom')).toBeDefined()
  })
})
