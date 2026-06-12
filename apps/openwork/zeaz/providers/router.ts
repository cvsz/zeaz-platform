import type { ProviderId, LLMProvider, LLMRequest, LLMResponse, RouteResult, ProviderHealth, RouterConfig } from './types'
import { randomUUID } from 'node:crypto'

export class LLMRouter {
  private providers: Map<ProviderId, LLMProvider> = new Map()
  private healthCache: Map<ProviderId, ProviderHealth> = new Map()
  private config: RouterConfig

  constructor(config?: Partial<RouterConfig>) {
    this.config = {
      defaultProvider: 'claude',
      fallbackOrder: ['claude', 'gemini', 'gpt5', 'deepseek', 'qwen', 'ollama'],
      maxRetries: 3,
      costOptimization: true,
      enableHealthChecks: true,
      healthCheckIntervalMs: 60000,
      ...config,
    }
    this.registerDefaults()
    this.initHealthChecks()
  }

  private registerDefaults(): void {
    const defaults: LLMProvider[] = [
      {
        id: 'claude', name: 'Claude', baseUrl: 'https://api.anthropic.com/v1',
        models: ['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-3.5'],
        capabilities: ['chat', 'code', 'analysis', 'vision', 'reasoning'],
        costPerToken: { input: 0.000015, output: 0.000075 },
        latencyP50: 1200, apiKeyEnv: 'ANTHROPIC_API_KEY',
      },
      {
        id: 'gpt5', name: 'GPT-5', baseUrl: 'https://api.openai.com/v1',
        models: ['gpt-5', 'gpt-5-turbo', 'gpt-5-mini'],
        capabilities: ['chat', 'code', 'analysis', 'vision', 'reasoning'],
        costPerToken: { input: 0.00001, output: 0.00004 },
        latencyP50: 900, apiKeyEnv: 'OPENAI_API_KEY',
      },
      {
        id: 'gemini', name: 'Gemini', baseUrl: 'https://generativelanguage.googleapis.com/v1beta',
        models: ['gemini-2.5-pro', 'gemini-2.5-flash'],
        capabilities: ['chat', 'code', 'analysis', 'vision', 'reasoning'],
        costPerToken: { input: 0.000005, output: 0.00002 },
        latencyP50: 600, apiKeyEnv: 'GEMINI_API_KEY',
      },
      {
        id: 'deepseek', name: 'DeepSeek', baseUrl: 'https://api.deepseek.com/v1',
        models: ['deepseek-v4', 'deepseek-coder-v3'],
        capabilities: ['chat', 'code', 'reasoning'],
        costPerToken: { input: 0.000002, output: 0.000008 },
        latencyP50: 1500, apiKeyEnv: 'DEEPSEEK_API_KEY',
      },
      {
        id: 'qwen', name: 'Qwen', baseUrl: 'https://dashscope.aliyuncs.com/api/v1',
        models: ['qwen-max', 'qwen-plus', 'qwen-turbo'],
        capabilities: ['chat', 'code', 'analysis'],
        costPerToken: { input: 0.000001, output: 0.000004 },
        latencyP50: 1800, apiKeyEnv: 'QWEN_API_KEY',
      },
      {
        id: 'ollama', name: 'Ollama', baseUrl: 'http://localhost:11434/api',
        models: ['llama3', 'mixtral', 'codellama'],
        capabilities: ['chat', 'code'],
        costPerToken: { input: 0, output: 0 },
        latencyP50: 2500, apiKeyEnv: 'OLLAMA_BASE_URL',
      },
    ]

    for (const provider of defaults) {
      this.providers.set(provider.id, provider)
    }
  }

  registerProvider(provider: LLMProvider): void {
    this.providers.set(provider.id, provider)
    this.healthCache.set(provider.id, {
      providerId: provider.id,
      status: 'healthy',
      latencyMs: provider.latencyP50,
      lastChecked: Date.now(),
      errorRate: 0,
    })
  }

  async route(request: LLMRequest): Promise<RouteResult> {
    const candidates = await this.evaluateCandidates(request)
    return this.selectBest(candidates, request)
  }

