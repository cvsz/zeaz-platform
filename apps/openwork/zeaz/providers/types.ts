export type ProviderId = 'claude' | 'gpt5' | 'gemini' | 'deepseek' | 'qwen' | 'ollama'

export type ModelCapability = 'chat' | 'code' | 'analysis' | 'vision' | 'reasoning' | 'embedding'

export interface LLMProvider {
  id: ProviderId
  name: string
  baseUrl: string
  models: string[]
  capabilities: ModelCapability[]
  costPerToken: {
    input: number
    output: number
  }
  latencyP50: number
  healthCheckEndpoint?: string
  apiKeyEnv: string
}

export interface LLMRequest {
  model?: string
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>
  temperature?: number
  maxTokens?: number
  stream?: boolean
  capabilities?: ModelCapability[]
  maxCost?: number
  preferredProvider?: ProviderId
}

export interface LLMResponse {
  content: string
  model: string
  provider: ProviderId
  usage: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  metrics: {
    latencyMs: number
    cost: number
  }
}

export interface RouteResult {
  provider: ProviderId
  model: string
  score: number
  reason: string
}

export interface ProviderHealth {
  providerId: ProviderId
  status: 'healthy' | 'degraded' | 'down'
  latencyMs: number
  lastChecked: number
  errorRate: number
}

export interface RouterConfig {
  defaultProvider: ProviderId
  fallbackOrder: ProviderId[]
  maxRetries: number
  costOptimization: boolean
  enableHealthChecks: boolean
  healthCheckIntervalMs: number
}