  private async evaluateCandidates(request: LLMRequest): Promise<RouteResult[]> {
    const candidates: RouteResult[] = []
    const providers = request.preferredProvider
      ? [request.preferredProvider]
      : Array.from(this.providers.keys())

    for (const pid of providers) {
      const provider = this.providers.get(pid)
      if (!provider) continue

      const health = this.healthCache.get(pid)
      if (health?.status === 'down') continue

      const score = this.calculateScore(provider, request)
      candidates.push({
        provider: pid,
        model: provider.models[0],
        score,
        reason: this.scoreReason(score, provider),
      })
    }

    return candidates.sort((a, b) => b.score - a.score)
  }

  private calculateScore(provider: LLMProvider, request: LLMRequest): number {
    let score = 100

    if (this.config.costOptimization && request.maxCost) {
      const estimatedCost = provider.costPerToken.input * (request.maxTokens ?? 4096)
      if (estimatedCost > request.maxCost) score -= 50
    }

    if (request.capabilities) {
      const hasAll = request.capabilities.every(c => provider.capabilities.includes(c))
      if (!hasAll) score -= 40
    }

    const health = this.healthCache.get(provider.id)
    if (health) {
      if (health.status === 'degraded') score -= 20
      score -= health.latencyMs / 100
      score -= health.errorRate * 10
    }

    score -= provider.latencyP50 / 100

    return Math.max(0, score)
  }

  private selectBest(candidates: RouteResult[], request: LLMRequest): RouteResult {
    if (candidates.length === 0) {
      const fallback = this.config.fallbackOrder[0]
      const provider = this.providers.get(fallback)
      return {
        provider: fallback,
        model: provider?.models[0] ?? 'unknown',
        score: 0,
        reason: 'Fallback to default provider',
      }
    }
    return candidates[0]
  }

  private scoreReason(score: number, _provider: LLMProvider): string {
    if (score >= 80) return 'Optimal provider selection'
    if (score >= 50) return 'Adequate provider selection'
    return 'Suboptimal provider selected as fallback'
  }

  async routeWithRetry(request: LLMRequest): Promise<LLMResponse> {
    let lastError: Error | null = null

    for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
      try {
        const route = await this.route(request)
        const provider = this.providers.get(route.provider)
        if (!provider) throw new Error(`Provider ${route.provider} not found`)

        const response = await this.sendRequest(provider, route.model, request)
        return response
      } catch (error) {
        lastError = error as Error
        this.markDegraded(request.preferredProvider ?? this.config.defaultProvider)
      }
    }

    throw lastError ?? new Error('All LLM routing attempts failed')
  }

  private async sendRequest(
    provider: LLMProvider,
    model: string,
    request: LLMRequest
  ): Promise<LLMResponse> {
    const startTime = Date.now()

    const providerResponse = await this.callProviderAPI(provider, model, request)

    return {
      content: providerResponse,
      model,
      provider: provider.id,
      usage: {
        inputTokens: request.messages.reduce((sum, m) => sum + m.content.length, 0),
        outputTokens: providerResponse.length,
        totalTokens: 0,
      },
      metrics: {
        latencyMs: Date.now() - startTime,
        cost: provider.costPerToken.input * request.messages.length + provider.costPerToken.output,
      },
    }
  }

  private async callProviderAPI(
    _provider: LLMProvider,
    model: string,
    request: LLMRequest
  ): Promise<string> {
    return `LLM response from ${_provider.name}/${model} for: ${request.messages[request.messages.length - 1]?.content}`
  }

  private markDegraded(providerId: ProviderId): void {
    const existing = this.healthCache.get(providerId)
    this.healthCache.set(providerId, {
      providerId,
      status: 'degraded',
      latencyMs: existing?.latencyMs ?? 9999,
      lastChecked: Date.now(),
      errorRate: (existing?.errorRate ?? 0) + 0.1,
    })
  }

  private initHealthChecks(): void {
    if (!this.config.enableHealthChecks) return

    for (const provider of this.providers.values()) {
      this.healthCache.set(provider.id, {
        providerId: provider.id,
        status: 'healthy',
        latencyMs: provider.latencyP50,
        lastChecked: Date.now(),
        errorRate: 0,
      })
    }
  }

  getStatus(): Array<{ providerId: ProviderId; status: string; latencyMs: number }> {
    return Array.from(this.healthCache.values()).map(h => ({
      providerId: h.providerId,
      status: h.status,
      latencyMs: h.latencyMs,
    }))
  }
}
